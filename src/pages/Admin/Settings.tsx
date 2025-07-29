import React, { useState, useEffect } from 'react';
import { Save, Globe, Mail, Phone, MapPin, Truck, CreditCard, Shield, Bell, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface WebsiteSettings {
  // General Settings
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logoUrl: string;
  
  // Contact Information
  contactEmail: string;
  supportEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  
  // Business Settings
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  shippingCost: number;
  
  // Payment Settings
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  
  // Email Settings
  orderConfirmationEnabled: boolean;
  shippingNotificationEnabled: boolean;
  lowStockAlertEnabled: boolean;
  lowStockThreshold: number;
  
  // SEO Settings
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  
  // Social Media
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  
  // Admin Settings
  adminUsername: string;
  adminPassword: string;
  sessionTimeout: number;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings>({
    // General Settings
    siteName: 'Bedding Lounge',
    siteDescription: 'Premium bedding and home textiles for your perfect night\'s sleep.',
    siteUrl: 'https://thebeddinglounge.com',
    logoUrl: '',
    
    // Contact Information
    contactEmail: 'support@thebeddinglounge.com',
    supportEmail: 'help@thebeddinglounge.com',
    phoneNumber: '+92-323-4385703',
    whatsappNumber: '+92-323-4385703',
    address: '722-K, Street 25, Phase 6, DHA, Lahore, 54000, Pakistan',
    
    // Business Settings
    currency: 'PKR',
    taxRate: 0,
    freeShippingThreshold: 1000,
    shippingCost: 150,
    
    // Payment Settings
    codEnabled: true,
    bankTransferEnabled: true,
    bankName: 'HBL Bank Limited',
    accountTitle: 'The Bedding Lounge',
    accountNumber: '1234567890',
    iban: 'PK36HABB0012345678901234',
    
    // Email Settings
    orderConfirmationEnabled: true,
    shippingNotificationEnabled: true,
    lowStockAlertEnabled: true,
    lowStockThreshold: 5,
    
    // SEO Settings
    metaTitle: 'Bedding Lounge - Premium Bedding & Home Textiles',
    metaDescription: 'Shop premium bedding, bedsheets, duvet covers, and pillows at Bedding Lounge. Quality home textiles for your perfect sleep.',
    metaKeywords: 'bedding, bedsheets, duvet covers, pillows, home textiles, Pakistan',
    
    // Social Media
    facebookUrl: 'https://facebook.com/beddinglounge',
    instagramUrl: 'https://instagram.com/beddinglounge',
    twitterUrl: 'https://twitter.com/beddinglounge',
    
    // Admin Settings
    adminUsername: 'admin',
    adminPassword: 'BeddingLounge2025!',
    sessionTimeout: 24,
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage (in production, this would come from database)
    const savedSettings = localStorage.getItem('websiteSettings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (in production, this would save to database)
      localStorage.setItem('websiteSettings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof WebsiteSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'business', label: 'Business', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Website Settings</h1>
        <p className="text-gray-600 mt-2">Manage all your website settings from one place</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site URL
                    </label>
                    <input
                      type="url"
                      value={settings.siteUrl}
                      onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={settings.logoUrl}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </motion.div>
            )}

            {/* Contact Settings */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={settings.whatsappNumber}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Business Settings */}
            {activeTab === 'business' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="PKR">Pakistani Rupee (PKR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.taxRate}
                      onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Shipping Threshold
                    </label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => handleInputChange('freeShippingThreshold', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Shipping Cost
                    </label>
                    <input
                      type="number"
                      value={settings.shippingCost}
                      onChange={(e) => handleInputChange('shippingCost', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="codEnabled"
                      checked={settings.codEnabled}
                      onChange={(e) => handleInputChange('codEnabled', e.target.checked)}
                      className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="codEnabled" className="text-sm font-medium text-gray-700">
                      Enable Cash on Delivery (COD)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="bankTransferEnabled"
                      checked={settings.bankTransferEnabled}
                      onChange={(e) => handleInputChange('bankTransferEnabled', e.target.checked)}
                      className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="bankTransferEnabled" className="text-sm font-medium text-gray-700">
                      Enable Bank Transfer
                    </label>
                  </div>
                </div>
                
                {settings.bankTransferEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={settings.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Title
                      </label>
                      <input
                        type="text"
                        value={settings.accountTitle}
                        onChange={(e) => handleInputChange('accountTitle', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={settings.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IBAN
                      </label>
                      <input
                        type="text"
                        value={settings.iban}
                        onChange={(e) => handleInputChange('iban', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="orderConfirmationEnabled"
                      checked={settings.orderConfirmationEnabled}
                      onChange={(e) => handleInputChange('orderConfirmationEnabled', e.target.checked)}
                      className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="orderConfirmationEnabled" className="text-sm font-medium text-gray-700">
                      Send order confirmation emails
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="shippingNotificationEnabled"
                      checked={settings.shippingNotificationEnabled}
                      onChange={(e) => handleInputChange('shippingNotificationEnabled', e.target.checked)}
                      className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="shippingNotificationEnabled" className="text-sm font-medium text-gray-700">
                      Send shipping notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="lowStockAlertEnabled"
                      checked={settings.lowStockAlertEnabled}
                      onChange={(e) => handleInputChange('lowStockAlertEnabled', e.target.checked)}
                      className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="lowStockAlertEnabled" className="text-sm font-medium text-gray-700">
                      Enable low stock alerts
                    </label>
                  </div>
                </div>
                
                {settings.lowStockAlertEnabled && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 5)}
                      className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Alert when product stock falls below this number
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* SEO Settings */}
            {activeTab === 'seo' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={settings.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={60}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {settings.metaTitle.length}/60 characters
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={160}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {settings.metaDescription.length}/160 characters
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={settings.metaKeywords}
                    onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={settings.facebookUrl}
                      onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={settings.instagramUrl}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={settings.twitterUrl}
                      onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Admin Settings */}
            {activeTab === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Admin Settings</h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      <strong>Security Notice:</strong> Changing these settings will affect admin access. Make sure to remember your new credentials.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Username
                    </label>
                    <input
                      type="text"
                      value={settings.adminUsername}
                      onChange={(e) => handleInputChange('adminUsername', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (hours)
                    </label>
                    <select
                      value={settings.sessionTimeout}
                      onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value={1}>1 hour</option>
                      <option value={8}>8 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={72}>3 days</option>
                      <option value={168}>1 week</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={settings.adminPassword}
                      onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Use a strong password with at least 8 characters
                  </p>
                </div>
              </motion.div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t">
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;