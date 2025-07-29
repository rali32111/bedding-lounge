import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/currency';
import toast from 'react-hot-toast';

interface StockAlert {
  id: string;
  product_name: string;
  current_stock: number;
  low_stock_threshold: number;
  status: 'low' | 'out_of_stock';
}

const StockManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchStockAlerts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, low_stock_threshold')
        .or('stock_quantity.lte.5,stock_quantity.eq.0');
      
      if (error) throw error;
      
      const alerts: StockAlert[] = (data || []).map(product => ({
        id: product.id,
        product_name: product.name,
        current_stock: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold || 5,
        status: product.stock_quantity === 0 ? 'out_of_stock' : 'low'
      }));
      
      setStockAlerts(alerts);
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
    }
  };

  const updateStock = async (productId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', productId);
      
      if (error) throw error;
      
      toast.success('Stock updated successfully');
      fetchProducts();
      fetchStockAlerts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Stock Management</h1>
        
        {/* Stock Alerts */}
        {stockAlerts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <h2 className="text-lg font-semibold text-yellow-800">Stock Alerts</h2>
            </div>
            <div className="space-y-2">
              {stockAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between">
                  <span className="text-yellow-700">
                    {alert.product_name} - {alert.current_stock} units remaining
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.status === 'out_of_stock' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {alert.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Categories</option>
            <option value="bedsheets">Bedsheets</option>
            <option value="duvet-covers">Duvet Covers</option>
            <option value="pillows">Pillows</option>
            <option value="blankets">Blankets</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <ProductStockRow
                key={product.id}
                product={product}
                onUpdateStock={updateStock}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ProductStockRowProps {
  product: Product;
  onUpdateStock: (productId: string, newQuantity: number) => void;
}

const ProductStockRow: React.FC<ProductStockRowProps> = ({ product, onUpdateStock }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(product.stock_quantity);

  const handleSave = () => {
    onUpdateStock(product.id, newQuantity);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewQuantity(product.stock_quantity);
    setIsEditing(false);
  };

  const getStockStatus = () => {
    if (product.stock_quantity === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (product.stock_quantity <= 5) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  const status = getStockStatus();

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={product.image_urls[0] || 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=100'}
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover mr-3"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500 capitalize">{product.category.replace('-', ' ')}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.sku}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(product.price)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            min="0"
          />
        ) : (
          <span className="text-sm text-gray-900">{product.stock_quantity}</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
          {status.text}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-900"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
};

export default StockManager;