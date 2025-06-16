import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, CreditCard, ArrowRight, X } from 'lucide-react';
import { useCredits, CreditAction } from '../../hooks/useCredits';
import { useNavigate } from 'react-router-dom';

interface CreditGuardProps {
  action: CreditAction;
  onProceed?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  showModal?: boolean;
  metadata?: Record<string, any>;
}

export const CreditGuard: React.FC<CreditGuardProps> = ({
  action,
  onProceed,
  onCancel,
  children,
  showModal = false,
  metadata = {}
}) => {
  const { 
    validateCredits, 
    deductCredits, 
    getCreditCost, 
    getActionDisplayName,
    credits,
    plan,
    processing 
  } = useCredits();
  
  const navigate = useNavigate();
  const [validation, setValidation] = useState<any>(null);
  const [isDeducting, setIsDeducting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const checkCredits = async () => {
      const result = await validateCredits(action);
      setValidation(result);
    };
    checkCredits();
  }, [action, credits]);

  const handleProceed = async () => {
    if (!validation?.isValid) return;

    setIsDeducting(true);
    try {
      const result = await deductCredits(action, metadata);
      
      if (result.success) {
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          onProceed?.();
        }, 1500);
      } else {
        console.error('Credit deduction failed:', result.error);
        // Re-validate credits in case of error
        const newValidation = await validateCredits(action);
        setValidation(newValidation);
      }
    } catch (error) {
      console.error('Error during credit deduction:', error);
    } finally {
      setIsDeducting(false);
    }
  };

  const getCreditColor = (credits: number) => {
    if (credits >= 500) return 'text-green-400';
    if (credits >= 100) return 'text-gold-400';
    if (credits >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  // If validation hasn't loaded yet
  if (!validation) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user has sufficient credits and no modal is requested, render children
  if (validation.isValid && !showModal) {
    return <>{children}</>;
  }

  // Credit confirmation modal
  if (showConfirmation) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <div className="bg-gray-800 rounded-xl p-6 border border-green-500 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Credits Deducted!</h3>
          <p className="text-green-400">
            {getCreditCost(action)} credits deducted for {getActionDisplayName(action)}
          </p>
        </div>
      </motion.div>
    );
  }

  // Credit validation modal
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Credit Confirmation</h3>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

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
            
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Required Credits:</span>
                <span className="text-white font-medium">{validation.requiredCredits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Your Balance:</span>
                <span className={`font-medium ${getCreditColor(validation.currentCredits)}`}>
                  {validation.currentCredits}
                </span>
              </div>
            </div>

            {!validation.isValid && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm">{validation.message}</p>
              </div>
            )}

            {validation.isValid && (
              <p className="text-gray-400 text-sm">
                This action will deduct {validation.requiredCredits} credits from your account.
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isDeducting}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            )}
            
            {validation.isValid ? (
              <button
                onClick={handleProceed}
                disabled={isDeducting || processing}
                className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isDeducting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};