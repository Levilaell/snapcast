from rest_framework import serializers
from .models import Clip
from videos.serializers import VideoSerializer


class ClipSerializer(serializers.ModelSerializer):
    """Serializer for Clip model"""

    video = VideoSerializer(read_only=True)
    video_id = serializers.IntegerField(source='video.id', read_only=True)

    class Meta:
        model = Clip
        fields = [
            'id',
            'video',
            'video_id',
            'moment_index',
            'title',
            'description',
            'start_time',
            'end_time',
            'duration',
            'subtitle_text',
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


class ClipUpdateTimesSerializer(serializers.Serializer):
    """Serializer for updating clip start/end times and reprocessing"""
    start_time = serializers.FloatField(required=True)
    end_time = serializers.FloatField(required=True)

    def validate(self, data):
        """Validate that end_time is after start_time"""
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("end_time must be greater than start_time")
        if data['start_time'] < 0:
            raise serializers.ValidationError("start_time must be non-negative")
        if data['end_time'] - data['start_time'] > 120:  # Max 2 minutes
            raise serializers.ValidationError("Clip duration cannot exceed 120 seconds")
        return data
