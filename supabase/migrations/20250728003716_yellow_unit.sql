/*
  # Fix Storage Policies for Product Images

  1. Storage Policy Updates
    - Drop all existing conflicting policies
    - Create new policies that properly allow authenticated users to upload images
    - Ensure bucket exists and is public
    - Fix RLS policies for storage.objects table

  2. Security
    - Allow authenticated users to upload, update, and delete images
    - Allow public read access for product images
    - Proper bucket configuration
*/

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

-- Create comprehensive policies for the product-images bucket
CREATE POLICY "Allow authenticated users to upload to product-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to update product-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to delete from product-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Allow public read access to product-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Also allow anonymous users to read (for public product display)
CREATE POLICY "Allow anonymous read access to product-images"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'product-images');

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated role
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;