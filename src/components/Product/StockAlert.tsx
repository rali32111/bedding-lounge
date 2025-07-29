import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Package, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStockTracking } from '../../hooks/useStockTracking';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/currency';

interface StockAlertProps {
  onClose?: () => void;
  threshold?: number;
}

const StockAlert: React.FC<StockAlertProps> = ({ onClose, threshold = 5 }) => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { getLowStockProducts } = useStockTracking();

  useEffect(() => {
    const checkLowStock = async () => {
      const products = await getLowStockProducts(threshold);
      setLowStockProducts(products);
      setIsVisible(products.length > 0);
    };

    checkLowStock();
    
    // Check every 5 minutes
    const interval = setInterval(checkLowStock, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [threshold, getLowStockProducts]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || lowStockProducts.length === 0) {
    return null;
  }

  const outOfStockCount = lowStockProducts.filter(p => p.stock_quantity === 0).length;
  const lowStockCount = lowStockProducts.filter(p => p.stock_quantity > 0 && p.stock_quantity <= threshold).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <div className="bg-white rounded-lg shadow-lg border border-orange-200 overflow-hidden">
          {/* Header */}
          <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-orange-800">
                  Stock Alert
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-orange-600 hover:text-orange-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-center space-x-4 mb-3">
              {outOfStockCount > 0 && (
                <div className="flex items-center space-x-1 text-red-600">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">{outOfStockCount} out of stock</span>
                </div>
              )}
              {lowStockCount > 0 && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">{lowStockCount} low stock</span>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      SKU: {product.sku} • {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="ml-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock_quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {product.stock_quantity === 0 ? 'Out' : `${product.stock_quantity} left`}
                    </span>
                  </div>
                </div>
              ))}
              
              {lowStockProducts.length > 5 && (
                <div className="text-center py-2">
                  <span className="text-sm text-gray-500">
                    +{lowStockProducts.length - 5} more products need attention
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-orange-600 text-white text-sm font-medium py-2 px-3 rounded hover:bg-orange-700 transition-colors">
                Manage Stock
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StockAlert;