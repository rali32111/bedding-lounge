# SQL Commands to Run in Supabase SQL Editor

## Step 1: Fix Products RLS Policy

Copy and paste this SQL code into the SQL Editor and click "Run":

```sql
/*
  # Fix Products Table RLS Policy

  1. Security Updates
    - Add INSERT policy for products table to allow authenticated users to add products
    - Add UPDATE policy for products table to allow authenticated users to edit products
    - Add DELETE policy for products table to allow authenticated users to delete products

  2. Changes
    - Allow authenticated users to insert, update, and delete products
    - Maintain existing read policies for public access
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Add policy to allow authenticated users to insert products
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add policy to allow authenticated users to update products
CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add policy to allow authenticated users to delete products
CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);
```

## Step 2: Ensure Storage Bucket Setup

After the first command succeeds, copy and paste this SQL code and click "Run":

```sql
/*
  # Ensure Storage Bucket Setup

  1. Storage Setup
    - Ensure product-images bucket exists
    - Set up proper permissions for image uploads
    - Configure public access for product images

  2. Security
    - Allow authenticated users to upload, update, and delete images
    - Allow public read access for product images
*/

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow public read access to product images
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

## Instructions:

1. **Copy the first SQL block** (Step 1) and paste it into the SQL Editor
2. **Click "Run"** and wait for success
3. **Copy the second SQL block** (Step 2) and paste it into the SQL Editor  
4. **Click "Run"** and wait for success

Do NOT type the filenames - only copy and paste the actual SQL code!