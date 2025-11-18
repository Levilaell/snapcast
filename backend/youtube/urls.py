from django.urls import path
from . import views

urlpatterns = [
    path('youtube/auth/', views.youtube_auth, name='youtube-auth'),
    path('youtube/callback/', views.youtube_callback, name='youtube-callback'),
    path('clips/<int:clip_id>/publish-youtube/', views.publish_to_youtube, name='publish-youtube'),
    path('clips/<int:clip_id>/youtube-status/', views.youtube_status, name='youtube-status'),
]
