export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  image_urls: string[];
  sku: string;
  weight?: number;
  dimensions?: string;
  care_instructions?: string;
  rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  shipping_address?: Address;
  billing_address?: Address;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id?: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_date: string;
  total_amount: number;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: Address;
  billing_address: Address;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method: 'cod' | 'bank_transfer';
  tracking_number?: string;
  shipping_carrier?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  review_date: string;
  customer?: Customer;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  product?: Product;
  created_at?: string;
}