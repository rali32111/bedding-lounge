/*
  # Update orders table for new payment methods

  1. Changes
    - Add payment_method column to orders table
    - Update order status and payment status constraints
    - Add indexes for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add payment_method column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text DEFAULT 'cod';
  END IF;
END $$;

-- Add constraint for payment_method
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_payment_method_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
    CHECK (payment_method = ANY (ARRAY['cod'::text, 'bank_transfer'::text]));
  END IF;
END $$;

-- Add index for payment_method
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Update existing orders to have default payment method
UPDATE orders SET payment_method = 'cod' WHERE payment_method IS NULL;