import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { formatCurrency, getFreeShippingMessage } from '../lib/currency';

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getShippingCost, getTaxAmount, getFinalTotal } = useCart();

  const shippingCost = getShippingCost();
  const tax = getTaxAmount();
  const total = getFinalTotal();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Start Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-4 bg-white p-6 rounded-lg shadow-sm border"
              >
                <Link to={`/products/${item.product.id}`}>
                  <img
                    src={item.product.image_urls[0] || 'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-md hover:opacity-80 transition-opacity"
                  />
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/products/${item.product.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {item.product.description}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-600 hover:text-red-700 transition-colors mt-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 mt-4">
                {getFreeShippingMessage(getCartTotal())}
              </p>
            </div>
            
            <Link
              to="/checkout"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium text-center block mt-6 flex items-center justify-center"
            >
              🛒 
              Proceed to Checkout
            </Link>
            
            <Link
              to="/products"
              className="w-full text-center block mt-4 text-green-600 hover:text-green-700 transition-colors"
            >
              🛍️ 
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;