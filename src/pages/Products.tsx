import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/Product/ProductCard';
import { Product } from '../types';
import { getProducts } from '../lib/supabase';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState({
    category: searchParams.get('category') || '',
    priceRange: '',
    rating: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (filterBy.category) {
      filtered = filtered.filter(product => product.category === filterBy.category);
    }

    // Apply price range filter
    if (filterBy.priceRange) {
      const [min, max] = filterBy.priceRange.split('-').map(Number);
      filtered = filtered.filter(product => 
        product.price >= min && (max ? product.price <= max : true)
      );
    }

    // Apply rating filter
    if (filterBy.rating) {
      const minRating = Number(filterBy.rating);
      filtered = filtered.filter(product => (product.rating || 0) >= minRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, filterBy, sortBy]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'bedsheets', label: 'Bedsheets' },
    { value: 'duvet-covers', label: 'Duvet Covers' },
    { value: 'pillows', label: 'Pillows' },
    { value: 'blankets', label: 'Blankets' },
  ];

  const priceRanges = [
    { value: '', label: 'Any Price' },
    { value: '0-5000', label: 'Rs. 0 - Rs. 5,000' },
    { value: '5000-15000', label: 'Rs. 5,000 - Rs. 15,000' },
    { value: '15000-25000', label: 'Rs. 15,000 - Rs. 25,000' },
    { value: '25000', label: 'Rs. 25,000+' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filterBy.category}
                    onChange={(e) => setFilterBy(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={filterBy.priceRange}
                    onChange={(e) => setFilterBy(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filterBy.rating}
                    onChange={(e) => setFilterBy(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilterBy({ category: '', priceRange: '', rating: '' })}
                  className="w-full px-4 py-2 text-sm text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {filterBy.category 
                  ? categories.find(c => c.value === filterBy.category)?.label
                  : 'All Products'
                }
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} products found
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;