import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo');

export { stripePromise };

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo',
  apiVersion: '2023-10-16' as const,
  currency: 'usd',
  locale: 'en' as const,
};

// Product and price IDs - These are demo IDs, replace with your actual Stripe Price IDs
export const STRIPE_PRODUCTS = {
  pro: {
    productId: 'prod_cinespark_pro',
    monthly: 'price_1QZqGhP123abc456def789gh', // Replace with actual Price ID from Stripe Dashboard
    annual: 'price_1QZqGiP123abc456def789gh',  // Replace with actual Price ID from Stripe Dashboard
  },
  enterprise: {
    productId: 'prod_cinespark_enterprise', 
    monthly: 'price_1QZqGjP123abc456def789gh',  // Replace with actual Price ID from Stripe Dashboard
    annual: 'price_1QZqGkP123abc456def789gh',   // Replace with actual Price ID from Stripe Dashboard
  },
};

// Demo mode for development
const isDemoMode = !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                   import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === 'pk_test_demo';

// Stripe API helpers
export const createCheckoutSession = async (priceId: string, customerId?: string, accessToken?: string) => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    // In demo mode, simulate the checkout process
    if (isDemoMode) {
      console.log('🎭 Demo mode: Simulating Stripe checkout');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock session data
      return {
        sessionId: `cs_demo_${Date.now()}`,
        url: null, // No URL in demo mode, we'll handle locally
        demo: true
      };
    }

    // Use access token for authenticated requests, fallback to anon key
    const authToken = accessToken || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        priceId,
        customerId,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Checkout session error:', errorData);
      throw new Error('Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createCustomerPortalSession = async (customerId: string, accessToken?: string) => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    // In demo mode, redirect to profile page
    if (isDemoMode) {
      return {
        url: `${window.location.origin}/profile`,
        demo: true
      };
    }

    // Use access token for authenticated requests, fallback to anon key
    const authToken = accessToken || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/functions/v1/stripe-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/profile`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Portal session error:', errorData);
      throw new Error('Failed to create portal session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};