import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  Crown,
  Sparkles,
  Shield,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { AuthModal } from "../components/Auth/AuthModal";
import { PricingCard } from "../components/Pricing/PricingCard";
import { createCheckoutSession, STRIPE_PRODUCTS } from "../lib/stripe";
import {
  storePricingSession,
  getPricingSession,
  clearPricingSession,
} from "../utils/sessionStorage";
import toast from "react-hot-toast";

export const PricingPage: React.FC = () => {
  const { user, session, loading: authLoading, initialized } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  // Check for stored pricing session on component mount
  useEffect(() => {
    const storedSession = getPricingSession();
    if (storedSession && user) {
      console.log(
        "🔄 Found stored pricing session for authenticated user:",
        storedSession
      );
      toast.success(`Resuming ${storedSession.planName} plan selection...`);

      // Auto-redirect to payment after a short delay
      setTimeout(() => {
        navigate(`/payment/${storedSession.planId}`);
        clearPricingSession();
      }, 2000);
    }
  }, [user, navigate]);

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for getting started with AI filmmaking",
      monthlyPrice: 0,
      annualPrice: 0,
      credits: 100,
      icon: Sparkles,
      color: "from-gray-500 to-gray-600",
      borderColor: "border-gray-600",
      popular: false,
      features: [
        "100 AI generation credits",
        "3 projects per month",
        "Basic story generation",
        "Standard shot lists",
        "Basic storyboard frames",
        "PDF export",
        "Community support",
      ],
      limitations: [
        "Limited to 3 projects",
        "Basic AI models only",
        "Standard image quality",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      description: "Advanced features for professional filmmakers",
      monthlyPrice: 29,
      annualPrice: 290,
      credits: 1000,
      icon: Zap,
      color: "from-gold-500 to-gold-600",
      borderColor: "border-gold-500",
      popular: true,
      features: [
        "1,000 AI generation credits",
        "Unlimited projects",
        "Advanced story generation",
        "Professional shot lists",
        "High-quality storyboards",
        "Multiple export formats",
        "Priority support",
        "Advanced editing tools",
        "Collaboration features",
        "Custom templates",
      ],
      limitations: [],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Complete solution for studios and teams",
      monthlyPrice: 99,
      annualPrice: 990,
      credits: 5000,
      icon: Crown,
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-500",
      popular: false,
      features: [
        "5,000 AI generation credits",
        "Unlimited projects",
        "Premium AI models",
        "Cinema-grade shot lists",
        "4K storyboard generation",
        "All export formats",
        "Dedicated support",
        "Team collaboration",
        "Custom branding",
        "API access",
        "Advanced analytics",
        "Priority processing",
      ],
      limitations: [],
    },
  ];

  const handleSelectPlan = async (planId: string, annual: boolean) => {
    console.log("💳 handleSelectPlan called:", {
      planId,
      annual,
      user: user?.email || "None",
      authLoading,
      initialized,
    });

    // Wait for auth to finish loading and be initialized
    if (authLoading || !initialized) {
      console.log("⏳ Auth still loading or not initialized, waiting...");
      toast.error("Please wait while we load your account information");
      return;
    }

    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) {
      toast.error("Invalid plan selected");
      return;
    }

    // Handle free plan
    if (planId === "free") {
      if (user) {
        toast.success("You're already on the free plan!");
      } else {
        toast.info("Sign up to get started with the free plan");
        setShowAuthModal(true);
      }
      return;
    }

    // Check authentication for paid plans
    if (!user) {
      console.log(
        "🚫 No user found, storing pricing session and showing auth modal"
      );

      // Store pricing session securely
      const price = annual
        ? selectedPlan.annualPrice
        : selectedPlan.monthlyPrice;
      storePricingSession(planId, selectedPlan.name, price);

      // Set pending plan for UI feedback
      setPendingPlanId(planId);

      // Show auth modal with payment context
      setShowAuthModal(true);

      toast.info(
        "Please sign in or create an account to complete your purchase"
      );
      return;
    }

    console.log("✅ User is authenticated, proceeding with Stripe checkout");
    setProcessingPlan(planId);

    try {
      // Get the appropriate price ID based on plan and billing cycle
      const priceId = annual
        ? STRIPE_PRODUCTS[planId as keyof typeof STRIPE_PRODUCTS]?.annual
        : STRIPE_PRODUCTS[planId as keyof typeof STRIPE_PRODUCTS]?.monthly;

      if (!priceId) {
        throw new Error("Price ID not found for selected plan");
      }

      // Create Stripe checkout session with user's access token
      const { sessionId, url } = await createCheckoutSession(
        priceId,
        profile?.id,
        session?.access_token
      );

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("💥 Stripe checkout error:", error);
      toast.error("Failed to start checkout process. Please try again.");
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setPendingPlanId(null);
  };

  const creditUsageExamples = [
    { action: "Story generation", credits: 10 },
    { action: "Shot list creation", credits: 15 },
    { action: "Photoboard generation", credits: 20 },
    { action: "Frame regeneration", credits: 3 },
    { action: "AI enhancement", credits: 2 },
  ];

  // Show loading state while auth is loading or not initialized
  if (authLoading || !initialized || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading pricing information...</p>
        </div>
      </div>
    );
  }

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
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Creative Plan
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Unlock the full potential of AI-powered filmmaking with flexible
            pricing designed for creators at every level.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span
              className={`text-sm font-medium ${
                !isAnnual ? "text-white" : "text-gray-400"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex items-center"
            >
              {isAnnual ? (
                <ToggleRight className="h-8 w-8 text-gold-500" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-gray-400" />
              )}
            </button>
            <span
              className={`text-sm font-medium ${
                isAnnual ? "text-white" : "text-gray-400"
              }`}
            >
              Annual
            </span>
            {isAnnual && (
              <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Save up to 17%
              </span>
            )}
          </div>

          {/* Auth Status */}
          <div className="mt-6">
            {user ? (
              <div className="inline-flex items-center space-x-2 bg-green-900/20 border border-green-700 rounded-lg px-4 py-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium text-sm">
                  Signed in as {user.email}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-blue-900/20 border border-blue-700 rounded-lg px-4 py-2">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 font-medium text-sm">
                  Sign in to select a plan and start creating
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stored Session Notice */}
        {getPricingSession() && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gold-900/20 border border-gold-700 rounded-xl p-4 mb-8 text-center"
          >
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-5 w-5 text-gold-400" />
              <span className="text-gold-400 font-medium">
                Resuming your plan selection... Redirecting to payment.
              </span>
            </div>
          </motion.div>
        )}

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
              <div
                key={index}
                className="bg-gray-700 rounded-lg p-3 text-center"
              >
                <div className="text-gold-400 font-bold text-lg">
                  {example.credits}
                </div>
                <div className="text-gray-300 text-sm">{example.action}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Credits are consumed when using AI features. Story and shot list
            modifications use the same credits as generation. Unused credits
            roll over each month for Pro and Enterprise plans.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isAnnual={isAnnual}
              isLoading={processingPlan === plan.id}
              onSelectPlan={handleSelectPlan}
              currentPlan={profile?.plan}
            />
          ))}
        </div>

        {/* Security & Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Secure & Trusted
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">
                Bank-Level Security
              </h4>
              <p className="text-gray-400">
                Your payment information is encrypted and secure with
                industry-standard SSL protection.
              </p>
            </div>
            <div className="text-center">
              <Zap className="h-12 w-12 text-gold-400 mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Instant Access</h4>
              <p className="text-gray-400">
                Get immediate access to your plan features as soon as your
                payment is processed.
              </p>
            </div>
            <div className="text-center">
              <Crown className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Cancel Anytime</h4>
              <p className="text-gray-400">
                No long-term commitments. Cancel or change your plan anytime
                from your account settings.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-2">
                What are credits used for?
              </h4>
              <p className="text-gray-400">
                Credits are consumed when using AI features like story
                generation (10 credits), shot list creation (15 credits), and
                storyboard generation (20 credits). Modifications use the same
                amount as initial generation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">
                Do unused credits expire?
              </h4>
              <p className="text-gray-400">
                For Pro and Enterprise plans, unused credits roll over to the
                next month. Free plan credits reset monthly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">
                Can I upgrade or downgrade anytime?
              </h4>
              <p className="text-gray-400">
                Yes! You can change your plan at any time. Upgrades take effect
                immediately, while downgrades take effect at the next billing
                cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-400">
                Every new user starts with 100 free credits to explore all
                features. No credit card required to get started.
              </p>
            </div>
            <div>
              <h4 className="font-semibent text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-400">
                We accept all major credit cards, debit cards, and digital
                wallets through our secure Stripe payment processor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">
                Is my payment information secure?
              </h4>
              <p className="text-gray-400">
                Yes! We use Stripe for payment processing, which is PCI DSS
                compliant and trusted by millions of businesses worldwide.
              </p>
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
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Create Your Next Masterpiece?
          </h3>
          <p className="text-gray-400 mb-8">
            Join thousands of filmmakers using CineSpark AI to bring their
            visions to life.
          </p>
          {!user && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Sparkles className="h-5 w-5" />
              <span>Start Creating for Free</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        showReturnMessage={!!pendingPlanId}
      />
    </div>
  );
};
