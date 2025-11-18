from django.db import models
from django.contrib.auth.models import User


class YouTubeCredential(models.Model):
    """
    Armazena as credenciais OAuth do YouTube para cada usuário
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='youtube_credential')
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_uri = models.CharField(max_length=255, default='https://oauth2.googleapis.com/token')
    client_id = models.CharField(max_length=255)
    client_secret = models.CharField(max_length=255)
    scopes = models.JSONField(default=list)
    expiry = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'youtube_credentials'
        verbose_name = 'YouTube Credential'
        verbose_name_plural = 'YouTube Credentials'

    def __str__(self):
        return f"YouTube Credentials for {self.user.username}"
