"""
YouTube Integration Service - IMPLEMENTAÇÃO REAL

Este serviço implementa a integração completa com YouTube Data API v3
Baseado em: https://developers.google.com/youtube/v3/guides/uploading_a_video
"""

import os
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError
from django.conf import settings
from .models import YouTubeCredential
from datetime import datetime, timedelta


class YouTubeService:
    """
    Serviço para interagir com YouTube Data API v3
    """

    SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
    API_SERVICE_NAME = 'youtube'
    API_VERSION = 'v3'

    @staticmethod
    def get_client_config():
        """
        Lê configuração do client_secrets.json
        """
        client_secrets_file = getattr(
            settings,
            'YOUTUBE_CLIENT_SECRETS_FILE',
            os.path.join(settings.BASE_DIR, 'client_secrets.json')
        )

        if not os.path.exists(client_secrets_file):
            raise FileNotFoundError(
                f"client_secrets.json não encontrado em {client_secrets_file}. "
                "Veja YOUTUBE_SETUP.md para configurar."
            )

        with open(client_secrets_file, 'r') as f:
            client_config = json.load(f)

        return client_config

    @staticmethod
    def create_oauth_flow(redirect_uri):
        """
        Cria um Flow do OAuth 2.0 para autenticação
        """
        client_config = YouTubeService.get_client_config()

        flow = Flow.from_client_config(
            client_config,
            scopes=YouTubeService.SCOPES,
            redirect_uri=redirect_uri
        )

        return flow

    @staticmethod
    def get_authorization_url(request):
        """
        Gera URL de autorização OAuth
        """
        redirect_uri = request.build_absolute_uri('/api/youtube/callback/')

        flow = YouTubeService.create_oauth_flow(redirect_uri)

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'  # Força mostrar tela de consentimento para obter refresh_token
        )

        # Salvar state na sessão para validação posterior
        request.session['youtube_oauth_state'] = state

        return authorization_url

    @staticmethod
    def handle_oauth_callback(request, code, state):
        """
        Processa callback do OAuth e salva credenciais
        """
        # Validar state
        saved_state = request.session.get('youtube_oauth_state')
        if state != saved_state:
            raise ValueError("State parameter mismatch. Possible CSRF attack.")

        redirect_uri = request.build_absolute_uri('/api/youtube/callback/')
        flow = YouTubeService.create_oauth_flow(redirect_uri)

        # Trocar código por token
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Salvar credenciais no banco de dados
        client_config = YouTubeService.get_client_config()
        web_config = client_config.get('web', client_config.get('installed', {}))

        YouTubeCredential.objects.update_or_create(
            user=request.user,
            defaults={
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': web_config.get('client_id'),
                'client_secret': web_config.get('client_secret'),
                'scopes': list(credentials.scopes),
                'expiry': credentials.expiry,
            }
        )

        return credentials

    @staticmethod
    def get_credentials(user):
        """
        Recupera e atualiza credenciais do usuário
        """
        try:
            yt_cred = YouTubeCredential.objects.get(user=user)

            credentials = Credentials(
                token=yt_cred.access_token,
                refresh_token=yt_cred.refresh_token,
                token_uri=yt_cred.token_uri,
                client_id=yt_cred.client_id,
                client_secret=yt_cred.client_secret,
                scopes=yt_cred.scopes
            )

            # Se o token expirou, atualizar
            if yt_cred.expiry and datetime.now(yt_cred.expiry.tzinfo) >= yt_cred.expiry:
                from google.auth.transport.requests import Request
                credentials.refresh(Request())

                # Salvar novo token
                yt_cred.access_token = credentials.token
                yt_cred.expiry = credentials.expiry
                yt_cred.save()

            return credentials

        except YouTubeCredential.DoesNotExist:
            return None

    @staticmethod
    def upload_video(credentials, video_file_path, title, description, tags, privacy, category_id='22'):
        """
        Faz upload de um vídeo para o YouTube

        Args:
            credentials: Credenciais OAuth do Google
            video_file_path: Caminho do arquivo de vídeo
            title: Título do vídeo
            description: Descrição do vídeo
            tags: Lista de tags
            privacy: 'public', 'private', ou 'unlisted'
            category_id: ID da categoria (22 = People & Blogs)

        Returns:
            dict com 'video_id' e 'url'
        """
        if not os.path.exists(video_file_path):
            raise FileNotFoundError(f"Video file not found: {video_file_path}")

        youtube = build(
            YouTubeService.API_SERVICE_NAME,
            YouTubeService.API_VERSION,
            credentials=credentials
        )

        body = {
            'snippet': {
                'title': title[:100],  # Máximo 100 caracteres
                'description': description[:5000],  # Máximo 5000 caracteres
                'tags': tags[:500] if tags else [],  # Máximo 500 tags
                'categoryId': category_id
            },
            'status': {
                'privacyStatus': privacy,
                'selfDeclaredMadeForKids': False,
            }
        }

        # Upload do vídeo
        media = MediaFileUpload(
            video_file_path,
            chunksize=1024*1024,  # 1MB chunks
            resumable=True,
            mimetype='video/mp4'
        )

        try:
            request = youtube.videos().insert(
                part=','.join(body.keys()),
                body=body,
                media_body=media
            )

            response = None
            while response is None:
                status, response = request.next_chunk()
                if status:
                    print(f"Upload {int(status.progress() * 100)}% complete")

            video_id = response['id']
            video_url = f"https://www.youtube.com/watch?v={video_id}"

            return {
                'video_id': video_id,
                'url': video_url,
                'response': response
            }

        except HttpError as e:
            error_content = json.loads(e.content.decode('utf-8'))
            error_message = error_content.get('error', {}).get('message', str(e))
            raise Exception(f"YouTube API Error: {error_message}")

    @staticmethod
    def delete_video(credentials, video_id):
        """
        Deleta um vídeo do YouTube
        """
        youtube = build(
            YouTubeService.API_SERVICE_NAME,
            YouTubeService.API_VERSION,
            credentials=credentials
        )

        try:
            youtube.videos().delete(id=video_id).execute()
            return True
        except HttpError as e:
            raise Exception(f"Failed to delete video: {str(e)}")

    @staticmethod
    def get_video_info(credentials, video_id):
        """
        Busca informações de um vídeo
        """
        youtube = build(
            YouTubeService.API_SERVICE_NAME,
            YouTubeService.API_VERSION,
            credentials=credentials
        )

        try:
            request = youtube.videos().list(
                part='snippet,status,statistics',
                id=video_id
            )
            response = request.execute()

            if response.get('items'):
                return response['items'][0]
            return None

        except HttpError as e:
            raise Exception(f"Failed to get video info: {str(e)}")
