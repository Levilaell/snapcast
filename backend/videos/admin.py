from django.contrib import admin
from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'youtube_id', 'status', 'duration', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'youtube_id', 'youtube_url']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Video Info', {
            'fields': ('youtube_url', 'youtube_id', 'title', 'duration', 'thumbnail_url')
        }),
        ('Transcript', {
            'fields': ('transcript', 'transcript_with_timestamps'),
            'classes': ('collapse',)
        }),
        ('Analysis', {
            'fields': ('viral_moments', 'status', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
