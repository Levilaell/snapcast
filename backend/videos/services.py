import re
import google.generativeai as genai
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings
from youtube_transcript_api import YouTubeTranscriptApi
from .models import Video


class YouTubeService:
    """Service for interacting with YouTube API"""

    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.youtube = build('youtube', 'v3', developerKey=self.api_key)

    @staticmethod
    def extract_video_id(url):
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
            r'youtube\.com\/embed\/([^&\n?#]+)',
            r'youtube\.com\/v\/([^&\n?#]+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def get_video_details(self, video_id):
        """Get video details from YouTube API"""
        try:
            response = self.youtube.videos().list(
                part='snippet,contentDetails,statistics',
                id=video_id
            ).execute()

            if not response['items']:
                return None

            item = response['items'][0]
            snippet = item['snippet']
            content_details = item['contentDetails']

            # Parse duration (PT format)
            duration_str = content_details['duration']
            duration = self._parse_duration(duration_str)

            return {
                'title': snippet['title'],
                'description': snippet['description'],
                'thumbnail_url': snippet['thumbnails']['high']['url'],
                'duration': duration,
            }
        except HttpError as e:
            print(f"YouTube API error: {e}")
            return None

    @staticmethod
    def _parse_duration(duration_str):
        """Parse ISO 8601 duration to seconds"""
        import re
        pattern = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')
        match = pattern.match(duration_str)
        if not match:
            return 0

        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)

        return hours * 3600 + minutes * 60 + seconds

    @staticmethod
    def get_transcript(video_id):
        """Get video transcript with timestamps - API v1.2.3+"""
        try:
            print(f"Trying to get transcript for video: {video_id}")

            # Initialize API (instance-based approach for v1.2.3+)
            ytt_api = YouTubeTranscriptApi()

            # Fetch transcript with language preference
            # Tries languages in order: PT-BR, PT, EN
            fetched_transcript = ytt_api.fetch(
                video_id,
                languages=['pt-BR', 'pt', 'en'],
                preserve_formatting=True
            )

            print(f"✓ Got transcript with {len(fetched_transcript)} entries")

            # Convert to raw data (list of dicts)
            transcript_data = fetched_transcript.to_raw_data()

            # Format transcript with timestamps
            formatted_transcript = []
            full_text = []

            for entry in transcript_data:
                formatted_transcript.append({
                    'text': entry.get('text', ''),
                    'start': entry.get('start', 0),
                    'duration': entry.get('duration', 0)
                })
                full_text.append(entry.get('text', ''))

            result = {
                'transcript': ' '.join(full_text),
                'transcript_with_timestamps': formatted_transcript
            }

            print(f"✓ Successfully formatted transcript: {len(full_text)} segments, {len(' '.join(full_text))} chars")
            return result

        except Exception as e:
            print(f"❌ Transcript error: {e}")
            import traceback
            traceback.print_exc()
            return {
                'transcript': '',
                'transcript_with_timestamps': []
            }


class GeminiService:
    """Service for analyzing video content with Gemini API"""

    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_viral_moments(self, transcript, transcript_with_timestamps):
        """Analyze transcript and identify viral moments"""

        prompt = f"""
Você é um especialista em identificar momentos virais em podcasts e vídeos longos.

Analise a seguinte transcrição e identifique de 5 a 10 momentos com maior potencial viral para Reels/Shorts/TikTok.

Para cada momento, considere:
1. Histórias interessantes ou impactantes
2. Momentos de humor ou risadas
3. Conselhos práticos e valiosos
4. Declarações polêmicas ou impactantes
5. Revelações ou informações surpreendentes

Para cada momento, retorne um JSON com:
- start_time: tempo de início em segundos (EXATO do timestamp da transcrição)
- end_time: tempo de fim em segundos (EXATO do timestamp da transcrição, máximo 90 segundos de duração)
- title: título curto e chamativo que DESCREVA O CONTEÚDO do momento (máx 60 caracteres)
- description: descrição do momento que RESUMA O QUE É DITO (máx 200 caracteres)
- viral_score: pontuação de 0-100 indicando potencial viral
- viral_reason: breve explicação de por que esse momento é viral
- category: uma das categorias (historia, humor, conselho, polemica, revelacao)
- transcript_preview: primeiras palavras da transcrição deste momento (para validação)

CRÍTICO:
- Use os timestamps EXATOS dos dados fornecidos abaixo
- O título e descrição devem BATER com o conteúdo da transcrição entre start_time e end_time
- A duração de cada momento deve ser entre 15 e 90 segundos
- Retorne APENAS um array JSON válido, sem texto adicional
- Ordene os momentos por viral_score (maior primeiro)

Transcrição:
{transcript}

Timestamps disponíveis para referência (start = início em segundos, duration = duração):
{transcript_with_timestamps[:100]}
"""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean up the response to extract JSON
            if '```json' in result_text:
                result_text = result_text.split('```json')[1].split('```')[0]
            elif '```' in result_text:
                result_text = result_text.split('```')[1].split('```')[0]

            # Parse JSON
            import json
            moments = json.loads(result_text.strip())

            # Validate and filter moments
            validated_moments = []
            for moment in moments:
                duration = moment.get('end_time', 0) - moment.get('start_time', 0)
                if 15 <= duration <= 90 and moment.get('viral_score', 0) > 0:
                    moment['duration'] = duration
                    validated_moments.append(moment)

            return validated_moments[:10]  # Return top 10

        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return []
