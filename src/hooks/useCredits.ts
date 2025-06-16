import { useState } from 'react';
import { useProfile } from './useProfile';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface CreditTransaction {
  id: string;
  user_id: string;
  action_type: string;
  credits_deducted: number;
  credits_before: number;
  credits_after: number;
  transaction_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface CreditValidationResult {
  isValid: boolean;
  currentCredits: number;
  requiredCredits: number;
  message?: string;
}

interface CreditDeductionResult {
  success: boolean;
  transaction?: CreditTransaction;
  newBalance?: number;
  error?: string;
}

// Credit costs for different actions
export const CREDIT_COSTS = {
  STORY_GENERATION: 10,
  STORY_MODIFICATION: 5,
  SHOT_LIST_GENERATION: 15,
  SHOT_LIST_MODIFICATION: 8,
  PHOTOBOARD_GENERATION: 20,
  PHOTOBOARD_FRAME: 5,
  PHOTOBOARD_REGENERATION: 3,
  AI_ENHANCEMENT: 2,
  EXPORT_PREMIUM: 5,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export const useCredits = () => {
  const { user, initialized } = useAuth();
  const { profile, updateProfile, refetch } = useProfile();
  const [processing, setProcessing] = useState(false);

  /**
   * Generate a unique transaction ID
   */
  const generateTransactionId = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `txn_${timestamp}_${random}`;
  };

  /**
   * Validate if user has sufficient credits for an action
   */
  const validateCredits = async (action: CreditAction): Promise<CreditValidationResult> => {
    // Wait for auth to be initialized
    if (!initialized) {
      return {
        isValid: false,
        currentCredits: 0,
        requiredCredits: CREDIT_COSTS[action],
        message: 'Authentication loading...'
      };
    }

    if (!user || !profile) {
      return {
        isValid: false,
        currentCredits: 0,
        requiredCredits: CREDIT_COSTS[action],
        message: 'User not authenticated'
      };
    }

    const requiredCredits = CREDIT_COSTS[action];
    const currentCredits = profile.credits;

    if (currentCredits < requiredCredits) {
      return {
        isValid: false,
        currentCredits,
        requiredCredits,
        message: `Insufficient credits. You need ${requiredCredits} credits but only have ${currentCredits}.`
      };
    }

    if (currentCredits === 0) {
      return {
        isValid: false,
        currentCredits: 0,
        requiredCredits,
        message: 'Your credit balance is 0. Please upgrade your plan to continue.'
      };
    }

    return {
      isValid: true,
      currentCredits,
      requiredCredits
    };
  };

  /**
   * Log a credit transaction to the database
   */
  const logTransaction = async (
    action: CreditAction,
    creditsDeducted: number,
    creditsBefore: number,
    creditsAfter: number,
    transactionId: string,
    metadata: Record<string, any> = {}
  ): Promise<CreditTransaction | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          action_type: action,
          credits_deducted: creditsDeducted,
          credits_before: creditsBefore,
          credits_after: creditsAfter,
          transaction_id: transactionId,
          metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging credit transaction:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error logging credit transaction:', error);
      return null;
    }
  };

  /**
   * Deduct credits for an action with atomic transaction
   */
  const deductCredits = async (
    action: CreditAction,
    metadata: Record<string, any> = {}
  ): Promise<CreditDeductionResult> => {
    if (!initialized) {
      return {
        success: false,
        error: 'Authentication not initialized'
      };
    }

    if (!user || !profile) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    setProcessing(true);

    try {
      // Step 1: Validate credits
      const validation = await validateCredits(action);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.message
        };
      }

      const creditsToDeduct = CREDIT_COSTS[action];
      const creditsBefore = validation.currentCredits;
      const creditsAfter = creditsBefore - creditsToDeduct;
      const transactionId = generateTransactionId();

      // Step 2: Start atomic transaction
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          credits: creditsAfter,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('credits', creditsBefore) // Optimistic locking
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user credits:', updateError);
        
        // Check if it's a concurrency issue
        if (updateError.code === 'PGRST116') {
          return {
            success: false,
            error: 'Credit balance was modified by another operation. Please try again.'
          };
        }

        return {
          success: false,
          error: 'Failed to deduct credits. Please try again.'
        };
      }

      // Step 3: Log the transaction
      const transaction = await logTransaction(
        action,
        creditsToDeduct,
        creditsBefore,
        creditsAfter,
        transactionId,
        {
          ...metadata,
          user_email: user.email,
          timestamp: new Date().toISOString()
        }
      );

      // Step 4: Update local profile state
      await refetch();

      console.log(`✅ Credits deducted successfully:`, {
        action,
        creditsDeducted: creditsToDeduct,
        creditsBefore,
        creditsAfter,
        transactionId
      });

      return {
        success: true,
        transaction: transaction || undefined,
        newBalance: creditsAfter
      };

    } catch (error) {
      console.error('Error in credit deduction:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during credit deduction'
      };
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Get user's credit transaction history
   */
  const getTransactionHistory = async (limit: number = 50): Promise<CreditTransaction[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  };

  /**
   * Check if user can perform an action (without deducting credits)
   */
  const canPerformAction = async (action: CreditAction): Promise<boolean> => {
    const validation = await validateCredits(action);
    return validation.isValid;
  };

  /**
   * Get credit cost for an action
   */
  const getCreditCost = (action: CreditAction): number => {
    return CREDIT_COSTS[action];
  };

  /**
   * Get formatted action name for display
   */
  const getActionDisplayName = (action: CreditAction): string => {
    const displayNames: Record<CreditAction, string> = {
      STORY_GENERATION: 'Story Generation',
      STORY_MODIFICATION: 'Story Modification',
      SHOT_LIST_GENERATION: 'Shot List Generation',
      SHOT_LIST_MODIFICATION: 'Shot List Modification',
      PHOTOBOARD_GENERATION: 'Photoboard Generation',
      PHOTOBOARD_FRAME: 'Photoboard Frame',
      PHOTOBOARD_REGENERATION: 'Frame Regeneration',
      AI_ENHANCEMENT: 'AI Enhancement',
      EXPORT_PREMIUM: 'Premium Export'
    };
    return displayNames[action];
  };

  return {
    // State
    credits: profile?.credits || 0,
    plan: profile?.plan || 'free',
    processing,

    // Core functions
    validateCredits,
    deductCredits,
    canPerformAction,
    getCreditCost,
    getActionDisplayName,
    getTransactionHistory,

    // Utility
    CREDIT_COSTS,
    
    // Legacy compatibility
    consumeCredits: async (amount: number) => {
      console.warn('consumeCredits is deprecated. Use deductCredits with specific action instead.');
      if (!profile) throw new Error('Profile not loaded');
      return updateProfile({ credits: Math.max(profile.credits - amount, 0) });
    },
    addCredits: async (amount: number) => {
      if (!profile) throw new Error('Profile not loaded');
      return updateProfile({ credits: profile.credits + amount });
    },
    checkCredits: (requiredAmount: number) => {
      return profile ? profile.credits >= requiredAmount : false;
    },
    refetch
  };
};