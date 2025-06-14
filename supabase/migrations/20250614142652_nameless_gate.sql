/*
  # Create storage bucket for photoboard images

  1. Storage Setup
    - Create 'photoboard-images' bucket for user uploads
    - Set up public access policies
    - Configure file upload restrictions

  2. Security
    - Enable RLS on storage bucket
    - Add policies for authenticated users to upload/view images
    - Restrict file types and sizes
*/

-- Create storage bucket for photoboard images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photoboard-images',
  'photoboard-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Enable RLS on storage bucket
CREATE POLICY "Users can upload photoboard images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photoboard-images');

CREATE POLICY "Users can view photoboard images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'photoboard-images');

CREATE POLICY "Users can update their photoboard images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'photoboard-images');

CREATE POLICY "Users can delete their photoboard images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'photoboard-images');