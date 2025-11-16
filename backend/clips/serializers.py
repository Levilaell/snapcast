from rest_framework import serializers
from .models import Clip
from videos.serializers import VideoSerializer


class ClipSerializer(serializers.ModelSerializer):
    """Serializer for Clip model"""

    video = VideoSerializer(read_only=True)

    class Meta:
        model = Clip
        fields = [
            'id',
            'video',
            'title',
            'description',
            'start_time',
            'end_time',
            'duration',
            'viral_score',
            'viral_reason',
            'original_clip_path',
            'processed_clip_path',
            'status',
            'error_message',
            'progress_percentage',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClipCreateSerializer(serializers.Serializer):
    """Serializer for creating a new clip"""
    video_id = serializers.IntegerField(required=True)
    moment_index = serializers.IntegerField(required=True)

    def validate_moment_index(self, value):
        """Validate that moment_index is non-negative"""
        if value < 0:
            raise serializers.ValidationError("Moment index must be non-negative")
        return value
