from django.contrib import admin
from .models import Clip


@admin.register(Clip)
class ClipAdmin(admin.ModelAdmin):
    list_display = ['title', 'video', 'viral_score', 'status', 'progress_percentage', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description', 'video__title']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Clip Info', {
            'fields': ('video', 'title', 'description', 'start_time', 'end_time', 'duration')
        }),
        ('Viral Analysis', {
            'fields': ('viral_score', 'viral_reason')
        }),
        ('Files', {
            'fields': ('original_clip_path', 'processed_clip_path')
        }),
        ('Processing', {
            'fields': ('status', 'progress_percentage', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
