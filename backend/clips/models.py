from django.db import models
from videos.models import Video


class Clip(models.Model):
    """Model to store processed video clips"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('downloading', 'Downloading'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='clips')

    # Clip details
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    start_time = models.FloatField()  # in seconds
    end_time = models.FloatField()  # in seconds
    duration = models.FloatField()  # in seconds
    subtitle_text = models.TextField(blank=True)  # Transcript text for display only (not burned into video)

    # Viral score from analysis
    viral_score = models.FloatField(default=0.0)
    viral_reason = models.TextField(blank=True)  # Why this moment is viral

    # File paths
    original_clip_path = models.CharField(max_length=500, blank=True)  # Downloaded segment
    processed_clip_path = models.CharField(max_length=500, blank=True)  # Final vertical clip

    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True)
    progress_percentage = models.IntegerField(default=0)

    # YouTube Integration
    youtube_video_id = models.CharField(max_length=100, blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    is_published_youtube = models.BooleanField(default=False)
    youtube_published_at = models.DateTimeField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-viral_score', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.start_time}s - {self.end_time}s) - Score: {self.viral_score}"

    @property
    def output_file_path(self):
        """Retorna o caminho do arquivo final processado"""
        return self.processed_clip_path if self.processed_clip_path else self.original_clip_path
