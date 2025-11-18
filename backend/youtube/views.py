from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse

@api_view(['GET'])
def youtube_auth(request):
    """
    Mock endpoint for YouTube authentication
    Returns a fake auth URL for development
    """
    return Response({
        'auth_url': 'https://accounts.google.com/o/oauth2/auth?mock=true'
    })

@api_view(['GET'])
def youtube_callback(request):
    """
    Mock endpoint for YouTube OAuth callback
    """
    return HttpResponse('''
        <html>
            <script>
                window.opener.postMessage({
                    type: 'youtube-auth-success'
                }, '*');
                window.close();
            </script>
        </html>
    ''')

@api_view(['POST'])
def publish_to_youtube(request, clip_id):
    """
    Mock endpoint for publishing clip to YouTube
    TODO: Implement real YouTube API integration
    """
    # For now, return mock success response
    return Response({
        'youtube_url': f'https://www.youtube.com/watch?v=mock_video_{clip_id}',
        'youtube_video_id': f'mock_video_{clip_id}'
    })

@api_view(['GET'])
def youtube_status(request, clip_id):
    """
    Mock endpoint for checking YouTube publish status
    """
    return Response({
        'is_published': False,
        'youtube_url': None,
        'youtube_video_id': None
    })
