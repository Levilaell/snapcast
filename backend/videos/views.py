from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Video
from .serializers import VideoSerializer, VideoCreateSerializer
from .services import YouTubeService, GeminiService


class VideoViewSet(viewsets.ModelViewSet):
    """ViewSet for Video CRUD operations"""

    queryset = Video.objects.all()
    serializer_class = VideoSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return VideoCreateSerializer
        return VideoSerializer

    def create(self, request):
        """Create a new video analysis from YouTube URL"""
        serializer = VideoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        youtube_url = serializer.validated_data['youtube_url']

        # Initialize services
        youtube_service = YouTubeService()
        gemini_service = GeminiService()

        # Extract video ID
        video_id = youtube_service.extract_video_id(youtube_url)
        if not video_id:
            return Response(
                {'error': 'Invalid YouTube URL'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if video already exists
        existing_video = Video.objects.filter(youtube_id=video_id).first()
        if existing_video:
            return Response(
                VideoSerializer(existing_video).data,
                status=status.HTTP_200_OK
            )

        # Create video record
        video = Video.objects.create(
            youtube_url=youtube_url,
            youtube_id=video_id,
            status='processing'
        )

        try:
            # Get video details
            video_details = youtube_service.get_video_details(video_id)
            if video_details:
                video.title = video_details['title']
                video.duration = video_details['duration']
                video.thumbnail_url = video_details['thumbnail_url']
                video.save()

            # Get transcript
            transcript_data = youtube_service.get_transcript(video_id)
            video.transcript = transcript_data['transcript']
            video.transcript_with_timestamps = transcript_data['transcript_with_timestamps']
            video.save()

            if not video.transcript:
                video.status = 'failed'
                video.error_message = 'No transcript available for this video'
                video.save()
                return Response(
                    VideoSerializer(video).data,
                    status=status.HTTP_200_OK
                )

            # Analyze viral moments with Gemini
            viral_moments = gemini_service.analyze_viral_moments(
                video.transcript,
                video.transcript_with_timestamps
            )
            video.viral_moments = viral_moments
            video.status = 'completed'
            video.save()

            return Response(
                VideoSerializer(video).data,
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            video.status = 'failed'
            video.error_message = str(e)
            video.save()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def reanalyze(self, request, pk=None):
        """Re-analyze video for viral moments"""
        video = self.get_object()

        if not video.transcript:
            return Response(
                {'error': 'No transcript available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            video.status = 'processing'
            video.save()

            gemini_service = GeminiService()
            viral_moments = gemini_service.analyze_viral_moments(
                video.transcript,
                video.transcript_with_timestamps
            )

            video.viral_moments = viral_moments
            video.status = 'completed'
            video.save()

            return Response(VideoSerializer(video).data)

        except Exception as e:
            video.status = 'failed'
            video.error_message = str(e)
            video.save()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
