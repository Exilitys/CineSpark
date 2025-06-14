import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from './useAuth';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

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
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
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