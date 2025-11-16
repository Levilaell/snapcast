from rest_framework import serializers
from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    """Serializer for Video model"""

    viral_moments_sorted = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            'id',
            'youtube_url',
            'youtube_id',
            'title',
            'duration',
            'thumbnail_url',
            'transcript',
            'transcript_with_timestamps',
            'viral_moments',
            'viral_moments_sorted',
            'status',
            'error_message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'viral_moments_sorted']

    def get_viral_moments_sorted(self, obj):
        """Get viral moments sorted by score"""
        return obj.get_viral_moments_sorted()


class VideoCreateSerializer(serializers.Serializer):
    """Serializer for creating a new video analysis"""
    youtube_url = serializers.URLField(required=True)

    def validate_youtube_url(self, value):
        """Validate that the URL is a valid YouTube URL"""
        if 'youtube.com' not in value and 'youtu.be' not in value:
            raise serializers.ValidationError("Please provide a valid YouTube URL")
        return value
