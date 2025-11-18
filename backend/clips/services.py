import os
import subprocess
from pathlib import Path
from django.conf import settings


class VideoProcessingService:
    """Service for processing video clips with yt-dlp and FFmpeg"""

    def __init__(self):
        self.media_root = settings.MEDIA_ROOT
        self.clips_dir = Path(self.media_root) / 'clips'
        self.clips_dir.mkdir(parents=True, exist_ok=True)

    def download_clip_segment(self, youtube_url, start_time, end_time, output_filename):
        """Download specific segment of video using yt-dlp"""

        output_path = self.clips_dir / output_filename

        # Calculate duration
        duration = end_time - start_time

        print(f"=== yt-dlp download parameters ===")
        print(f"URL: {youtube_url}")
        print(f"Start: {start_time}s, End: {end_time}s, Duration: {duration}s")
        print(f"Section parameter: *{start_time}-{end_time}")

        # yt-dlp command to download segment
        cmd = [
            'yt-dlp',
            '--download-sections',
            f'*{start_time}-{end_time}',
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--merge-output-format', 'mp4',
            '-o', str(output_path),
            youtube_url
        ]

        print(f"Command: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )

            if result.returncode == 0:
                return str(output_path)
            else:
                raise Exception(f"yt-dlp error: {result.stderr}")

        except subprocess.TimeoutExpired:
            raise Exception("Download timeout")
        except Exception as e:
            raise Exception(f"Download failed: {str(e)}")

    def create_vertical_clip(self, input_path, output_filename):
        """Create vertical (9:16) clip"""

        output_path = self.clips_dir / output_filename

        # Just crop to vertical - no subtitles
        video_filter = (
            "scale=1080:1920:force_original_aspect_ratio=increase,"
            "crop=1080:1920"
        )

        cmd = [
            'ffmpeg',
            '-i', str(input_path),
            '-vf', video_filter,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-ar', '44100',
            '-y',  # Overwrite output file
            str(output_path)
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes timeout
            )

            if result.returncode == 0:
                return str(output_path)
            else:
                raise Exception(f"FFmpeg error: {result.stderr}")

        except subprocess.TimeoutExpired:
            raise Exception("Processing timeout")
        except Exception as e:
            raise Exception(f"Processing failed: {str(e)}")

    def get_clip_subtitle_text(self, transcript_with_timestamps, start_time, end_time):
        """Extract subtitle text for the clip duration from transcript"""
        subtitle_text = []

        print(f"=== Extracting subtitle text ===")
        print(f"Looking for text between {start_time}s and {end_time}s")
        print(f"Total transcript entries: {len(transcript_with_timestamps)}")

        matched_count = 0
        for entry in transcript_with_timestamps:
            entry_start = entry['start']
            entry_end = entry_start + entry['duration']

            # Check if entry overlaps with clip duration
            if entry_start < end_time and entry_end > start_time:
                subtitle_text.append(entry['text'])
                matched_count += 1
                if matched_count <= 3:  # Show first 3 matches
                    print(f"  Match: [{entry_start:.1f}s - {entry_end:.1f}s] {entry['text'][:50]}...")

        print(f"Total matched entries: {matched_count}")
        result = ' '.join(subtitle_text)
        print(f"Final subtitle text length: {len(result)} chars")
        if len(result) > 0:
            print(f"First 100 chars: {result[:100]}...")

        return result
