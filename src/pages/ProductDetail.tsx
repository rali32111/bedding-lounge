import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, Shield, RefreshCw, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product, Review } from '../types';
import { getProductById, getProductReviews } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import toast from 'react-hot-toast';
import ImageGallery from '../components/Product/ImageGallery';
import StockIndicator from '../components/Product/StockIndicator';

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      // Validate UUID format
      if (!isValidUUID(id)) {
        setError('Invalid product ID format');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        // Fetch product details
        const productData = await getProductById(id);
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        setProduct(productData);
        
        // Fetch product reviews
        const reviewsData = await getProductReviews(id);
        setReviews(reviewsData || []);
        
      } catch (err) {
        console.error('Error fetching product:', err);
        // Check if it's a "not found" error vs other errors
        if (err && typeof err === 'object' && 'code' in err && err.code === 'PGRST116') {
          setError('Product not found');
        } else {
          setError('Failed to load product details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock_quantity < quantity) {
      toast.error('Not enough stock available');
      return;
    }
    
    addToCart(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    toast.success('Added to wishlist!');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-md"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : product.rating || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-green-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <ImageGallery 
          images={product.image_urls}
          productName={product.name}
        />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  ({reviews.length} reviews)
                </span>
              </div>
              <span className="text-sm text-gray-500">SKU: {product.sku}</span>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-4">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
            
            {/* Stock Status */}
            <StockIndicator 
              stockQuantity={product.stock_quantity}
              showQuantity={true}
              size="md"
            />

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleAddToWishlist}
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-green-600" />
                <span>Free shipping over Rs. 1,000</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Quality guarantee</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RefreshCw className="w-4 h-4 text-green-600" />
                <span>30-day returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specifications', label: 'Specifications' },
              { id: 'care', label: 'Care Instructions' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">SKU:</dt>
                    <dd className="font-medium">{product.sku}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Category:</dt>
                    <dd className="font-medium capitalize">{product.category.replace('-', ' ')}</dd>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Weight:</dt>
                      <dd className="font-medium">{product.weight}g</dd>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Dimensions:</dt>
                      <dd className="font-medium">{product.dimensions}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Care Instructions</h3>
              <p className="text-gray-700">
                {product.care_instructions || 'Machine wash cold, tumble dry low, do not bleach.'}
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Customer Reviews</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} out of 5
                  </span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {review.customer?.first_name} {review.customer?.last_name}
                          </span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.review_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;