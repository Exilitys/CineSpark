import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useCredits = () => {
  const [credits, setCredits] = useState(100); // Default starting credits
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCredits();
    } else {
      setCredits(100);
      setLoading(false);
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // For now, we'll simulate credits based on user creation date
      // In a real app, you'd have a user_credits table
      const userCreatedAt = new Date(user.created_at || Date.now());
      const daysSinceCreation = Math.floor((Date.now() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Simulate credit usage over time (starting with 100, decreasing by ~5 per day)
      const simulatedCredits = Math.max(100 - (daysSinceCreation * 5), 0);
      
      setCredits(simulatedCredits);
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(100); // Fallback to default
    } finally {
      setLoading(false);
    }
  };

  const consumeCredits = async (amount: number) => {
    if (!user) throw new Error('User not authenticated');
    
    if (credits < amount) {
      throw new Error('Insufficient credits');
    }

    try {
      // In a real app, you'd update the database here
      // For now, we'll just update local state
      setCredits(prev => Math.max(prev - amount, 0));
      
      return true;
    } catch (error) {
      console.error('Error consuming credits:', error);
      throw error;
    }
  };

  const addCredits = async (amount: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // In a real app, you'd update the database here
      setCredits(prev => prev + amount);
      
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  };

  const checkCredits = (requiredAmount: number) => {
    return credits >= requiredAmount;
  };

  return {
    credits,
    loading,
    consumeCredits,
    addCredits,
    checkCredits,
    refetch: fetchCredits,
  };
};