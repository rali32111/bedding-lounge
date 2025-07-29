/*
  # Add Stock Tracking Features

  1. New Tables
    - `stock_history` - Track all stock changes with timestamps and reasons
    - Add low_stock_threshold column to products table

  2. Features
    - Stock change logging
    - Low stock alerts
    - Stock movement tracking
    - Audit trail for inventory changes

  3. Security
    - Enable RLS on stock_history table
    - Add policies for stock management
*/

-- Add low_stock_threshold column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'low_stock_threshold'
  ) THEN
    ALTER TABLE products ADD COLUMN low_stock_threshold integer DEFAULT 5;
  END IF;
END $$;

-- Create stock_history table
CREATE TABLE IF NOT EXISTS stock_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity_change integer NOT NULL,
  previous_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  reason text NOT NULL CHECK (reason IN ('sale', 'restock', 'adjustment', 'return', 'damaged', 'expired')),
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES customers(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_created_at ON stock_history(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_history_reason ON stock_history(reason);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(stock_quantity) WHERE stock_quantity <= 10;

-- Enable RLS on stock_history
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- Create policies for stock_history
CREATE POLICY "Stock history is viewable by authenticated users"
  ON stock_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert stock history"
  ON stock_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to automatically log stock changes
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if stock_quantity actually changed
  IF OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity THEN
    INSERT INTO stock_history (
      product_id,
      quantity_change,
      previous_quantity,
      new_quantity,
      reason,
      notes
    ) VALUES (
      NEW.id,
      NEW.stock_quantity - OLD.stock_quantity,
      OLD.stock_quantity,
      NEW.stock_quantity,
      'adjustment',
      'Automatic stock update'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic stock logging
DROP TRIGGER IF EXISTS trigger_log_stock_change ON products;
CREATE TRIGGER trigger_log_stock_change
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_change();

-- Create function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(threshold_override integer DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  name text,
  sku text,
  stock_quantity integer,
  low_stock_threshold integer,
  category text,
  price decimal(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock_quantity,
    p.low_stock_threshold,
    p.category,
    p.price
  FROM products p
  WHERE p.stock_quantity <= COALESCE(threshold_override, p.low_stock_threshold)
  ORDER BY p.stock_quantity ASC, p.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get stock movement summary
CREATE OR REPLACE FUNCTION get_stock_movement_summary(
  product_id_param uuid,
  days_back integer DEFAULT 30
)
RETURNS TABLE (
  total_sales integer,
  total_restocks integer,
  total_adjustments integer,
  net_change integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN reason = 'sale' THEN ABS(quantity_change) ELSE 0 END), 0)::integer as total_sales,
    COALESCE(SUM(CASE WHEN reason = 'restock' THEN quantity_change ELSE 0 END), 0)::integer as total_restocks,
    COALESCE(SUM(CASE WHEN reason = 'adjustment' THEN quantity_change ELSE 0 END), 0)::integer as total_adjustments,
    COALESCE(SUM(quantity_change), 0)::integer as net_change
  FROM stock_history
  WHERE product_id = product_id_param
    AND created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;