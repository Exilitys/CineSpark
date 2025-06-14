import { useProfile } from './useProfile';

export const useCredits = () => {
  const { 
    profile, 
    loading, 
    consumeCredits, 
    addCredits, 
    checkCredits, 
    refetch 
  } = useProfile();

  return {
    credits: profile?.credits || 0,
    plan: profile?.plan || 'free',
    loading,
    consumeCredits,
    addCredits,
    checkCredits,
    refetch,
  };
};