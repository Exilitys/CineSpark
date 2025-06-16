import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, CreditCard, ArrowRight, X } from 'lucide-react';
import { useCredits, CreditAction } from '../../hooks/useCredits';
import { useNavigate } from 'react-router-dom';

interface CreditGuardProps {
  action: CreditAction;
  onProceed: () => void;
  onCancel: () => void;
  showModal: boolean;
  metadata?: Record<string, any>;
  title?: string;
  description?: string;
}

export const CreditGuard: React.FC<CreditGuardProps> = ({
  action,
  onProceed,
  onCancel,
  showModal,
  metadata = {},
  title,
  description
}) => {
  const { 
    validateCredits, 
    getCreditCost, 
    getActionDisplayName,
    credits,
    plan
  } = useCredits();
  
  const navigate = useNavigate();
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (showModal) {
      const checkCredits = async () => {
        setLoading(true);
        const result = await validateCredits(action);
        setValidation(result);
        setLoading(false);
      };
      checkCredits();
    }
  }, [showModal, action, credits]);

  const handleProceed = () => {
    onProceed();
    onCancel(); // Close the modal
  };

  const getCreditColor = (credits: number) => {
    if (credits >= 500) return 'text-green-400';
    if (credits >= 100) return 'text-gold-400';
    if (credits >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'pro': return 'Pro';
      case 'enterprise': return 'Enterprise';
      default: return 'Free';
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {title || 'Credit Required'}
              </h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Checking credit balance...</p>
              </div>
            ) : validation ? (
              <>
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    validation.isValid ? 'bg-gold-600' : 'bg-red-600'
                  }`}>
                    {validation.isValid ? (
                      <Zap className="h-8 w-8 text-white" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-white" />
                    )}
                  </div>

                  <h4 className="text-lg font-semibold text-white mb-2">
                    {getActionDisplayName(action)}
                  </h4>
                  
                  {description && (
                    <p className="text-gray-400 text-sm mb-4">{description}</p>
                  )}
                  
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Required Credits:</span>
                      <span className="text-white font-medium">{validation.requiredCredits}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Your Balance:</span>
                      <span className={`font-medium ${getCreditColor(validation.currentCredits)}`}>
                        {validation.currentCredits}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Current Plan:</span>
                      <span className="text-white font-medium">{getPlanDisplayName(plan)}</span>
                    </div>
                  </div>

                  {!validation.isValid ? (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-red-400 font-medium text-sm">Insufficient Credits</h5>
                          <p className="text-red-300 text-sm mt-1">{validation.message}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gold-900/20 border border-gold-700 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <Zap className="h-5 w-5 text-gold-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-gold-400 font-medium text-sm">Ready to Proceed</h5>
                          <p className="text-gold-300 text-sm mt-1">
                            This action will deduct {validation.requiredCredits} credits from your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  
                  {validation.isValid ? (
                    <button
                      onClick={handleProceed}
                      className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Proceed</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/pricing')}
                      className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Upgrade Plan</span>
                    </button>
                  )}
                </div>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};