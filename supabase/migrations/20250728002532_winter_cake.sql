/*
  # Fix Products Table RLS Policy

  1. Security Updates
    - Add INSERT policy for products table to allow authenticated users to add products
    - This enables the admin interface to create new products

  2. Changes
    - Allow authenticated users to insert products
    - Maintain existing read policies for public access
*/

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