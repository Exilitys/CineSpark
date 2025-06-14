import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Film, Sparkles, Home, FileText, Camera, Image, Download, User, LogOut, CreditCard, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../hooks/useCredits';
import { AuthModal } from '../Auth/AuthModal';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const projectId = params.projectId;
  const { user, signOut } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: `/story/${projectId}`, icon: FileText, label: 'Story' },
    { path: `/shots/${projectId}`, icon: Camera, label: 'Shot List' },
    { path: `/photoboard/${projectId}`, icon: Image, label: 'Photoboard' },
    { path: `/export/${projectId}`, icon: Download, label: 'Export' },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
    setShowUserMenu(false);
  };

  const getCreditsColor = (credits: number) => {
    if (credits >= 500) return 'text-green-400';
    if (credits >= 100) return 'text-gold-400';
    if (credits >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Film className="h-8 w-8 text-gold-500 group-hover:text-gold-400 transition-colors" />
                <Sparkles className="h-4 w-4 text-cinema-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white group-hover:text-gold-400 transition-colors">
                  CineSpark AI
                </h1>
                <p className="text-xs text-gray-400 -mt-1">Professional Pre-production</p>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-8">
              {navItems.map(({ path, icon: Icon, label }) => {
                // Skip project-specific nav items if no projectId
                if (path.includes('undefined') || (!projectId && path !== '/')) {
                  return null;
                }
                
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      location.pathname === path
                        ? 'bg-cinema-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
              
              {/* Pricing Link */}
              <Link
                to="/pricing"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/pricing'
                    ? 'bg-cinema-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Pricing</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Credits Display */}
                  <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-lg">
                    <Zap className="h-4 w-4 text-gold-400" />
                    <span className={`text-sm font-medium ${getCreditsColor(credits)}`}>
                      {creditsLoading ? '...' : credits.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">credits</span>
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      <User className="h-4 w-4" />
                      <span>{user.email?.split('@')[0]}</span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50">
                        <div className="py-1">
                          <div className="px-4 py-3 text-sm border-b border-gray-700">
                            <div className="text-gray-300">{user.email}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Zap className="h-3 w-3 text-gold-400" />
                              <span className={`text-xs font-medium ${getCreditsColor(credits)}`}>
                                {credits.toLocaleString()} credits remaining
                              </span>
                            </div>
                          </div>
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
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/pricing"
                    className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200"
                  >
                    Pricing
                  </Link>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};