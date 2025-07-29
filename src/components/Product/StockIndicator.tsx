import React from 'react';
import { AlertTriangle, Package, CheckCircle } from 'lucide-react';

interface StockIndicatorProps {
  stockQuantity: number;
  lowStockThreshold?: number;
  showQuantity?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StockIndicator: React.FC<StockIndicatorProps> = ({
  stockQuantity,
  lowStockThreshold = 5,
  showQuantity = false,
  size = 'md',
  className = ''
}) => {
  const getStockStatus = () => {
    if (stockQuantity === 0) {
      return {
        status: 'out_of_stock',
        text: 'Out of Stock',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: AlertTriangle
      };
    } else if (stockQuantity <= lowStockThreshold) {
      return {
        status: 'low_stock',
        text: showQuantity ? `Only ${stockQuantity} left` : 'Low Stock',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        icon: AlertTriangle
      };
    } else {
      return {
        status: 'in_stock',
        text: showQuantity ? `${stockQuantity} in stock` : 'In Stock',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle
      };
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const stockInfo = getStockStatus();
  const Icon = stockInfo.icon;

  return (
    <div className={`inline-flex items-center space-x-1 rounded-full font-medium ${stockInfo.bgColor} ${stockInfo.color} ${sizeClasses[size]} ${className}`}>
      <Icon className={iconSizes[size]} />
      <span>{stockInfo.text}</span>
    </div>
  );
};

export default StockIndicator;