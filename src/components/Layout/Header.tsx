import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Film,
  Sparkles,
  Home,
  FileText,
  Camera,
  Image,
  Download,
  User,
  LogOut,
  CreditCard,
  Zap,
  FolderOpen,
  Settings,
  Info,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { CreditDisplay } from "../Credits/CreditDisplay";
import { AuthModal } from "../Auth/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export const Header: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const projectId = params.projectId;
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/about", icon: Info, label: "About" },
    { path: "/projects", icon: FolderOpen, label: "Projects" },
    { path: `/story/${projectId}`, icon: FileText, label: "Story" },
    { path: `/shots/${projectId}`, icon: Camera, label: "Shot List" },
    { path: `/photoboard/${projectId}`, icon: Image, label: "Photoboard" },
    { path: `/export/${projectId}`, icon: Download, label: "Export" },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "pro":
        return { label: "Pro", color: "text-gold-400" };
      case "enterprise":
        return { label: "Enterprise", color: "text-purple-400" };
      default:
        return { label: "Free", color: "text-gray-400" };
    }
  };

  // Get display name - prioritize full_name, fallback to email username
  const getDisplayName = () => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="relative">
                <Film className="h-6 w-6 sm:h-8 sm:w-8 text-gold-500 group-hover:text-gold-400 transition-colors" />
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-cinema-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-white group-hover:text-gold-400 transition-colors">
                  CineSpark AI
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-4 xl:space-x-8">
              {navItems.map(({ path, icon: Icon, label }) => {
                // Show Home, About, and Projects for everyone
                if (path === "/" || path === "/about" || path === "/projects") {
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        location.pathname === path
                          ? "bg-cinema-600 text-white shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{label}</span>
                    </Link>
                  );
                }

                // Skip project-specific nav items if no projectId
                if (path.includes("undefined") || !projectId) {
                  return null;
                }

                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      location.pathname === path
                        ? "bg-cinema-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{label}</span>
                  </Link>
                );
              })}

              {/* Pricing Link */}
              <Link
                to="/pricing"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === "/pricing"
                    ? "bg-cinema-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden xl:inline">Pricing</span>
              </Link>
            </nav>

            {/* Right side - Credits and User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  {/* Credits Display - Hidden on small screens */}
                  <div className="hidden sm:block">
                    <CreditDisplay />
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-2 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline max-w-20 sm:max-w-32 truncate">
                        {getDisplayName()}
                      </span>
                      {profile?.plan && profile.plan !== "free" && (
                        <span
                          className={`text-xs hidden md:inline ${
                            getPlanBadge(profile.plan).color
                          }`}
                        >
                          {getPlanBadge(profile.plan).label}
                        </span>
                      )}
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50">
                        <div className="py-1">
                          <div className="px-4 py-3 text-sm border-b border-gray-700">
                            <div className="font-medium text-white">
                              {getDisplayName()}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {user.email}
                            </div>
                            <div className="mt-2">
                              <CreditDisplay showDetails={false} />
                            </div>
                            {profile?.plan && (
                              <div className="mt-1">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    profile.plan === "pro"
                                      ? "bg-gold-600"
                                      : profile.plan === "enterprise"
                                      ? "bg-purple-600"
                                      : "bg-gray-600"
                                  } text-white`}
                                >
                                  {getPlanBadge(profile.plan).label}
                                </span>
                              </div>
                            )}
                          </div>
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Profile Settings</span>
                          </Link>
                          <Link
                            to="/pricing"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>Upgrade Plan</span>
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Link
                    to="/pricing"
                    className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200 hidden sm:inline"
                  >
                    Pricing
                  </Link>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gold-600 hover:bg-gold-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-700 bg-gray-800"
            >
              <div className="px-4 py-2 space-y-1">
                {/* Mobile Credits Display for authenticated users */}
                {user && (
                  <div className="sm:hidden py-3 border-b border-gray-700 mb-2">
                    <CreditDisplay />
                  </div>
                )}

                {/* Navigation Items */}
                {navItems.map(({ path, icon: Icon, label }) => {
                  // Show Home, About, and Projects for everyone
                  if (path === "/" || path === "/about" || path === "/projects") {
                    return (
                      <Link
                        key={path}
                        to={path}
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                          location.pathname === path
                            ? "bg-cinema-600 text-white"
                            : "text-gray-300 hover:text-white hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                      </Link>
                    );
                  }

                  // Skip project-specific nav items if no projectId
                  if (path.includes("undefined") || !projectId) {
                    return null;
                  }

                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                        location.pathname === path
                          ? "bg-cinema-600 text-white"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  );
                })}

                {/* Pricing Link */}
                <Link
                  to="/pricing"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                    location.pathname === "/pricing"
                      ? "bg-cinema-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Pricing</span>
                </Link>

                {/* Mobile Auth Section */}
                {!user && (
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        closeMobileMenu();
                      }}
                      className="w-full bg-gold-600 hover:bg-gold-700 text-white px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="h-5 w-5" />
                      <span>Sign In</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};