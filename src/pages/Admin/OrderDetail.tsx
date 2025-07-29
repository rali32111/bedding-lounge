import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, Calendar, Phone, Mail, Edit, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTracking, setEditingTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setOrder(data);
      setTrackingNumber(data.tracking_number || '');
      setShippingCarrier(data.shipping_carrier || '');
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          order_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      setOrder({ ...order, order_status: newStatus as any });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    if (!order) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      setOrder({ ...order, payment_status: newStatus as any });
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const updateTrackingInfo = async () => {
    if (!order) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          shipping_carrier: shippingCarrier,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      setOrder({ 
        ...order, 
        tracking_number: trackingNumber,
        shipping_carrier: shippingCarrier
      });
      setEditingTracking(false);
      toast.success('Tracking information updated');
    } catch (error) {
      console.error('Error updating tracking info:', error);
      toast.error('Failed to update tracking information');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link
            to="/admin/orders"
            className="text-green-600 hover:text-green-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.id.slice(-8)}
          </h1>
          <p className="text-gray-600 mt-1">
            Placed on {new Date(order.created_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Items
            </h2>
            
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={item.products?.image_urls?.[0] || 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt={item.products?.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.products?.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {item.products?.sku}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.unit_price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t mt-6 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Order Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                <div className="text-gray-600 space-y-1">
                  <p className="font-medium">{order.shipping_address.name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Billing Address</h3>
                <div className="text-gray-600 space-y-1">
                  <p className="font-medium">{order.billing_address.name}</p>
                  <p>{order.billing_address.address}</p>
                  <p>
                    {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                  </p>
                  <p>{order.billing_address.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Tracking Information
              </h2>
              {!editingTracking ? (
                <button
                  onClick={() => setEditingTracking(true)}
                  className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={updateTrackingInfo}
                    className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingTracking(false);
                      setTrackingNumber(order.tracking_number || '');
                      setShippingCarrier(order.shipping_carrier || '');
                    }}
                    className="text-gray-600 hover:text-gray-700 flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
            
            {editingTracking ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Carrier
                  </label>
                  <select
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select carrier</option>
                    <option value="TCS">TCS</option>
                    <option value="Leopards">Leopards</option>
                    <option value="Pakistan Post">Pakistan Post</option>
                    <option value="M&P Express">M&P Express</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Tracking Number: </span>
                  <span className="text-gray-900">
                    {order.tracking_number || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Carrier: </span>
                  <span className="text-gray-900">
                    {order.shipping_carrier || 'Not specified'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={order.order_status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border-0 focus:ring-2 focus:ring-green-500 ${getStatusColor(order.order_status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={order.payment_status}
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border-0 focus:ring-2 focus:ring-green-500 ${getPaymentStatusColor(order.payment_status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {new Date(order.created_at || '').toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">
                  {order.payment_method?.replace('_', ' ') || 'Not specified'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">
                  {order.order_items?.length || 0} items
                </span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => updateOrderStatus('processing')}
                disabled={order.order_status === 'processing'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Mark as Processing
              </button>
              
              <button
                onClick={() => updateOrderStatus('shipped')}
                disabled={order.order_status === 'shipped' || order.order_status === 'delivered'}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Mark as Shipped
              </button>
              
              <button
                onClick={() => updateOrderStatus('delivered')}
                disabled={order.order_status === 'delivered'}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Mark as Delivered
              </button>
              
              <button
                onClick={() => updatePaymentStatus('paid')}
                disabled={order.payment_status === 'paid'}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;