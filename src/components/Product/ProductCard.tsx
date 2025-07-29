import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../lib/currency';
import StockIndicator from './StockIndicator';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success('Added to cart!');
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success('Added to wishlist!');
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image_urls[0] || 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=600'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleAddToWishlist}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>
        <button
          onClick={handleAddToCart}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center space-x-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating || 0)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">
            ({product.review_count || 0})
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          <StockIndicator 
            stockQuantity={product.stock_quantity}
            showQuantity={product.stock_quantity <= 10}
            size="sm"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;