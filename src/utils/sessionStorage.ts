// Session storage utilities for secure temporary data handling
export interface StoredPricingData {
  planId: string;
  planName: string;
  price: number;
  timestamp: number;
  expiresAt: number;
}

const PRICING_SESSION_KEY = 'cinespark_pricing_session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export const storePricingSession = (planId: string, planName: string, price: number): void => {
  const now = Date.now();
  const sessionData: StoredPricingData = {
    planId,
    planName,
    price,
    timestamp: now,
    expiresAt: now + SESSION_DURATION
  };
  
  try {
    sessionStorage.setItem(PRICING_SESSION_KEY, JSON.stringify(sessionData));
    console.log('💾 Pricing session stored:', { planId, planName, price });
  } catch (error) {
    console.error('❌ Failed to store pricing session:', error);
  }
};

export const getPricingSession = (): StoredPricingData | null => {
  try {
    const stored = sessionStorage.getItem(PRICING_SESSION_KEY);
    if (!stored) {
      console.log('📭 No pricing session found');
      return null;
    }

    const sessionData: StoredPricingData = JSON.parse(stored);
    const now = Date.now();

    // Check if session has expired
    if (now > sessionData.expiresAt) {
      console.log('⏰ Pricing session expired, clearing');
      clearPricingSession();
      return null;
    }

    console.log('📦 Retrieved pricing session:', sessionData);
    return sessionData;
  } catch (error) {
    console.error('❌ Failed to retrieve pricing session:', error);
    clearPricingSession();
    return null;
  }
};

export const clearPricingSession = (): void => {
  try {
    sessionStorage.removeItem(PRICING_SESSION_KEY);
    console.log('🗑️ Pricing session cleared');
  } catch (error) {
    console.error('❌ Failed to clear pricing session:', error);
  }
};

export const hasPricingSession = (): boolean => {
  return getPricingSession() !== null;
};