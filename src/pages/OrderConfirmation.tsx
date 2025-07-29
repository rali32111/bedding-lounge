import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, CreditCard, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../lib/currency';
import { getOrderById } from '../lib/supabase';

interface OrderDetails {
  orderId: string;
  orderDate: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  estimatedDelivery: string;
}

const OrderConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderId = searchParams.get('orderId');
      
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching order details for ID:', orderId);
        const order = await getOrderById(orderId);
        
        const orderDetails: OrderDetails = {
          orderId: order.id,
          orderDate: new Date(order.created_at).toLocaleDateString('en-PK'),
          total: order.total_amount,
          items: order.order_items.map((item: any) => ({
            name: item.products.name,
            quantity: item.quantity,
            price: item.unit_price
          })),
          shippingAddress: {
            name: order.shipping_address.name,
            address: order.shipping_address.address,
            city: order.shipping_address.city,
            state: order.shipping_address.state,
            postalCode: order.shipping_address.postal_code
          },
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK')
        };
        
        setOrderDetails(orderDetails);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    

    fetchOrderDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link to="/" className="text-green-600 hover:text-green-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for choosing The Bedding Lounge! Your order has been successfully placed and is being processed.
        </p>
      </motion.div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono text-lg font-semibold">{orderDetails.orderId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="font-semibold text-green-600">✅ Confirmed</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Order Status</p>
              <p className="font-semibold text-blue-600">📦 Processing</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Truck className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Estimated Delivery</p>
              <p className="font-semibold text-orange-600">🚚 {orderDetails.estimatedDelivery}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Items Ordered</h3>
          <div className="space-y-4">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(orderDetails.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Shipping Address</h3>
        <div className="text-gray-700">
          <p className="font-medium">{orderDetails.shippingAddress.name}</p>
          <p>{orderDetails.shippingAddress.address}</p>
          <p>
            {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
          <Download className="w-5 h-5 mr-2" />
          Download Invoice
        </button>
        <Link
          to="/products"
          className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Next Steps */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <p>📧 We'll send you an email confirmation with your order details and payment instructions</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <p>⚡ Your order will be processed and prepared for shipping within 1-2 business days</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <p>📱 You'll receive SMS and email tracking information once your order ships</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <p>🏠 Your order will be delivered to your doorstep within 5-7 business days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;