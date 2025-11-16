from django.db import models
import json


class Video(models.Model):
    """Model to store YouTube video information and analysis results"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    youtube_url = models.URLField(max_length=500)
    youtube_id = models.CharField(max_length=100)
    title = models.CharField(max_length=500, blank=True)
    duration = models.IntegerField(null=True, blank=True)  # in seconds
    thumbnail_url = models.URLField(max_length=500, blank=True)

    # Transcript data
    transcript = models.TextField(blank=True)
    transcript_with_timestamps = models.JSONField(default=dict, blank=True)

    # Analysis results
    viral_moments = models.JSONField(default=list, blank=True)

    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title or self.youtube_id} - {self.status}"

    def get_viral_moments_sorted(self):
        """Return viral moments sorted by score descending"""
        moments = self.viral_moments if isinstance(self.viral_moments, list) else []
        return sorted(moments, key=lambda x: x.get('viral_score', 0), reverse=True)
