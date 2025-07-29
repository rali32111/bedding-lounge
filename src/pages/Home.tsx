import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/Product/ProductCard';
import { Product } from '../types';

const Home: React.FC = () => {
  // Mock featured products
  const featuredProducts: Product[] = [
    {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      name: 'Luxury Egyptian Cotton Bedsheet Set - 1000 Thread Count',
      description: 'Transform your bedroom into a five-star hotel suite with our premium Egyptian cotton bedsheet set.',
      price: 2499.00,
      category: 'bedsheets',
      stock_quantity: 25,
      image_urls: [
        'https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      sku: 'BED-EGY-Q-WHT',
      rating: 4.8,
      review_count: 156,
    },
    {
      id: 'b2c3d4e5-f6g7-8901-2345-678901bcdefg',
      name: 'Premium Bamboo Fiber Duvet Cover Set - Eco-Friendly',
      description: 'Experience the perfect blend of luxury and sustainability with our bamboo fiber duvet cover set.',
      price: 1899.00,
      category: 'duvet-covers',
      stock_quantity: 18,
      image_urls: ['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800'],
      sku: 'DUV-BAM-Q-GRY',
      rating: 4.7,
      review_count: 98,
    },
    {
      id: 'c3d4e5f6-g7h8-9012-3456-789012cdefgh',
      name: 'Memory Foam Contour Pillow - Orthopedic Support',
      description: 'Wake up refreshed and pain-free with our ergonomically designed memory foam contour pillow.',
      price: 1299.00,
      category: 'pillows',
      stock_quantity: 42,
      image_urls: ['https://images.pexels.com/photos/1034806/pexels-photo-1034806.jpeg?auto=compress&cs=tinysrgb&w=800'],
      sku: 'PIL-MEM-STD-WHT',
      rating: 4.9,
      review_count: 234,
    },
    {
      id: 'e5f6g7h8-i9j0-1234-5678-901234efghij',
      name: 'Silk Pillowcase Set - Mulberry Silk for Hair & Skin',
      description: 'Indulge in the ultimate luxury with our 100% mulberry silk pillowcase set.',
      price: 1599.00,
      category: 'pillows',
      stock_quantity: 15,
      image_urls: ['https://images.pexels.com/photos/1034806/pexels-photo-1034806.jpeg?auto=compress&cs=tinysrgb&w=800'],
      sku: 'PIL-SIL-STD-CRM',
      rating: 4.8,
      review_count: 145,
    },
  ];

  const features = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $100',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Quality Guarantee',
      description: '100% satisfaction guarantee',
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: 'Easy Returns',
      description: '30-day return policy',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="absolute inset-0 bg-black/20" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1148955/pexels-photo-1148955.jpeg?auto=compress&cs=tinysrgb&w=1600")',
          }}
        />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Sleep in Luxury
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            Discover premium bedding that transforms your bedroom into a sanctuary
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <Link
              to="/products"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center group"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-green-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular bedding essentials, carefully selected for quality and comfort.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                rating: 5,
                comment: 'The Egyptian cotton sheets are absolutely divine. Best purchase I\'ve made for my bedroom!',
              },
              {
                name: 'Michael Chen',
                rating: 5,
                comment: 'Exceptional quality and comfort. Great value for money and the packaging was beautiful.',
              },
              {
                name: 'Emma Rodriguez',
                rating: 5,
                comment: 'I love the bamboo sheets! They keep me cool all night and the price is very reasonable.',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.comment}"</p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;