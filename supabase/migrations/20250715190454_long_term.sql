/*
  # Allow anonymous users to create orders

  1. Security Changes
    - Update RLS policy to allow anonymous users to insert orders
    - Maintain security for viewing orders (only authenticated users can view their own)
    - Allow guest checkout functionality

  2. Changes
    - Drop existing restrictive INSERT policy
    - Create new policy allowing both anonymous and authenticated users to create orders
    - Keep SELECT policy restrictive to authenticated users only
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create new policy that allows anonymous users to insert orders
CREATE POLICY "Allow anonymous and authenticated users to create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure SELECT policy remains secure (only authenticated users can view their own orders)
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());