import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from './useAuth';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, initialized } = useAuth();

  useEffect(() => {
    // Only fetch profile if auth is initialized and user exists
    if (initialized) {
      if (user) {
        fetchProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    }
  }, [user, initialized]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          credits: 100,
          plan: 'free',
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const updateProfile = async (updates: UserProfileUpdate) => {
    if (!user || !profile) return;

    try {
      console.log('🔄 Updating profile with:', updates);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        throw error;
      }
      
      console.log('✅ Profile updated successfully:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('📤 Starting avatar upload for user:', user.id);
      
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please use JPG, PNG, or GIF.');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('📁 Uploading file:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('🔗 Public URL generated:', publicUrl);

      return publicUrl;
    } catch (error) {
      console.error('💥 Avatar upload error:', error);
      throw error;
    }
  };

  const deleteAvatar = async (avatarUrl: string): Promise<void> => {
    if (!user || !avatarUrl) return;

    try {
      // Extract filename from URL
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      console.log('🗑️ Deleting avatar:', filePath);

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete error:', error);
        // Don't throw error for delete failures as it's not critical
      } else {
        console.log('✅ Avatar deleted successfully');
      }
    } catch (error) {
      console.error('💥 Avatar delete error:', error);
      // Don't throw error for delete failures
    }
  };

  const updateCredits = async (newCredits: number) => {
    return updateProfile({ credits: newCredits });
  };

  const updatePlan = async (newPlan: string) => {
    return updateProfile({ plan: newPlan });
  };

  const consumeCredits = async (amount: number) => {
    if (!profile) throw new Error('Profile not loaded');
    
    if (profile.credits < amount) {
      throw new Error('Insufficient credits');
    }

    const newCredits = Math.max(profile.credits - amount, 0);
    return updateCredits(newCredits);
  };

  const addCredits = async (amount: number) => {
    if (!profile) throw new Error('Profile not loaded');
    
    const newCredits = profile.credits + amount;
    return updateCredits(newCredits);
  };

  const checkCredits = (requiredAmount: number) => {
    return profile ? profile.credits >= requiredAmount : false;
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'pro': return 'Pro';
      case 'enterprise': return 'Enterprise';
      default: return 'Free';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-400';
      case 'pro': return 'text-gold-400';
      case 'enterprise': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    updateCredits,
    updatePlan,
    consumeCredits,
    addCredits,
    checkCredits,
    getPlanDisplayName,
    getPlanColor,
    refetch: fetchProfile,
  };
};