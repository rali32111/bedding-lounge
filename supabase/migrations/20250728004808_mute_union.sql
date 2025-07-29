-- Setup Supabase Storage for Real Image Uploads
-- Run this in your Supabase SQL Editor

-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

-- Create simple policies that allow all operations on product-images bucket
-- Note: In production, you might want more restrictive policies

-- Allow anyone to upload to product-images bucket
CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow anyone to view product images (needed for public display)
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow anyone to update product images
CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- Allow anyone to delete product images
CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');