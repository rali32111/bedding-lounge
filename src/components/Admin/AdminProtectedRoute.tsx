import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Settings, BarChart3 } from 'lucide-react';
import AdminLogin from './AdminLogin';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const adminAuth = localStorage.getItem('adminAuthenticated');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (adminAuth === 'true' && loginTime) {
      // Check if session is still valid (24 hours)
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const currentTime = Date.now();
      const loginTimestamp = parseInt(loginTime);
      
      if (currentTime - loginTimestamp < sessionDuration) {
        setIsAuthenticated(true);
      } else {
        // Session expired, clear storage
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminLoginTime');
        setIsAuthenticated(false);
      }
    }
    
    setIsLoading(false);
  };

  const handleLogin = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminLoginTime');
    setIsAuthenticated(false);
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Add logout functionality to children if needed
  return (
    <div>
      {/* Admin Header with Logout */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium">🔒 Admin Mode</span>
              <nav className="hidden md:flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                      isActive(item.href)
                        ? 'bg-red-700 text-white'
                        : 'text-red-100 hover:text-white hover:bg-red-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-xs transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AdminProtectedRoute;