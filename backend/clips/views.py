from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Clip
from .serializers import ClipSerializer, ClipCreateSerializer
from .services import VideoProcessingService
from videos.models import Video


class ClipViewSet(viewsets.ModelViewSet):
    """ViewSet for Clip CRUD operations"""

    queryset = Clip.objects.all()
    serializer_class = ClipSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return ClipCreateSerializer
        return ClipSerializer

    def create(self, request):
        """Create a new clip from a viral moment"""
        serializer = ClipCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        video_id = serializer.validated_data['video_id']
        moment_index = serializer.validated_data['moment_index']

        # Get video
        try:
            video = Video.objects.get(id=video_id)
        except Video.DoesNotExist:
            return Response(
                {'error': 'Video not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if video analysis is complete
        if video.status != 'completed':
            return Response(
                {'error': 'Video analysis not completed yet'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get viral moment
        viral_moments = video.get_viral_moments_sorted()
        if moment_index >= len(viral_moments):
            return Response(
                {'error': 'Invalid moment index'},
                status=status.HTTP_400_BAD_REQUEST
            )

        moment = viral_moments[moment_index]

        # Check if clip already exists
        existing_clip = Clip.objects.filter(
            video=video,
            start_time=moment['start_time'],
            end_time=moment['end_time']
        ).first()

        if existing_clip:
            return Response(
                ClipSerializer(existing_clip).data,
                status=status.HTTP_200_OK
            )

        # Create clip record
        clip = Clip.objects.create(
            video=video,
            title=moment.get('title', ''),
            description=moment.get('description', ''),
            start_time=moment['start_time'],
            end_time=moment['end_time'],
            duration=moment.get('duration', moment['end_time'] - moment['start_time']),
            viral_score=moment.get('viral_score', 0),
            viral_reason=moment.get('viral_reason', ''),
            status='pending'
        )

        # Process clip asynchronously (in a real app, use Celery)
        # For MVP, we'll do it synchronously
        try:
            self._process_clip(clip, video)
            return Response(
                ClipSerializer(clip).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            clip.status = 'failed'
            clip.error_message = str(e)
            clip.save()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_clip(self, clip, video):
        """Process clip: download, crop, add subtitles, convert to vertical"""
        processing_service = VideoProcessingService()

        # Update status
        clip.status = 'downloading'
        clip.progress_percentage = 10
        clip.save()

        # Download segment
        original_filename = f"clip_{clip.id}_original.mp4"
        original_path = processing_service.download_clip_segment(
            video.youtube_url,
            clip.start_time,
            clip.end_time,
            original_filename
        )
        clip.original_clip_path = original_path
        clip.progress_percentage = 40
        clip.save()

        # Update status
        clip.status = 'processing'
        clip.progress_percentage = 50
        clip.save()

        # Get subtitle text from transcript
        subtitle_text = processing_service.get_clip_subtitle_text(
            video.transcript_with_timestamps,
            clip.start_time,
            clip.end_time
        )

        # Create vertical clip with subtitles
        processed_filename = f"clip_{clip.id}_final.mp4"
        processed_path = processing_service.create_vertical_clip_with_subtitles(
            original_path,
            processed_filename,
            subtitle_text,
            0,  # Start from beginning of clip
            clip.duration
        )
        clip.processed_clip_path = processed_path
        clip.progress_percentage = 90
        clip.save()

        # Complete
        clip.status = 'completed'
        clip.progress_percentage = 100
        clip.save()

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Get download URL for processed clip"""
        clip = self.get_object()

        if clip.status != 'completed':
            return Response(
                {'error': 'Clip processing not completed yet'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not clip.processed_clip_path:
            return Response(
                {'error': 'Processed clip not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Return file path (in production, use proper file serving)
        return Response({
            'download_url': clip.processed_clip_path,
            'filename': f"{clip.title.replace(' ', '_')}.mp4"
        })
