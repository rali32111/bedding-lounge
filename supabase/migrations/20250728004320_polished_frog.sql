/*
  # Fix Products Table RLS Policies - Final Fix

  1. Security Updates
    - Drop all existing conflicting policies on products table
    - Create proper INSERT, UPDATE, DELETE policies for authenticated users
    - Ensure public can still read products

  2. Changes
    - Allow authenticated users to insert, update, and delete products
    - Maintain public read access for the storefront
*/

-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Enable RLS on products table (in case it's not enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public to read products (for the storefront)
CREATE POLICY "Public can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update products
CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete products
CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);