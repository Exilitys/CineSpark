import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight, Home, User } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, refetch } = useProfile();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refetch profile to get updated subscription info
    const updateProfile = async () => {
      if (user) {
        await refetch();
      }
      setLoading(false);
    };

    // Add a small delay to ensure webhook has processed
    const timer = setTimeout(updateProfile, 2000);
    return () => clearTimeout(timer);
  }, [user, refetch]);

  const handleContinue = () => {
    navigate('/projects');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-10 w-10 text-white" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Payment Successful!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-400 mb-8 leading-relaxed"
        >
          Welcome to {profile?.plan === 'pro' ? 'CineSpark Pro' : 'CineSpark Enterprise'}! 
          Your subscription is now active and you have access to all premium features.
        </motion.p>

        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Your Plan Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Plan:</span>
                <span className={`font-medium ${
                  profile.plan === 'pro' ? 'text-gold-400' : 'text-purple-400'
                }`}>
                  {profile.plan === 'pro' ? 'Pro' : 'Enterprise'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Credits:</span>
                <span className="text-green-400 font-medium">
                  {profile.credits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Sparkles className="h-5 w-5" />
            <span>Start Creating</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleViewProfile}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </button>
            
            <button
              onClick={handleGoHome}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg"
        >
          <h4 className="text-blue-400 font-medium text-sm mb-2">What's Next?</h4>
          <ul className="text-blue-300 text-xs space-y-1">
            <li>• Check your email for a receipt and welcome guide</li>
            <li>• Explore premium features in your dashboard</li>
            <li>• Manage your subscription anytime in profile settings</li>
          </ul>
        </motion.div>

        {sessionId && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-xs text-gray-500 mt-4"
          >
            Session ID: {sessionId.substring(0, 20)}...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};