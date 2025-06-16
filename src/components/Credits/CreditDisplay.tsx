import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useCredits } from '../../hooks/useCredits';

interface CreditDisplayProps {
  showDetails?: boolean;
  className?: string;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { credits, plan, getCreditCost, CREDIT_COSTS } = useCredits();

  const getCreditColor = (credits: number) => {
    if (credits >= 500) return 'text-green-400';
    if (credits >= 100) return 'text-gold-400';
    if (credits >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'text-gold-400';
      case 'enterprise': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getUsageEstimate = () => {
    const storyGenerations = Math.floor(credits / CREDIT_COSTS.STORY_GENERATION);
    const shotLists = Math.floor(credits / CREDIT_COSTS.SHOT_LIST_GENERATION);
    const photoboards = Math.floor(credits / CREDIT_COSTS.PHOTOBOARD_GENERATION);
    
    return { storyGenerations, shotLists, photoboards };
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Zap className="h-4 w-4 text-gold-400" />
        <span className={`font-medium ${getCreditColor(credits)}`}>
          {credits.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400">credits</span>
      </div>
    );
  }

  const usage = getUsageEstimate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Zap className="h-5 w-5 text-gold-400 mr-2" />
          Credit Balance
        </h3>
        <span className={`text-xs px-2 py-1 rounded ${
          plan === 'pro' ? 'bg-gold-600' : 
          plan === 'enterprise' ? 'bg-purple-600' : 'bg-gray-600'
        } text-white`}>
          {plan.toUpperCase()}
        </span>
      </div>

      <div className="text-center mb-6">
        <div className={`text-4xl font-bold ${getCreditColor(credits)} mb-2`}>
          {credits.toLocaleString()}
        </div>
        <div className="text-gray-400">Credits Available</div>
      </div>

      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-300">Usage Estimates</h4>
        
        <div className="grid grid-cols-1 gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Story Generations:</span>
            <span className="text-white">{usage.storyGenerations}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Shot Lists:</span>
            <span className="text-white">{usage.shotLists}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Photoboards:</span>
            <span className="text-white">{usage.photoboards}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-3">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Credit Costs</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Story:</span>
            <span className="text-white">{CREDIT_COSTS.STORY_GENERATION}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Shots:</span>
            <span className="text-white">{CREDIT_COSTS.SHOT_LIST_GENERATION}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Board:</span>
            <span className="text-white">{CREDIT_COSTS.PHOTOBOARD_GENERATION}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Frame:</span>
            <span className="text-white">{CREDIT_COSTS.PHOTOBOARD_FRAME}</span>
          </div>
        </div>
      </div>

      {credits < 50 && (
        <div className="mt-4 bg-red-900/20 border border-red-700 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Low Credits</span>
          </div>
          <p className="text-red-300 text-xs mt-1">
            Consider upgrading your plan for more credits.
          </p>
        </div>
      )}
    </motion.div>
  );
};