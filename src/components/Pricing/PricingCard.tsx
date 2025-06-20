import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  popular: boolean;
  features: string[];
  limitations?: string[];
}

interface PricingCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  isLoading: boolean;
  onSelectPlan: (planId: string, isAnnual: boolean) => void;
  currentPlan?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isAnnual,
  isLoading,
  onSelectPlan,
  currentPlan,
}) => {
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const monthlyEquivalent = isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice;
  const savings = isAnnual ? Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100) : 0;
  const isCurrentPlan = currentPlan === plan.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-gray-800 rounded-2xl p-6 sm:p-8 border-2 ${plan.borderColor} ${
        plan.popular ? 'ring-2 ring-gold-500 ring-opacity-50' : ''
      } hover:border-opacity-80 transition-all duration-300 h-full flex flex-col`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center space-x-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6 sm:mb-8">
        <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
          <plan.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-gray-400 mb-4 text-sm sm:text-base">{plan.description}</p>
        
        <div className="mb-4">
          <div className="flex items-baseline justify-center mb-2">
            <span className="text-2xl sm:text-4xl font-bold text-white">${price}</span>
            <span className="text-gray-400 ml-2 text-sm sm:text-base">/{isAnnual ? 'year' : 'month'}</span>
          </div>
          
          {isAnnual && savings > 0 && (
            <div className="text-green-400 text-xs sm:text-sm font-medium">
              Save {savings}% • ${monthlyEquivalent.toFixed(0)}/month
            </div>
          )}
          
          <div className="text-gold-400 font-medium mt-2 text-sm sm:text-base">
            {plan.credits.toLocaleString()} credits included
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6 sm:mb-8 flex-grow">
        <h4 className="font-semibold text-white text-sm sm:text-base">Features included:</h4>
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-300 text-xs sm:text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {plan.limitations && plan.limitations.length > 0 && (
        <div className="space-y-2 mb-6 sm:mb-8">
          <h4 className="font-semibold text-gray-400 text-xs sm:text-sm">Limitations:</h4>
          {plan.limitations.map((limitation, index) => (
            <div key={index} className="text-gray-500 text-xs sm:text-sm">
              • {limitation}
            </div>
          ))}
        </div>
      )}

      <motion.button
        onClick={() => onSelectPlan(plan.id, isAnnual)}
        disabled={isLoading}
        className={`w-full py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
          plan.popular
            ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white'
            : plan.id === 'free'
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
        }`}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>
              {plan.id === 'free' ? 'Get Started' : 'Subscribe Now'}
            </span>
            {plan.id !== 'free' && <ArrowRight className="h-4 w-4" />}
          </>
        )}
      </motion.button>
    </motion.div>
  );
};