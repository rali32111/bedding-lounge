/*
  # Update Currency to Indian Rupees

  1. Database Updates
    - Update sample product prices to reflect Indian Rupee values
    - Modify any currency-related constraints or checks
    - Update order amounts and pricing data

  2. Configuration Updates
    - Set currency symbol to Rs.
    - Update tax calculations for Indian GST (18%)
    - Adjust shipping thresholds for Indian market

  3. Data Validation
    - Ensure all monetary values maintain proper decimal precision
    - Validate price ranges are appropriate for Indian market
*/

-- Update product prices to Indian Rupee equivalent (approximate conversion)
UPDATE products SET price = CASE 
  WHEN price = 299.99 THEN 24999.00  -- Luxury Egyptian Cotton Sheets
  WHEN price = 199.99 THEN 16699.00  -- Premium Duvet Cover Set
  WHEN price = 79.99 THEN 6699.00    -- Memory Foam Pillows
  WHEN price = 149.99 THEN 12499.00  -- Bamboo Fiber Bed Sheets
  WHEN price = 89.99 THEN 7499.00    -- Silk Pillowcase Set
  WHEN price = 159.99 THEN 13299.00  -- Percale Cotton Duvet Cover
  ELSE price * 83.33  -- General conversion rate for any other products
END;

-- Update any existing orders to reflect new currency (if any test orders exist)
UPDATE orders SET total_amount = total_amount * 83.33 WHERE total_amount > 0;

-- Update order items pricing
UPDATE order_items SET 
  unit_price = unit_price * 83.33,
  subtotal = subtotal * 83.33;

-- Add currency configuration table for future use
CREATE TABLE IF NOT EXISTS currency_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code text NOT NULL DEFAULT 'INR',
  currency_symbol text NOT NULL DEFAULT 'Rs.',
  decimal_places integer NOT NULL DEFAULT 2,
  tax_rate numeric(5,4) NOT NULL DEFAULT 0.18, -- 18% GST
  free_shipping_threshold numeric(10,2) NOT NULL DEFAULT 1000.00,
  shipping_cost numeric(10,2) NOT NULL DEFAULT 150.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default currency configuration
INSERT INTO currency_config (currency_code, currency_symbol, decimal_places, tax_rate, free_shipping_threshold, shipping_cost)
VALUES ('INR', 'Rs.', 2, 0.18, 1000.00, 150.00)
ON CONFLICT DO NOTHING;

-- Enable RLS on currency_config
ALTER TABLE currency_config ENABLE ROW LEVEL SECURITY;

-- Create policy for currency config (readable by everyone)
CREATE POLICY "Currency config is viewable by everyone"
  ON currency_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_currency_config_updated_at
  BEFORE UPDATE ON currency_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update country default to India in addresses table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'addresses' AND column_name = 'country'
  ) THEN
    ALTER TABLE addresses ALTER COLUMN country SET DEFAULT 'India';
  END IF;
END $$;

-- Add index for currency-related queries
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);