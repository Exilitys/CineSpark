import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Zap, Crown, Edit3, Save, X, Camera, ArrowLeft, Check, Upload, AlertCircle, Image, Trash2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { profile, loading, updateProfile, uploadAvatar, deleteAvatar, getPlanDisplayName, getPlanColor } = useProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
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
      setPreviewImage(profile.avatar_url || null);
    }
  }, [profile]);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPG, PNG, or GIF)';
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      toast.loading('Uploading image...', { id: 'upload' });
      
      // Upload to Supabase Storage
      const uploadedUrl = await uploadAvatar(file);
      
      // Update form data with new URL
      setFormData(prev => ({ ...prev, avatar_url: uploadedUrl }));
      setPreviewImage(uploadedUrl);
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      
      toast.success('Image uploaded successfully!', { id: 'upload' });
    } catch (error: any) {
      toast.error(error.message || 'Error uploading image. Please try again.', { id: 'upload' });
      console.error('Upload error:', error);
      
      // Reset preview on error
      setPreviewImage(profile?.avatar_url || null);
      setFormData(prev => ({ ...prev, avatar_url: profile?.avatar_url || '' }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return;

    try {
      toast.loading('Removing avatar...', { id: 'remove-avatar' });
      
      // Delete from storage
      await deleteAvatar(profile.avatar_url);
      
      // Update form data
      setFormData(prev => ({ ...prev, avatar_url: '' }));
      setPreviewImage(null);
      
      toast.success('Avatar removed successfully!', { id: 'remove-avatar' });
    } catch (error: any) {
      toast.error('Error removing avatar', { id: 'remove-avatar' });
      console.error('Remove avatar error:', error);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
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
      setPreviewImage(profile.avatar_url || null);
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
          className="bg-gray-800 rounded-xl border border-gray-700 mb-8 overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-8 py-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                <p className="text-gray-400">Manage your account information and preferences</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving || uploading}
                    className="text-gray-400 hover:text-white transition-colors duration-200 p-2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  {/* Avatar Display/Upload */}
                  <div className="relative inline-block mb-6">
                    <div 
                      className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
                        dragOver ? 'border-gold-500' : 'border-gray-600'
                      } ${isEditing ? 'cursor-pointer hover:border-gold-500' : ''} transition-all duration-200`}
                      onClick={isEditing ? triggerFileInput : undefined}
                      onDrop={isEditing ? handleDrop : undefined}
                      onDragOver={isEditing ? handleDragOver : undefined}
                      onDragLeave={isEditing ? handleDragLeave : undefined}
                    >
                      {uploading ? (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs text-gray-400">Uploading...</p>
                          </div>
                        </div>
                      ) : previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={() => {
                            console.error('Failed to load avatar image');
                            setPreviewImage(null);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Drag Overlay */}
                      {dragOver && isEditing && (
                        <div className="absolute inset-0 bg-gold-500 bg-opacity-20 flex items-center justify-center rounded-full">
                          <Upload className="h-8 w-8 text-gold-400" />
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <button
                        onClick={triggerFileInput}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 bg-gold-600 hover:bg-gold-700 disabled:bg-gray-600 text-white p-3 rounded-full transition-colors duration-200 shadow-lg"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Upload Instructions */}
                  {isEditing && (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={triggerFileInput}
                          disabled={uploading}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Choose Image</span>
                        </button>
                        
                        {previewImage && (
                          <button
                            onClick={handleRemoveAvatar}
                            disabled={uploading}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-2 px-3 rounded-lg transition-colors duration-200"
                            title="Remove avatar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>• JPG, PNG, or GIF format</p>
                        <p>• Maximum size: 5MB</p>
                        <p>• Recommended: 400x400px</p>
                        <p>• Drag & drop supported</p>
                      </div>
                    </div>
                  )}

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label="Upload profile picture"
                  />

                  {/* Current Status */}
                  {!isEditing && (
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold text-white">
                        {getDisplayName()}
                      </h4>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeStyle(profile.plan)}`}>
                        <Crown className="h-4 w-4 mr-1" />
                        {getPlanDisplayName(profile.plan)} Plan
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
                  
                  <div className="space-y-6">
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
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200"
                            maxLength={50}
                            required
                            aria-describedby="name-help"
                          />
                          <div className="flex items-center justify-between text-xs">
                            <span id="name-help" className="text-gray-400">This name will be displayed throughout the app</span>
                            <span className={`${formData.full_name.length > 40 ? 'text-orange-400' : 'text-gray-400'}`}>
                              {formData.full_name.length}/50
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-600 rounded-lg">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="text-white flex-1">{profile.full_name || 'Not set'}</span>
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
                      <div className="flex items-center space-x-3 p-3 bg-gray-600 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-white flex-1">{user.email}</span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Read-only</span>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Member Since
                      </label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-600 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-white">{formatDate(profile.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name Preview */}
                {isEditing && formData.full_name.trim() && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-blue-400 font-medium text-sm mb-1">Preview</h4>
                        <p className="text-blue-300 text-sm">
                          Your name will appear as "<span className="font-medium">{formData.full_name.trim()}</span>" in the navigation bar and throughout the app.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
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
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">
                      Low credits! Consider upgrading your plan for more credits.
                    </p>
                  </div>
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
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/pricing')}
              className="bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>Upgrade Plan</span>
            </button>
            
            <button
              onClick={() => navigate('/projects')}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Image className="h-4 w-4" />
              <span>View Projects</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};