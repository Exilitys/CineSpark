import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      cryptoProvider
    )

    console.log(`🔔 Webhook received: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  if (!userId) {
    console.error('No user_id in session metadata')
    return
  }

  console.log(`✅ Checkout completed for user: ${userId}`)
  
  // Update user profile with subscription info
  const { error } = await supabase
    .from('user_profiles')
    .update({
      stripe_customer_id: session.customer as string,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  // Determine plan and credits based on price ID
  const priceId = subscription.items.data[0]?.price.id
  const { plan, credits } = getPlanFromPriceId(priceId)

  console.log(`📝 Subscription created for user: ${userId}, plan: ${plan}`)

  // Update user profile
  const { error } = await supabase
    .from('user_profiles')
    .update({
      plan,
      credits,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const { plan, credits } = getPlanFromPriceId(priceId)

  console.log(`🔄 Subscription updated for user: ${userId}, plan: ${plan}`)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      plan,
      credits,
      subscription_status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`❌ Subscription deleted for user: ${userId}`)

  // Downgrade to free plan
  const { error } = await supabase
    .from('user_profiles')
    .update({
      plan: 'free',
      credits: 100,
      stripe_subscription_id: null,
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`💰 Payment succeeded for user: ${userId}`)

  // Add credits for successful payment
  const priceId = subscription.items.data[0]?.price.id
  const { credits } = getPlanFromPriceId(priceId)

  const { error } = await supabase
    .from('user_profiles')
    .update({
      credits,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating user credits:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  console.log(`💸 Payment failed for user: ${userId}`)

  // You might want to send an email notification here
  // or implement retry logic
}

function getPlanFromPriceId(priceId: string): { plan: string; credits: number } {
  // Map price IDs to plans and credits
  const priceMap: Record<string, { plan: string; credits: number }> = {
    'price_pro_monthly_29': { plan: 'pro', credits: 1000 },
    'price_pro_annual_290': { plan: 'pro', credits: 1000 },
    'price_enterprise_monthly_99': { plan: 'enterprise', credits: 5000 },
    'price_enterprise_annual_990': { plan: 'enterprise', credits: 5000 },
  }

  return priceMap[priceId] || { plan: 'free', credits: 100 }
}