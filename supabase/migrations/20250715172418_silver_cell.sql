/*
  # Add payment_method column to orders table

  1. Changes
    - Add payment_method column to orders table
    - Set default value to 'cod'
    - Add check constraint for valid payment methods
    - Update existing orders to have default payment method

  2. Security
    - No changes to RLS policies needed
*/

-- Add payment_method column to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'cod'::text;
  END IF;
END $$;

-- Add check constraint for valid payment methods
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'orders' AND constraint_name = 'orders_payment_method_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
    CHECK (payment_method = ANY (ARRAY['cod'::text, 'bank_transfer'::text]));
  END IF;
END $$;

-- Create index for payment method queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);