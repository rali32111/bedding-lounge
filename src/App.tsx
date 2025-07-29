import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute';
import AddProduct from './pages/Admin/AddProduct';
import ProductList from './pages/Admin/ProductList';
import EditProduct from './pages/Admin/EditProduct';
import OrderList from './pages/Admin/OrderList';
import OrderDetail from './pages/Admin/OrderDetail';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Settings from './pages/Admin/Settings';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/admin/products" element={<AdminProtectedRoute><ProductList /></AdminProtectedRoute>} />
                <Route path="/admin/products/add" element={<AdminProtectedRoute><AddProduct /></AdminProtectedRoute>} />
                <Route path="/admin/products/edit/:id" element={<AdminProtectedRoute><EditProduct /></AdminProtectedRoute>} />
                <Route path="/admin/orders" element={<AdminProtectedRoute><OrderList /></AdminProtectedRoute>} />
                <Route path="/admin/orders/:id" element={<AdminProtectedRoute><OrderDetail /></AdminProtectedRoute>} />
                <Route path="/admin/settings" element={<AdminProtectedRoute><Settings /></AdminProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#10B981',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;