/*
  # Fix orders table RLS policy for anonymous users

  1. Security Changes
    - Update orders table RLS policies to allow anonymous users to create orders
    - Allow both authenticated and anonymous users to insert orders
    - Maintain security for viewing orders (only own orders)

  2. Changes Made
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy that allows both authenticated and anonymous users
    - Keep SELECT policy restrictive to authenticated users only
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Customers can create orders" ON orders;

-- Create new INSERT policy that allows both authenticated and anonymous users
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure SELECT policy allows users to view their own orders (authenticated users only)
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());