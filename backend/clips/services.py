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

    def create_vertical_clip_with_subtitles(
        self,
        input_path,
        output_filename,
        subtitle_text,
        start_time,
        duration
    ):
        """Create vertical (9:16) clip with burned-in animated subtitles"""

        output_path = self.clips_dir / output_filename

        # Split subtitle into manageable chunks
        words = subtitle_text.split()
        subtitle_chunks = []
        chunk_size = 5  # 5 words per subtitle line

        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i+chunk_size])
            subtitle_chunks.append(chunk)

        # Create subtitle file (SRT format)
        srt_path = self.clips_dir / f"{output_filename}.srt"
        with open(srt_path, 'w', encoding='utf-8') as f:
            chunk_duration = duration / len(subtitle_chunks)
            for i, chunk in enumerate(subtitle_chunks):
                start = i * chunk_duration
                end = (i + 1) * chunk_duration

                f.write(f"{i+1}\n")
                f.write(f"{self._format_srt_time(start)} --> {self._format_srt_time(end)}\n")
                f.write(f"{chunk}\n\n")

        # FFmpeg command to create vertical clip with subtitles
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-vf', (
                # Crop to vertical 9:16
                "scale=1080:1920:force_original_aspect_ratio=increase,"
                "crop=1080:1920,"
                # Add subtitles
                f"subtitles={srt_path}:force_style='"
                "FontName=Arial Bold,"
                "FontSize=32,"
                "PrimaryColour=&H00FFFFFF,"
                "OutlineColour=&H00000000,"
                "BackColour=&H80000000,"
                "BorderStyle=3,"
                "Outline=2,"
                "Shadow=0,"
                "MarginV=100,"
                "Alignment=2'"
            ),
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

            # Clean up subtitle file
            if srt_path.exists():
                srt_path.unlink()

            if result.returncode == 0:
                return str(output_path)
            else:
                raise Exception(f"FFmpeg error: {result.stderr}")

        except subprocess.TimeoutExpired:
            raise Exception("Processing timeout")
        except Exception as e:
            raise Exception(f"Processing failed: {str(e)}")
        finally:
            # Clean up subtitle file in case of error
            if srt_path.exists():
                srt_path.unlink()

    @staticmethod
    def _format_srt_time(seconds):
        """Format seconds to SRT timestamp format (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    def get_clip_subtitle_text(self, transcript_with_timestamps, start_time, end_time):
        """Extract subtitle text for the clip duration from transcript"""
        subtitle_text = []

        for entry in transcript_with_timestamps:
            entry_start = entry['start']
            entry_end = entry_start + entry['duration']

            # Check if entry overlaps with clip duration
            if entry_start < end_time and entry_end > start_time:
                subtitle_text.append(entry['text'])

        return ' '.join(subtitle_text)
