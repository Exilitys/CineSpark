import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getPricingSession,
  clearPricingSession,
} from "../../utils/sessionStorage";
import toast from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectAfterAuth?: string;
  showReturnMessage?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  redirectAfterAuth,
  showReturnMessage = false,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Validate full name for sign up
    if (isSignUp && !fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (isSignUp && fullName.trim().length < 2) {
      toast.error("Name must be at least 2 characters long");
      return;
    }

    setLoading(true);
    try {
      console.log("🔐 Auth modal submitting:", {
        isSignUp,
        email,
        fullName: isSignUp ? fullName : "N/A",
        redirectAfterAuth,
      });

      const { error } = isSignUp
        ? await signUp(email, password, fullName.trim())
        : await signIn(email, password);

      if (error) {
        console.error("❌ Auth error:", error);
        toast.error(
          (error as { message?: string }).message || "Authentication failed"
        );
      } else {
        console.log("✅ Auth successful");
        toast.success(
          isSignUp ? "Account created successfully!" : "Welcome back!"
        );

        // Clear form
        setEmail("");
        setPassword("");
        setFullName("");
        onClose();

        // Handle post-authentication flow
        await handlePostAuthFlow();
      }
    } catch (error) {
      console.error("💥 Unexpected auth error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePostAuthFlow = async () => {
    // Check if there's a stored pricing session
    const pricingSession = getPricingSession();

    if (pricingSession) {
      console.log(
        "🔄 Resuming payment flow with stored session:",
        pricingSession
      );
      toast.success(`Resuming ${pricingSession.planName} plan purchase...`);

      // Small delay to ensure auth state is fully updated
      setTimeout(() => {
        navigate(`/payment/${pricingSession.planId}`);
        clearPricingSession(); // Clear after successful redirect
      }, 1000);
    } else if (redirectAfterAuth) {
      console.log("🔄 Redirecting to:", redirectAfterAuth);
      setTimeout(() => {
        navigate(redirectAfterAuth);
      }, 1000);
    } else {
      // Default behavior - stay on current page or go to projects
      const currentPath = location.pathname;
      if (currentPath === "/pricing") {
        // Stay on pricing page, it will update to show authenticated state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Go to projects page
        setTimeout(() => {
          navigate("/projects");
        }, 1000);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-400">
                {isSignUp
                  ? "Start creating amazing films with CineSpark AI"
                  : "Sign in to continue your filmmaking journey"}
              </p>
            </div>

            {/* Return message for payment flow */}
            {showReturnMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-medium text-sm">
                      Complete Your Purchase
                    </h4>
                    <p className="text-blue-300 text-xs mt-1">
                      Please sign in or create an account to complete your plan
                      selection. Your pricing selection has been saved and will
                      be restored after authentication.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      maxLength={50}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be displayed in your profile
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={
                  loading ||
                  !email ||
                  !password ||
                  (isSignUp && !fullName.trim())
                }
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5" />
                    <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  onClick={toggleMode}
                  className="ml-2 text-gold-400 hover:text-gold-300 font-medium transition-colors"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
