import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, createOrderItems } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import { motion } from 'framer-motion';
import { Banknote, Building2, Lock, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStockTracking } from '../hooks/useStockTracking';

interface CheckoutFormData {
  // Shipping Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Payment Method
  paymentMethod: 'cod' | 'bank_transfer';
  
  // Bank Transfer Details (if selected)
  bankAccountName?: string;
  bankAccountNumber?: string;
  
  // Options
  sameAsBilling: boolean;
  saveAddress: boolean;
  subscribe: boolean;
}

const Checkout: React.FC = () => {
  const { cartItems, getCartTotal, getShippingCost, getTaxAmount, getFinalTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { processOrderStock } = useStockTracking();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      sameAsBilling: true,
      saveAddress: false,
      subscribe: false,
      country: 'Pakistan',
      paymentMethod: 'cod',
    },
  });

  const sameAsBilling = watch('sameAsBilling');
  const shippingCost = getShippingCost();
  const tax = getTaxAmount();
  const total = getFinalTotal();

  const steps = [
    { id: 1, name: 'Shipping', icon: '📦' },
    { id: 2, name: 'Payment', icon: '💳' },
    { id: 3, name: 'Review', icon: '✅' },
  ];

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting order submission process...');
      console.log('Form data:', data);
      console.log('Cart items:', cartItems);
      console.log('User:', user);
      
      // Create order data
      const orderData = {
        customer_id: user?.id,
        total_amount: total,
        order_status: 'pending',
        payment_status: data.paymentMethod === 'cod' ? 'pending' : 'pending',
        payment_method: data.paymentMethod,
        shipping_address: {
          name: `${data.firstName} ${data.lastName}`,
          address: data.address,
          city: data.city,
          state: data.state,
          postal_code: data.postalCode,
          country: data.country,
        },
        billing_address: {
          name: `${data.firstName} ${data.lastName}`,
          address: data.address,
          city: data.city,
          state: data.state,
          postal_code: data.postalCode,
          country: data.country,
        },
      };
      
      console.log('Creating order with data:', orderData);
      
      // Create order in database
      const order = await createOrder(orderData);
      console.log('Order created:', order);
      
      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));
      
      console.log('Creating order items:', orderItems);
      await createOrderItems(orderItems);
      
      // Update stock levels for ordered items
      console.log('Updating stock levels...');
      const stockUpdateSuccess = await processOrderStock(
        cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      );
      
      if (!stockUpdateSuccess) {
        console.warn('Stock update failed, but order was created');
        toast.error('⚠️ Order placed but stock levels may not be updated');
      }
      
      console.log('Order submission completed successfully');
      console.log('Order ID:', order.id);
      
      // Clear cart and show success message
      clearCart();
      toast.success('🎉 Order placed successfully!');
      
      // Redirect to success page or order confirmation
      window.location.href = `/order-confirmation?orderId=${order.id}`;
    } catch (error) {
      console.error('Order submission failed:', error);
      toast.error('❌ Order submission failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        
        {/* Progress Steps */}
        <div className="mt-6 flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                currentStep >= step.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    {...register('address', { required: 'Address is required' })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register('city', { required: 'City is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      {...register('state', { required: 'State is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.state && (
                      <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      {...register('postalCode', { required: 'Postal code is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.postalCode && (
                      <p className="text-red-600 text-sm mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center">
                  <input
                    type="checkbox"
                    {...register('saveAddress')}
                    className="h-4 w-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    Save this address for future orders
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  Payment Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Payment Method *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value="cod"
                          {...register('paymentMethod', { required: 'Payment method is required' })}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          <Banknote className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                            <p className="text-sm text-gray-600">💰 Pay when your order is delivered to your doorstep</p>
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value="bank_transfer"
                          {...register('paymentMethod', { required: 'Payment method is required' })}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          <Building2 className="w-5 h-5 text-green-600 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">Bank Transfer</p>
                            <p className="text-sm text-gray-600">🏦 Transfer funds directly to our bank account</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    {errors.paymentMethod && (
                      <p className="text-red-600 text-sm mt-1">{errors.paymentMethod.message}</p>
                    )}
                  </div>
                  
                  {watch('paymentMethod') === 'bank_transfer' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Bank Account Details</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p><strong>Bank Name:</strong> HBL Bank Limited</p>
                        <p><strong>Account Title:</strong> The Bedding Lounge</p>
                        <p><strong>Account Number:</strong> [Will be provided after order confirmation]</p>
                        <p><strong>IBAN:</strong> [Will be provided after order confirmation]</p>
                        <p className="text-blue-600 mt-2">📧 Complete bank transfer details will be sent via email after order confirmation.</p>
                        <p className="text-orange-600 text-xs mt-1">⚠️ Please include your order ID in the transfer reference.</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex items-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <Lock className="w-4 h-4 mr-2 text-green-600" />
                  <span>Your order information is secure and encrypted</span>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4 py-4 border-b">
                      <img
                        src={item.product.image_urls[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex items-center">
                  <input
                    type="checkbox"
                    {...register('subscribe')}
                    className="h-4 w-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    Subscribe to our newsletter for exclusive offers
                  </label>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
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
              
              <div className="mt-6 text-sm text-gray-600">
                <p>📦 Free shipping on orders over PKR 1,000</p>
                <p>🔄 30-day return policy</p>
                <p>🔒 Secure checkout with SSL encryption</p>
                <p>💰 Cash on Delivery available</p>
                <p>🏦 Bank Transfer option available</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;