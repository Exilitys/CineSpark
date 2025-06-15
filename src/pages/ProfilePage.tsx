import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Zap, Crown, Edit3, Save, X, Camera, ArrowLeft, Check } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { profile, loading, updateProfile, getPlanDisplayName, getPlanColor } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    // Validate name
    if (!formData.full_name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    // Validate name length
    if (formData.full_name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    if (formData.full_name.trim().length > 50) {
      toast.error('Name must be less than 50 characters');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        full_name: formData.full_name.trim(),
        avatar_url: formData.avatar_url.trim() || null,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCreditsColor = (credits: number) => {
    if (credits >= 500) return 'text-green-400';
    if (credits >= 100) return 'text-gold-400';
    if (credits >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-600 text-gray-100';
      case 'pro':
        return 'bg-gradient-to-r from-gold-500 to-gold-600 text-white';
      case 'enterprise':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const getDisplayName = () => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Profile not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-gold-600 hover:bg-gold-700 text-white p-2 rounded-full transition-colors duration-200">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="Avatar URL (optional)"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500">Enter a URL for your profile picture</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">
                    {getDisplayName()}
                  </h2>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeStyle(profile.plan)}`}>
                    <Crown className="h-4 w-4 mr-1" />
                    {getPlanDisplayName(profile.plan)} Plan
                  </div>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      maxLength={50}
                      required
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">This name will be displayed in the navigation bar</span>
                      <span className={`${formData.full_name.length > 40 ? 'text-orange-400' : 'text-gray-500'}`}>
                        {formData.full_name.length}/50
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-white">{profile.full_name || 'Not set'}</span>
                    {profile.full_name && (
                      <Check className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-white">{user.email}</span>
                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">Read-only</span>
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Member Since
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-white">{formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Name Display Preview */}
          {isEditing && formData.full_name.trim() && (
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <h4 className="text-blue-400 font-medium text-sm mb-2">Preview</h4>
              <p className="text-blue-300 text-sm">
                Your name will appear as "<span className="font-medium">{formData.full_name.trim()}</span>" in the navigation bar and throughout the app.
              </p>
            </div>
          )}
        </motion.div>

        {/* Plan & Credits Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-gold-400" />
              Current Plan
            </h3>
            
            <div className="space-y-4">
              <div className={`inline-flex px-4 py-2 rounded-lg text-lg font-medium ${getPlanBadgeStyle(profile.plan)}`}>
                {getPlanDisplayName(profile.plan)} Plan
              </div>
              
              <div className="text-gray-400">
                {profile.plan === 'free' && (
                  <p>You're on the free plan with basic features and limited credits.</p>
                )}
                {profile.plan === 'pro' && (
                  <p>You have access to all pro features with enhanced AI capabilities.</p>
                )}
                {profile.plan === 'enterprise' && (
                  <p>You have full access to all enterprise features and priority support.</p>
                )}
              </div>

              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gold-600 hover:bg-gold-700 text-white py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {profile.plan === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
              </button>
            </div>
          </motion.div>

          {/* Credits Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-gold-400" />
              Credits Balance
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getCreditsColor(profile.credits)} mb-2`}>
                  {profile.credits.toLocaleString()}
                </div>
                <div className="text-gray-400">Credits remaining</div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Credit Usage</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Story generation:</span>
                    <span>10 credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shot list creation:</span>
                    <span>15 credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storyboard frame:</span>
                    <span>5 credits</span>
                  </div>
                </div>
              </div>

              {profile.credits < 50 && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    ⚠️ Low credits! Consider upgrading your plan for more credits.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Account Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/pricing')}
              className="bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Upgrade Plan
            </button>
            
            <button
              onClick={() => navigate('/projects')}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            >
              View Projects
            </button>
            
            <button
              onClick={() => {
                // Add export data functionality
                toast.info('Data export feature coming soon!');
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Export Data
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};