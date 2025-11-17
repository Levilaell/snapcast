-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create episodes table
CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER, -- duration in seconds
  category TEXT,
  cover_image TEXT,
  description TEXT,
  episode_number INTEGER,
  status TEXT DEFAULT 'uploading', -- uploading, processing, ready, error
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on episodes
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Episodes policies
CREATE POLICY "Users can view their own episodes"
  ON public.episodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own episodes"
  ON public.episodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episodes"
  ON public.episodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episodes"
  ON public.episodes FOR DELETE
  USING (auth.uid() = user_id);

-- Create clips table
CREATE TABLE public.clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time INTEGER NOT NULL, -- start time in seconds
  end_time INTEGER NOT NULL, -- end time in seconds
  duration INTEGER NOT NULL, -- duration in seconds
  caption_style TEXT DEFAULT 'minimal', -- minimal, bold, typewriter, karaoke, subtitle
  status TEXT DEFAULT 'pending', -- pending, processing, ready, error
  video_url TEXT,
  thumbnail_url TEXT,
  virality_score INTEGER, -- 0-100 score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on clips
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- Clips policies
CREATE POLICY "Users can view their own clips"
  ON public.clips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clips"
  ON public.clips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips"
  ON public.clips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips"
  ON public.clips FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER episodes_updated_at
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER clips_updated_at
  BEFORE UPDATE ON public.clips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage buckets for audio files and cover images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('episode-audio', 'episode-audio', false),
  ('episode-covers', 'episode-covers', true),
  ('clip-videos', 'clip-videos', true);

-- Storage policies for episode audio (private)
CREATE POLICY "Users can upload their own episode audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'episode-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own episode audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'episode-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own episode audio"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'episode-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own episode audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'episode-audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for episode covers (public)
CREATE POLICY "Anyone can view episode covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'episode-covers');

CREATE POLICY "Users can upload episode covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'episode-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own episode covers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'episode-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own episode covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'episode-covers' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for clip videos (public)
CREATE POLICY "Anyone can view clip videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clip-videos');

CREATE POLICY "Users can upload clip videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clip-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own clip videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clip-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own clip videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clip-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );