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

// Product and price IDs (these would come from your Stripe dashboard)
export const STRIPE_PRODUCTS = {
  pro: {
    productId: 'prod_cinespark_pro',
    monthly: 'price_pro_monthly_29',
    annual: 'price_pro_annual_290',
  },
  enterprise: {
    productId: 'prod_cinespark_enterprise', 
    monthly: 'price_enterprise_monthly_99',
    annual: 'price_enterprise_annual_990',
  },
};

// Stripe API helpers
export const createCheckoutSession = async (priceId: string, customerId?: string) => {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createCustomerPortalSession = async (customerId: string) => {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/profile`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};