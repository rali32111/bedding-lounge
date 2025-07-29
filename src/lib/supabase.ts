import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Test storage connection
export const testStorageConnection = async () => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Storage test failed:', error);
      return false;
    }
    console.log('Storage connection successful');
    return true;
  } catch (error) {
    console.error('Storage connection error:', error);
    return false;
  }
};

export const getProducts = async (category?: string) => {
  let query: any;
  
  try {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }

    query = supabase.from('products').select('*');
  } catch (error) {
    console.error('Error in getProducts:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
    throw new Error('Failed to fetch products: Unknown error occurred');
  }
  
  if (category) {
    query = query.eq('category', category);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getProductById = async (id: string) => {
  console.log('Fetching product with ID:', id);
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
  
  console.log('Product fetched successfully:', data);
  return data;
};

export const getProductReviews = async (productId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customers:customer_id (
        first_name,
        last_name
      )
    `)
    .order('review_date', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const createOrder = async (orderData: any) => {
  console.log('Creating order in database:', orderData);
  console.log('Order data keys:', Object.keys(orderData));
  console.log('Payment method:', orderData.payment_method);
  
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    console.error('Error message:', error.message);
    throw error;
  }
  
  console.log('Order created successfully:', data);
  return data;
};

export const createOrderItems = async (orderItems: any[]) => {
  console.log('Creating order items in database:', orderItems);
  console.log('Number of items:', orderItems.length);
  
  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select();
  
  if (error) {
    console.error('Error creating order items:', error);
    console.error('Error details:', error.details);
    throw error;
  }
  
  console.log('Order items created successfully:', data);
  return data;
};

export const getOrderById = async (orderId: string) => {
  console.log('Fetching order by ID:', orderId);
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('id', orderId)
    .single();
  
  if (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
  
  console.log('Order fetched successfully:', data);
  return data;
};
export const getCustomerOrders = async (customerId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data;
};