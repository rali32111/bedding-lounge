import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, TrendingUp, Clock, CheckCircle, AlertTriangle, DollarSign, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/currency';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');
      
      if (ordersError) throw ordersError;

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;

      // Fetch recent orders with details
      const { data: recentOrders, error: recentError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentError) throw recentError;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(order => order.order_status === 'pending').length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const totalProducts = products?.length || 0;
      const lowStockProducts = products?.filter(product => product.stock_quantity <= 5).length || 0;

      setStats({
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalProducts,
        lowStockProducts,
        recentOrders: recentOrders || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      link: '/admin/orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/admin/orders?status=pending'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      link: '/admin/orders'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
      link: '/admin/products'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/admin/products'
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your store management dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              to={card.link}
              className="block bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View All Orders
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      #{order.id.slice(-8)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.shipping_address.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.order_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.order_status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {stats.recentOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/products/add"
          className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Package className="w-8 h-8 mb-2" />
          <h3 className="text-lg font-semibold">Add New Product</h3>
          <p className="text-green-100">Add products to your store</p>
        </Link>
        
        <Link
          to="/admin/orders"
          className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingCart className="w-8 h-8 mb-2" />
          <h3 className="text-lg font-semibold">Manage Orders</h3>
          <p className="text-blue-100">View and update order status</p>
        </Link>
        
        <Link
          to="/admin/settings"
          className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Settings className="w-8 h-8 mb-2" />
          <h3 className="text-lg font-semibold">Website Settings</h3>
          <p className="text-purple-100">Configure your website settings</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;