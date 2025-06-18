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
  CheckCircle,
  Film,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { useProjects } from "../hooks/useProjects";
import { AuthModal } from "../components/Auth/AuthModal";
import { PricingCard } from "../components/Pricing/PricingCard";
import { createCheckoutSession, STRIPE_PRODUCTS } from "../lib/stripe";
import {
  storePricingSession,
  getPricingSession,
  clearPricingSession,
} from "../utils/sessionStorage";
import { toast } from "react-toastify";
import { useCredits } from "../hooks/useCredits";

export const PricingPage: React.FC = () => {
  const { user, session, loading: authLoading, initialized } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { getProjectLimitInfo } = useProjects();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { getTransactionHistory, CREDIT_COSTS } = useCredits();

  const limitInfo = getProjectLimitInfo();

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
        "3 projects maximum",
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

    console.log("✅ User is authenticated, proceeding with checkout");
    setProcessingPlan(planId);

    try {
      // Check if we're in demo mode
      const isDemoMode =
        !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === "pk_test_demo";

      if (isDemoMode) {
        console.log("🎭 Demo mode: Redirecting to demo payment page");
        toast.success("Demo mode: Redirecting to payment simulation...");

        // In demo mode, redirect to our payment page
        setTimeout(() => {
          navigate(`/payment/${planId}`);
        }, 1000);
        return;
      }

      // Get the appropriate price ID based on plan and billing cycle
      const priceId = annual
        ? STRIPE_PRODUCTS[planId as keyof typeof STRIPE_PRODUCTS]?.annual
        : STRIPE_PRODUCTS[planId as keyof typeof STRIPE_PRODUCTS]?.monthly;

      if (!priceId) {
        throw new Error("Price ID not found for selected plan");
      }

      // Create Stripe checkout session with user's access token
      const { sessionId, url, demo } = await createCheckoutSession(
        priceId,
        // profile?.stripe_customer_id,
        session?.access_token
      );

      if (demo) {
        // Demo mode - redirect to our payment page
        navigate(`/payment/${planId}`);
      } else if (url) {
        // Production mode - redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("💥 Checkout error:", error);
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
    { action: "Story Generation", credits: CREDIT_COSTS.STORY_GENERATION },
    {
      action: "Shot List Creation",
      credits: CREDIT_COSTS.SHOT_LIST_GENERATION,
    },
    {
      action: "Photoboard Generation",
      credits: CREDIT_COSTS.PHOTOBOARD_GENERATION,
    },
    {
      action: "Photoboard Regeneration",
      credits: CREDIT_COSTS.PHOTOBOARD_REGENERATION,
    },
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
    <div className="min-h-screen bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Creative Plan
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            Unlock the full potential of AI-powered filmmaking with flexible
            pricing designed for creators at every level.
          </p>

          {/* Demo Mode Notice */}
          {(!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
            import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === "pk_test_demo") && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4 mb-6 sm:mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-medium">
                  Demo Mode Active
                </span>
              </div>
              <p className="text-blue-300 text-xs sm:text-sm mt-1">
                This is a demonstration. No actual payments will be processed.
                Payment simulation will upgrade your account for testing
                purposes.
              </p>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-6 sm:mb-8">
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
          <div className="mt-4 sm:mt-6">
            {user ? (
              <div className="inline-flex items-center space-x-2 bg-green-900/20 border border-green-700 rounded-lg px-3 sm:px-4 py-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium text-xs sm:text-sm">
                  Signed in as {user.email}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-blue-900/20 border border-blue-700 rounded-lg px-3 sm:px-4 py-2">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400 font-medium text-xs sm:text-sm">
                  Sign in to select a plan and start creating
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Current Plan Status */}
        {user && profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-8 sm:mb-12 border border-gray-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cinema-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Film className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Current Plan Status</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className={`text-xs sm:text-sm ${
                      profile.plan === 'pro' ? 'text-gold-400' : 
                      profile.plan === 'enterprise' ? 'text-purple-400' : 'text-gray-400'
                    }`}>
                      {profile.plan === 'pro' ? 'Pro Plan' : 
                       profile.plan === 'enterprise' ? 'Enterprise Plan' : 'Free Plan'}
                    </span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-gray-400 text-xs sm:text-sm">
                      {profile.credits.toLocaleString()} credits
                    </span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-gray-400 text-xs sm:text-sm">
                      {limitInfo.current} of {limitInfo.limit} projects
                    </span>
                  </div>
                </div>
              </div>
              
              {profile.plan === 'free' && limitInfo.current >= 2 && (
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-orange-400 mb-1 sm:mb-2 justify-end">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs sm:text-sm font-medium">
                      {limitInfo.current === 3 ? 'Project Limit Reached' : 'Approaching Limit'}
                    </span>
                  </div>
                  <p className="text-orange-300 text-xs">
                    {limitInfo.current === 3 
                      ? 'Upgrade to create more projects'
                      : `${limitInfo.remaining} project${limitInfo.remaining !== 1 ? 's' : ''} remaining`
                    }
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Stored Session Notice */}
        {getPricingSession() && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gold-900/20 border border-gold-700 rounded-xl p-4 mb-6 sm:mb-8 text-center"
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
          className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-8 sm:mb-12 border border-gray-700"
        >
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center justify-center sm:justify-start">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-gold-400 mr-2" />
            How Credits Work
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 justify-center">
            {creditUsageExamples.map((example, index) => (
              <div
                key={index}
                className="bg-gray-700 rounded-lg p-3 text-center"
              >
                <div className="text-gold-400 font-bold text-base sm:text-lg">
                  {example.credits}
                </div>
                <div className="text-gray-300 text-xs sm:text-sm">
                  {example.action}
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-4 text-center sm:text-left">
            Credits are consumed when using AI features. Story and shot list
            modifications use the same credits as generation. Unused credits
            roll over each month for Pro and Enterprise plans.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
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
          className="bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-700 mb-12 sm:mb-16"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 text-center">
            Secure & Trusted
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-green-400 mx-auto mb-3 sm:mb-4" />
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">
                Bank-Level Security
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                Your payment information is encrypted and secure with
                industry-standard SSL protection.
              </p>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 sm:h-12 sm:w-12 text-gold-400 mx-auto mb-3 sm:mb-4" />
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Instant Access</h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                Get immediate access to your plan features as soon as your
                payment is processed.
              </p>
            </div>
            <div className="text-center">
              <Crown className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-3 sm:mb-4" />
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">Cancel Anytime</h4>
              <p className="text-gray-400 text-xs sm:text-sm">
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
          className="bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-700"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">
                What are credits used for?
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                Credits are consumed when using AI features like story
                generation (10 credits), shot list creation (15 credits), and
                storyboard generation (20 credits). Modifications use the same
                amount as initial generation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">
                How many projects can I create?
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                Free plan users can create up to 3 projects. Pro and Enterprise 
                plans include unlimited projects, allowing you to work on as many 
                film concepts as you want.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">
                Do unused credits expire?
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                For Pro and Enterprise plans, unused credits roll over to the
                next month. Free plan credits reset monthly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">
                Can I upgrade or downgrade anytime?
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                Yes! You can change your plan at any time. Upgrades take effect
                immediately, while downgrades take effect at the next billing
                cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">
                Is there a free trial?
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                Every new user starts with 100 free credits and can create up to 
                3 projects to explore all features. No credit card required to get started.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                We accept all major credit cards, debit cards, and digital
                wallets through our secure Stripe payment processor.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-br from-gold-500/10 to-cinema-500/10 rounded-2xl p-6 sm:p-12 border border-gold-500/30"
            >
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
                Ready to Transform Your{" "}
                <span className="text-gold-400">Creative Vision?</span>
              </h2>
              <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
                Join thousands of creators who are already using CineSparkAI to
                bring their stories to life. Start your filmmaking journey today
                with our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Start Creating</span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>
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