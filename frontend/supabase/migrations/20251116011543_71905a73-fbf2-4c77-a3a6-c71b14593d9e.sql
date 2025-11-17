-- Add YouTube-specific columns to episodes table
ALTER TABLE public.episodes
ADD COLUMN IF NOT EXISTS youtube_url text,
ADD COLUMN IF NOT EXISTS transcript_data jsonb,
ADD COLUMN IF NOT EXISTS viral_scores jsonb,
ADD COLUMN IF NOT EXISTS youtube_video_id text;

-- Make audio_url optional since we'll be working with YouTube videos
ALTER TABLE public.episodes
ALTER COLUMN audio_url DROP NOT NULL;

-- Add index for faster YouTube URL lookups
CREATE INDEX IF NOT EXISTS idx_episodes_youtube_video_id ON public.episodes(youtube_video_id);

-- Update clips table to include viral score and thumbnail
ALTER TABLE public.clips
ADD COLUMN IF NOT EXISTS transcript_text text,
ADD COLUMN IF NOT EXISTS viral_reason text;

-- Add comment to document the new structure
COMMENT ON COLUMN public.episodes.youtube_url IS 'Full YouTube URL provided by user';
COMMENT ON COLUMN public.episodes.youtube_video_id IS 'Extracted YouTube video ID for API calls';
COMMENT ON COLUMN public.episodes.transcript_data IS 'Full transcript with timestamps from YouTube API';
COMMENT ON COLUMN public.episodes.viral_scores IS 'AI-analyzed segments with viral potential scores';