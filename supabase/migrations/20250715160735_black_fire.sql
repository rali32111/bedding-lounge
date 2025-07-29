/*
  # Create E-commerce Database Schema

  1. New Tables
    - `customers` - Customer account information
    - `products` - Product catalog with details
    - `orders` - Customer orders
    - `order_items` - Individual items within orders
    - `reviews` - Product reviews and ratings
    - `addresses` - Customer shipping/billing addresses
    - `wishlist` - Customer wishlist items

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure customer data access

  3. Features
    - Product catalog with categories
    - Order management system
    - Customer reviews
    - Wishlist functionality
    - Address management
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('shipping', 'billing')),
  street_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'United States',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  image_urls text[] DEFAULT '{}',
  sku text UNIQUE NOT NULL,
  weight decimal(8,2),
  dimensions text,
  care_instructions text,
  rating decimal(3,2),
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_date timestamptz DEFAULT now(),
  total_amount decimal(10,2) NOT NULL,
  order_status text NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb NOT NULL,
  billing_address jsonb NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  tracking_number text,
  shipping_carrier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  review_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, customer_id)
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Customers can read own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own data"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for addresses
CREATE POLICY "Customers can manage own addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (customer_id = auth.uid());

-- Create policies for products
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Create policies for order_items
CREATE POLICY "Customers can view own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  ));

CREATE POLICY "Customers can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  ));

-- Create policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can delete own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());

-- Create policies for wishlist
CREATE POLICY "Customers can manage own wishlist"
  ON wishlist
  FOR ALL
  TO authenticated
  USING (customer_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_customer_id ON wishlist(customer_id);
CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON addresses(customer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();