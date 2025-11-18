# Integração com YouTube - Guia de Implementação Backend

Este documento descreve como implementar os endpoints necessários para a integração com YouTube no backend.

## Visão Geral

A integração permite que usuários publiquem seus clips diretamente no YouTube através do SnapCast.

## Pré-requisitos

### 1. Google Cloud Console Setup

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite a **YouTube Data API v3**
4. Configure a tela de consentimento OAuth:
   - User Type: External
   - App name: SnapCast
   - Scopes: `https://www.googleapis.com/auth/youtube.upload`

### 2. Credenciais OAuth 2.0

1. Vá em **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: Web application
3. Authorized redirect URIs:
   - `http://localhost:8000/api/youtube/callback/` (desenvolvimento)
   - `https://seu-dominio.com/api/youtube/callback/` (produção)
4. Baixe o arquivo JSON de credenciais

### 3. Instalação de Dependências

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

## Implementação dos Endpoints

### 1. Modelo de Dados

Adicione os seguintes campos ao modelo `Clip`:

```python
# models.py
class Clip(models.Model):
    # ... campos existentes ...

    # YouTube integration
    youtube_video_id = models.CharField(max_length=100, null=True, blank=True)
    youtube_url = models.URLField(null=True, blank=True)
    is_published_youtube = models.BooleanField(default=False)
    youtube_published_at = models.DateTimeField(null=True, blank=True)
```

Crie um modelo para armazenar tokens OAuth dos usuários:

```python
# models.py
class YouTubeCredentials(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_uri = models.CharField(max_length=255)
    client_id = models.CharField(max_length=255)
    client_secret = models.CharField(max_length=255)
    scopes = models.JSONField()
    expiry = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 2. Configurações

```python
# settings.py
YOUTUBE_CLIENT_SECRETS_FILE = os.path.join(BASE_DIR, 'client_secrets.json')
YOUTUBE_API_SERVICE_NAME = 'youtube'
YOUTUBE_API_VERSION = 'v3'
YOUTUBE_UPLOAD_SCOPE = 'https://www.googleapis.com/auth/youtube.upload'
```

### 3. Serviço YouTube

Crie um arquivo `services/youtube_service.py`:

```python
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from django.conf import settings
import os

class YouTubeService:

    @staticmethod
    def get_auth_url(request):
        """Gera URL de autenticação OAuth"""
        flow = Flow.from_client_secrets_file(
            settings.YOUTUBE_CLIENT_SECRETS_FILE,
            scopes=[settings.YOUTUBE_UPLOAD_SCOPE],
            redirect_uri=request.build_absolute_uri('/api/youtube/callback/')
        )

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )

        # Salvar state na sessão para validação posterior
        request.session['youtube_oauth_state'] = state

        return authorization_url

    @staticmethod
    def handle_callback(request, code, state):
        """Processa callback OAuth e salva credenciais"""
        flow = Flow.from_client_secrets_file(
            settings.YOUTUBE_CLIENT_SECRETS_FILE,
            scopes=[settings.YOUTUBE_UPLOAD_SCOPE],
            redirect_uri=request.build_absolute_uri('/api/youtube/callback/'),
            state=state
        )

        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Salvar credenciais no banco de dados
        YouTubeCredentials.objects.update_or_create(
            user=request.user,
            defaults={
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes,
                'expiry': credentials.expiry,
            }
        )

        return credentials

    @staticmethod
    def get_credentials(user):
        """Recupera credenciais do usuário"""
        try:
            creds = YouTubeCredentials.objects.get(user=user)
            return Credentials(
                token=creds.access_token,
                refresh_token=creds.refresh_token,
                token_uri=creds.token_uri,
                client_id=creds.client_id,
                client_secret=creds.client_secret,
                scopes=creds.scopes
            )
        except YouTubeCredentials.DoesNotExist:
            return None

    @staticmethod
    def upload_video(credentials, video_file_path, title, description, tags, privacy):
        """Faz upload de vídeo para o YouTube"""
        youtube = build(
            settings.YOUTUBE_API_SERVICE_NAME,
            settings.YOUTUBE_API_VERSION,
            credentials=credentials
        )

        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': tags,
                'categoryId': '22'  # People & Blogs
            },
            'status': {
                'privacyStatus': privacy,
                'selfDeclaredMadeForKids': False,
            }
        }

        media = MediaFileUpload(
            video_file_path,
            chunksize=-1,  # Upload completo de uma vez
            resumable=True,
            mimetype='video/mp4'
        )

        request = youtube.videos().insert(
            part=','.join(body.keys()),
            body=body,
            media_body=media
        )

        response = request.execute()

        return {
            'video_id': response['id'],
            'url': f"https://www.youtube.com/watch?v={response['id']}"
        }
```

### 4. Views/Endpoints

```python
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .services.youtube_service import YouTubeService
from .models import Clip
from datetime import datetime

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def youtube_auth(request):
    """Endpoint: GET /api/youtube/auth/"""
    auth_url = YouTubeService.get_auth_url(request)
    return Response({'auth_url': auth_url})

