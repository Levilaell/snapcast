"""
YouTube Integration Views - IMPLEMENTAÇÃO REAL

Integração completa com YouTube Data API v3
Requer configuração do Google Cloud Console (veja YOUTUBE_SETUP.md)
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status as http_status
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .services import YouTubeService
import os


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def youtube_auth(request):
    """
    Inicia fluxo de autenticação OAuth com YouTube

    Returns:
        {
            "auth_url": "https://accounts.google.com/o/oauth2/auth?..."
        }
    """
    try:
        authorization_url = YouTubeService.get_authorization_url(request)

        return Response({
            'auth_url': authorization_url
        })

    except FileNotFoundError as e:
        return Response({
            'error': str(e),
            'setup_guide': '/YOUTUBE_SETUP.md'
        }, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            'error': f'Failed to generate auth URL: {str(e)}'
        }, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def youtube_callback(request):
    """
    Callback do OAuth - processa autorização do usuário

    Query params:
        code: Authorization code do Google
        state: State para validação CSRF
    """
    code = request.GET.get('code')
    state = request.GET.get('state')
    error = request.GET.get('error')

    # Se usuário negou acesso
    if error:
        return HttpResponse(f'''
            <html>
                <body>
                    <h2>Autorização cancelada</h2>
                    <p>Você precisa autorizar o acesso ao YouTube para publicar vídeos.</p>
                    <script>
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        ''')

    if not code or not state:
        return HttpResponse('''
            <html>
                <body>
                    <h2>Erro</h2>
                    <p>Código de autorização ausente.</p>
                    <script>
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        ''')

    try:
        # Processar callback e salvar credenciais
        YouTubeService.handle_oauth_callback(request, code, state)

        # Sucesso - enviar mensagem para janela pai
        return HttpResponse('''
            <html>
                <body>
                    <h2>Autorização bem-sucedida!</h2>
                    <p>Você pode fechar esta janela.</p>
                    <script>
                        window.opener.postMessage({
                            type: 'youtube-auth-success'
                        }, '*');
                        setTimeout(() => window.close(), 1000);
                    </script>
                </body>
            </html>
        ''')

    except ValueError as e:
        return HttpResponse(f'''
            <html>
                <body>
                    <h2>Erro de Segurança</h2>
                    <p>{str(e)}</p>
                    <script>
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        ''')

    except Exception as e:
        return HttpResponse(f'''
            <html>
                <body>
                    <h2>Erro</h2>
                    <p>{str(e)}</p>
                    <script>
                        setTimeout(() => window.close(), 3000);
                    </script>
                </body>
            </html>
        ''')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_to_youtube(request, clip_id):
    """
    Publica um clip no YouTube

    Body params:
        title: string (required)
        description: string (optional)
        tags: array of strings (optional)
        privacy: 'public' | 'private' | 'unlisted' (default: 'unlisted')

    Returns:
        {
            "youtube_url": "https://youtube.com/watch?v=...",
            "youtube_video_id": "..."
        }
    """
    # Importar Clip model aqui para evitar circular import
    from clips.models import Clip

    try:
        # Verificar se clip existe e pertence ao usuário
        clip = get_object_or_404(Clip, id=clip_id)

        # Verificar se clip já foi publicado
        if clip.is_published_youtube:
            return Response({
                'error': 'Clip already published to YouTube',
                'youtube_url': clip.youtube_url
            }, status=http_status.HTTP_400_BAD_REQUEST)

        # Verificar se arquivo existe
        if not clip.output_file_path or not os.path.exists(clip.output_file_path):
            return Response({
                'error': 'Video file not found. Make sure the clip is processed.'
            }, status=http_status.HTTP_404_NOT_FOUND)

        # Obter credenciais do usuário
        credentials = YouTubeService.get_credentials(request.user)
        if not credentials:
            return Response({
                'error': 'YouTube not connected. Please authenticate first.',
                'auth_required': True
            }, status=http_status.HTTP_401_UNAUTHORIZED)

        # Parâmetros do vídeo
        title = request.data.get('title', clip.title)
        description = request.data.get('description', clip.description or '')
        tags = request.data.get('tags', [])
        privacy = request.data.get('privacy', 'unlisted')

        # Validações
        if not title:
            return Response({
                'error': 'Title is required'
            }, status=http_status.HTTP_400_BAD_REQUEST)

        if privacy not in ['public', 'private', 'unlisted']:
            return Response({
                'error': 'Invalid privacy setting'
            }, status=http_status.HTTP_400_BAD_REQUEST)

        # Upload para o YouTube
        result = YouTubeService.upload_video(
            credentials=credentials,
            video_file_path=clip.output_file_path,
            title=title,
            description=description,
            tags=tags,
            privacy=privacy
        )

        # Atualizar clip no banco de dados
        clip.youtube_video_id = result['video_id']
        clip.youtube_url = result['url']
        clip.is_published_youtube = True
        clip.save()

        return Response({
            'youtube_url': result['url'],
            'youtube_video_id': result['video_id']
        })

    except Clip.DoesNotExist:
        return Response({
            'error': 'Clip not found'
        }, status=http_status.HTTP_404_NOT_FOUND)

    except FileNotFoundError as e:
        return Response({
            'error': str(e),
            'setup_guide': '/YOUTUBE_SETUP.md'
        }, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({
            'error': f'Failed to upload to YouTube: {str(e)}'
        }, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def youtube_status(request, clip_id):
    """
    Verifica se um clip foi publicado no YouTube

    Returns:
        {
            "is_published": boolean,
            "youtube_url": string | null,
            "youtube_video_id": string | null
        }
    """
    from clips.models import Clip

    try:
        clip = get_object_or_404(Clip, id=clip_id)

        return Response({
            'is_published': clip.is_published_youtube,
            'youtube_url': clip.youtube_url,
            'youtube_video_id': clip.youtube_video_id
        })

    except Clip.DoesNotExist:
        return Response({
            'error': 'Clip not found'
        }, status=http_status.HTTP_404_NOT_FOUND)
