import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Check, ArrowLeft, Zap, Crown, Sparkles, AlertCircle } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const PaymentPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'US'
  });

  const plans = {
    pro: {
      name: 'Pro',
      price: 29,
      credits: 1000,
      icon: Zap,
      color: 'from-gold-500 to-gold-600',
      features: [
        '1,000 AI generation credits',
        'Unlimited projects',
        'Advanced story generation',
        'Professional shot lists',
        'High-quality storyboards',
        'Multiple export formats',
        'Priority support'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: 99,
      credits: 5000,
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      features: [
        '5,000 AI generation credits',
        'Unlimited projects',
        'Premium AI models',
        'Cinema-grade shot lists',
        '4K storyboard generation',
        'All export formats',
        'Dedicated support',
        'Team collaboration',
        'API access'
      ]
    }
  };

  const selectedPlan = planId ? plans[planId as keyof typeof plans] : null;

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/');
      return;
    }

    if (!selectedPlan) {
      toast.error('Invalid plan selected');
      navigate('/pricing');
      return;
    }

    if (planId === 'free') {
      toast.error('Free plan does not require payment');
      navigate('/pricing');
      return;
    }
  }, [user, selectedPlan, planId, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = formData;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid card number');
      return false;
    }
    
    if (!expiryDate || expiryDate.length < 5) {
      toast.error('Please enter a valid expiry date');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    
    if (!cardholderName.trim()) {
      toast.error('Please enter the cardholder name');
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm() || !selectedPlan || !profile) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      toast.loading('Processing payment...', { id: 'payment' });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update user profile with new plan and credits
      await updateProfile({
        plan: planId as string,
        credits: profile.credits + selectedPlan.credits
      });
      
      toast.success('Payment successful!', { id: 'payment' });
      setPaymentComplete(true);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.', { id: 'payment' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return null;
  }

  // Payment Success Screen
  if (paymentComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-900 flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Welcome to {selectedPlan.name}!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-400 mb-8 leading-relaxed"
          >
            Your payment was successful and your account has been upgraded. You now have access to all {selectedPlan.name} features and {selectedPlan.credits.toLocaleString()} additional credits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700"
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${selectedPlan.color} rounded-full flex items-center justify-center`}>
                <selectedPlan.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{selectedPlan.name} Plan Active</h3>
            <div className="text-gold-400 font-medium mb-4">
              +{selectedPlan.credits.toLocaleString()} credits added
            </div>
            <div className="space-y-2">
              {selectedPlan.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-300">
                  <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onClick={handleBackToHome}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="h-5 w-5" />
            <span>Start Creating</span>
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-xs text-gray-500 mt-4"
          >
            Ready to create amazing films? Your enhanced features are now available.
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // Payment Form
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Pricing</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-fit"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-6">
              {/* Plan Details */}
              <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div className={`w-12 h-12 bg-gradient-to-br ${selectedPlan.color} rounded-full flex items-center justify-center`}>
                  <selectedPlan.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{selectedPlan.name} Plan</h3>
                  <p className="text-gray-400">Monthly subscription</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">${selectedPlan.price}</div>
                  <div className="text-sm text-gray-400">per month</div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-white mb-3">What's included:</h4>
                <div className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>Subtotal</span>
                  <span>${selectedPlan.price}.00</span>
                </div>
                <div className="flex justify-between text-gray-300 mb-2">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg border-t border-gray-600 pt-2">
                  <span>Total</span>
                  <span>${selectedPlan.price}.00</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-green-300 text-xs mt-1">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CreditCard className="h-6 w-6 mr-2" />
              Payment Details
            </h2>

            <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-6">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Billing Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Billing Address
                </label>
                <input
                  type="text"
                  value={formData.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
                />
              </div>

              {/* City and ZIP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="New York"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="10001"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Demo Notice */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-medium text-sm">Demo Payment</h4>
                    <p className="text-blue-300 text-xs mt-1">
                      This is a demonstration. No actual payment will be processed. Your account will be upgraded for testing purposes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    <span>Complete Payment - ${selectedPlan.price}</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};