@api_view(['GET'])
def youtube_callback(request):
    """Endpoint: GET /api/youtube/callback/"""
    code = request.GET.get('code')
    state = request.GET.get('state')

    # Validar state
    if state != request.session.get('youtube_oauth_state'):
        return Response(
            {'error': 'Invalid state parameter'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        YouTubeService.handle_callback(request, code, state)

        # Redirecionar de volta para o frontend com mensagem de sucesso
        return Response('''
            <html>
                <script>
                    window.opener.postMessage({
                        type: 'youtube-auth-success'
                    }, '*');
                    window.close();
                </script>
            </html>
        ''')
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_to_youtube(request, clip_id):
    """Endpoint: POST /api/clips/{clip_id}/publish-youtube/"""
    try:
        clip = Clip.objects.get(id=clip_id, video__user=request.user)
    except Clip.DoesNotExist:
        return Response(
            {'error': 'Clip not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Verificar se já foi publicado
    if clip.is_published_youtube:
        return Response(
            {'error': 'Clip already published to YouTube'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verificar se o arquivo existe
    if not clip.output_file_path or not os.path.exists(clip.output_file_path):
        return Response(
            {'error': 'Video file not found'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Obter credenciais do YouTube
    credentials = YouTubeService.get_credentials(request.user)
    if not credentials:
        return Response(
            {'error': 'YouTube not connected. Please authenticate first.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Parâmetros do vídeo
    title = request.data.get('title', clip.title)
    description = request.data.get('description', clip.description or '')
    tags = request.data.get('tags', [])
    privacy = request.data.get('privacy', 'unlisted')

    try:
        # Upload para o YouTube
        result = YouTubeService.upload_video(
            credentials=credentials,
            video_file_path=clip.output_file_path,
            title=title,
            description=description,
            tags=tags,
            privacy=privacy
        )

        # Atualizar clip no banco
        clip.youtube_video_id = result['video_id']
        clip.youtube_url = result['url']
        clip.is_published_youtube = True
        clip.youtube_published_at = datetime.now()
        clip.save()

        return Response({
            'youtube_url': result['url'],
            'youtube_video_id': result['video_id']
        })

    except Exception as e:
        return Response(
            {'error': f'Failed to upload to YouTube: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def youtube_status(request, clip_id):
    """Endpoint: GET /api/clips/{clip_id}/youtube-status/"""
    try:
        clip = Clip.objects.get(id=clip_id, video__user=request.user)
    except Clip.DoesNotExist:
        return Response(
            {'error': 'Clip not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        'is_published': clip.is_published_youtube,
        'youtube_url': clip.youtube_url,
        'youtube_video_id': clip.youtube_video_id
    })
```

### 5. URLs

```python
# urls.py
urlpatterns = [
    # ... URLs existentes ...

    # YouTube integration
    path('youtube/auth/', youtube_auth, name='youtube-auth'),
    path('youtube/callback/', youtube_callback, name='youtube-callback'),
    path('clips/<int:clip_id>/publish-youtube/', publish_to_youtube, name='publish-youtube'),
    path('clips/<int:clip_id>/youtube-status/', youtube_status, name='youtube-status'),
]
```

## Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Limitações e Quotas

- **Quota diária**: 10.000 unidades/dia (padrão)
- **Upload de vídeo**: 1.600 unidades
- **Uploads/dia**: ~6 vídeos
- Para aumentar quota: [YouTube Quota Extension Request](https://support.google.com/youtube/contact/yt_api_form)

## Segurança

1. **Nunca commitar** o arquivo `client_secrets.json`
2. Adicionar ao `.gitignore`:
   ```
   client_secrets.json
   ```
3. Usar variáveis de ambiente em produção
4. Validar sempre o `state` no callback OAuth
5. Verificar permissões do usuário antes de publicar

## Testes

```python
# tests.py
from django.test import TestCase
from unittest.mock import patch, MagicMock

class YouTubeIntegrationTestCase(TestCase):

    @patch('services.youtube_service.YouTubeService.upload_video')
    def test_publish_to_youtube(self, mock_upload):
        mock_upload.return_value = {
            'video_id': 'test123',
            'url': 'https://youtube.com/watch?v=test123'
        }

        # Testar endpoint de publicação
        # ...
```

## Troubleshooting

### Erro: "Access Not Configured"
- Verifique se a YouTube Data API v3 está habilitada no Google Cloud Console

### Erro: "Invalid Credentials"
- Verifique se o arquivo client_secrets.json está correto
- Confirme que o redirect_uri está configurado corretamente

### Erro: "Quota Exceeded"
- Você atingiu o limite diário de 10.000 unidades
- Solicite aumento de quota ou aguarde até o próximo dia

## Recursos Adicionais

- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [YouTube API Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
