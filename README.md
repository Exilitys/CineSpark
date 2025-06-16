# CineSpark AI - Stripe Integration

A complete AI-powered filmmaking pre-production platform with integrated Stripe payment processing.

## Features

### Core Functionality
- AI-powered story generation
- Professional shot list creation
- Visual storyboard generation
- Complete export system

### Payment Integration
- Secure Stripe payment processing
- Multiple subscription tiers (Free, Pro, Enterprise)
- Monthly and annual billing options
- Customer portal for subscription management
- Webhook handling for real-time updates

## Stripe Integration Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase (existing)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Stripe Dashboard Setup

1. **Create Products and Prices:**
   - Pro Plan: $29/month, $290/year
   - Enterprise Plan: $99/month, $990/year

2. **Configure Webhooks:**
   - Endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Update Price IDs:**
   Update the `STRIPE_PRODUCTS` object in `src/lib/stripe.ts` with your actual price IDs.

### 3. Supabase Edge Functions

Deploy the Stripe edge functions:

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
supabase functions deploy stripe-portal
```

Set the required secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Security Features

### PCI Compliance
- All payment processing handled by Stripe
- No sensitive card data stored locally
- PCI DSS Level 1 compliance through Stripe

### Data Protection
- SSL encryption for all communications
- Secure webhook signature verification
- Input validation and sanitization
- CSRF protection through Supabase auth

### Authentication & Authorization
- Supabase Auth integration
- Row Level Security (RLS) policies
- Secure session management
- Protected API endpoints

## Payment Flow

### 1. Plan Selection
- User selects a plan on the pricing page
- Authentication required for paid plans
- Session storage for unauthenticated users

### 2. Checkout Process
- Stripe Checkout session creation
- Secure redirect to Stripe-hosted checkout
- Customer creation/retrieval in Stripe

### 3. Webhook Processing
- Real-time subscription status updates
- User profile and credits management
- Email notifications (configurable)

### 4. Success Handling
- Redirect to success page
- Profile updates reflected immediately
- Access to premium features enabled

## Testing

### Test Mode Setup
1. Use Stripe test keys in development
2. Test with Stripe test card numbers:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`
   - 3D Secure: `4000002500003155`

### Webhook Testing
Use Stripe CLI for local webhook testing:

```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## Deployment Checklist

### Production Setup
- [ ] Replace test keys with live Stripe keys
- [ ] Configure production webhook endpoints
- [ ] Set up proper DNS and SSL certificates
- [ ] Configure email notifications
- [ ] Set up monitoring and logging
- [ ] Test all payment flows thoroughly

### Security Verification
- [ ] Verify webhook signature validation
- [ ] Test authentication flows
- [ ] Validate input sanitization
- [ ] Check RLS policies
- [ ] Verify SSL certificate

## Monitoring & Analytics

### Key Metrics to Track
- Subscription conversion rates
- Payment success/failure rates
- Customer lifetime value
- Churn rates
- Feature usage by plan tier

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Automatic retry mechanisms
- Fallback payment methods

## Support & Maintenance

### Customer Support
- Stripe Customer Portal for self-service
- Subscription management tools
- Billing history and invoices
- Payment method updates

### Maintenance Tasks
- Regular webhook endpoint monitoring
- Subscription status synchronization
- Failed payment handling
- Plan migration tools

## API Reference

### Stripe Functions

#### Create Checkout Session
```typescript
POST /functions/v1/stripe-checkout
{
  "priceId": "price_xxx",
  "customerId": "cus_xxx", // optional
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/pricing"
}
```

#### Create Portal Session
```typescript
POST /functions/v1/stripe-portal
{
  "customerId": "cus_xxx",
  "returnUrl": "https://app.com/profile"
}
```

### Database Schema

#### User Profiles
```sql
user_profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  plan text CHECK (plan IN ('free', 'pro', 'enterprise')),
  credits integer DEFAULT 100,
  created_at timestamptz,
  updated_at timestamptz
)
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events:**
   - Verify endpoint URL in Stripe dashboard
   - Check webhook secret configuration
   - Ensure proper CORS headers

2. **Payment not updating user profile:**
   - Check webhook processing logs
   - Verify user_id in subscription metadata
   - Ensure database permissions

3. **Checkout session creation fails:**
   - Verify Stripe API keys
   - Check user authentication
   - Validate price IDs

### Debug Tools
- Stripe Dashboard event logs
- Supabase function logs
- Browser network inspector
- Webhook signature verification

For additional support, refer to the [Stripe documentation](https://stripe.com/docs) and [Supabase documentation](https://supabase.com/docs).