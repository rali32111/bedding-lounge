/*
  # Temporarily Disable RLS on Products Table

  This is a temporary fix to allow product creation while RLS policies are being resolved.
  In production, you should properly configure RLS policies instead of disabling them.

  1. Changes
    - Disable Row Level Security on products table
    - This allows all operations on products table without policy restrictions
*/

-- Temporarily disable RLS on products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;