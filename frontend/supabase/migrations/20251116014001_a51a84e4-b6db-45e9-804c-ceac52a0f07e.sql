-- Create storage bucket for video clips
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-clips',
  'video-clips',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Create RLS policies for video clips bucket
CREATE POLICY "Users can view all clips"
ON storage.objects FOR SELECT
USING (bucket_id = 'video-clips');

CREATE POLICY "Users can upload their own clips"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'video-clips' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own clips"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'video-clips' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own clips"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'video-clips' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);