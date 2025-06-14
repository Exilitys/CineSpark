import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      credits: 100,
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      borderColor: 'border-gray-600',
      popular: false,
      features: [
        '100 AI generation credits',
        '3 projects per month',
        'Basic story generation',
        'Standard shot lists',
        'Basic storyboard frames',
        'PDF export',
        'Community support'
      ],
      limitations: [
        'Limited to 3 projects',
        'Basic AI models only',
        'Standard image quality'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: 'per month',
      credits: 1000,
      icon: Zap,
      color: 'from-gold-500 to-gold-600',
      borderColor: 'border-gold-500',
      popular: true,
      features: [
        '1,000 AI generation credits',
        'Unlimited projects',
        'Advanced story generation',
        'Professional shot lists',
        'High-quality storyboards',
        'Multiple export formats',
        'Priority support',
        'Advanced editing tools',
        'Collaboration features',
        'Custom templates'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      credits: 5000,
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-500',
      popular: false,
      features: [
        '5,000 AI generation credits',
        'Unlimited projects',
        'Premium AI models',
        'Cinema-grade shot lists',
        '4K storyboard generation',
        'All export formats',
        'Dedicated support',
        'Team collaboration',
        'Custom branding',
        'API access',
        'Advanced analytics',
        'Priority processing'
      ],
      limitations: []
    }
  ];

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to select a plan');
      return;
    }

    if (planId === 'free') {
      toast.success('You\'re already on the free plan!');
      return;
    }

    // Navigate to payment page
    navigate(`/payment/${planId}`);
  };

  const creditUsageExamples = [
    { action: 'Generate story structure', credits: 10 },
    { action: 'Create shot list', credits: 15 },
    { action: 'Generate storyboard frame', credits: 5 },
    { action: 'Regenerate content', credits: 3 },
    { action: 'AI enhancement', credits: 2 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">Creative Plan</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Unlock the full potential of AI-powered filmmaking with flexible pricing designed for creators at every level.
          </p>
        </motion.div>

        {/* Credit Usage Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 mb-12 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 text-gold-400 mr-2" />
            How Credits Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {creditUsageExamples.map((example, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-gold-400 font-bold text-lg">{example.credits}</div>
                <div className="text-gray-300 text-sm">{example.action}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Credits are consumed when using AI features. Unused credits roll over each month for Pro and Enterprise plans.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className={`relative bg-gray-800 rounded-2xl p-8 border-2 ${plan.borderColor} ${
                plan.popular ? 'ring-2 ring-gold-500 ring-opacity-50' : ''
              } hover:border-opacity-80 transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">/{plan.period}</span>
                </div>
                <div className="text-gold-400 font-medium">
                  {plan.credits.toLocaleString()} credits included
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold text-white">Features included:</h4>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-2 mb-8">
                  <h4 className="font-semibold text-gray-400 text-sm">Limitations:</h4>
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="text-gray-500 text-sm">
                      • {limitation}
                    </div>
                  ))}
                </div>
              )}

              <motion.button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white'
                    : plan.id === 'free'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{plan.id === 'free' ? 'Current Plan' : 'Get Started'}</span>
                {plan.id !== 'free' && <ArrowRight className="h-4 w-4" />}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-2">What are credits used for?</h4>
              <p className="text-gray-400">Credits are consumed when using AI features like story generation, shot list creation, and storyboard frame generation. Each action has a different credit cost.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Do unused credits expire?</h4>
              <p className="text-gray-400">For Pro and Enterprise plans, unused credits roll over to the next month. Free plan credits reset monthly.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Can I upgrade or downgrade anytime?</h4>
              <p className="text-gray-400">Yes! You can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Is there a free trial?</h4>
              <p className="text-gray-400">Every new user starts with 100 free credits to explore all features. No credit card required to get started.</p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Create Your Next Masterpiece?</h3>
          <p className="text-gray-400 mb-8">Join thousands of filmmakers using CineSpark AI to bring their visions to life.</p>
          {!user && (
            <button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto">
              <Sparkles className="h-5 w-5" />
              <span>Start Creating for Free</span>
            </button>
          )}
          </motion.div>
        </div>
      </div>
  
  );
};