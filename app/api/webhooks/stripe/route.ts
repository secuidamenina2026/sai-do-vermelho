import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Initialize Stripe for webhook verification
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Initialize Supabase with service key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const dynamic = 'force-dynamic'

/**
 * Webhook handler for Stripe events
 * Handles: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle subscription created event
 * User completed checkout and subscription started
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId
    const plan = subscription.metadata?.plan

    if (!userId) {
      console.error('Subscription created but no userId in metadata:', subscription.id)
      return
    }

    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    // Update subscriptions table
    const { error } = await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscription.id,
        plan: plan || 'premium',
        status: subscription.status as 'active' | 'inactive' | 'canceled' | 'past_due',
        current_period_start: currentPeriodStart.toISOString().split('T')[0],
        current_period_end: currentPeriodEnd.toISOString().split('T')[0],
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
      return
    }

    // Update user's plan
    await supabase
      .from('users')
      .update({ plan: plan || 'premium' })
      .eq('id', userId)

    console.log(`✅ Subscription created for user ${userId}, plan: ${plan}`)
  } catch (error: any) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

/**
 * Handle subscription updated event
 * Handles: plan changes, payment method updates, renewal dates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId
    const plan = subscription.metadata?.plan

    if (!userId) {
      console.error('Subscription updated but no userId in metadata:', subscription.id)
      return
    }

    const currentPeriodStart = new Date(subscription.current_period_start * 1000)
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    // Update subscriptions table
    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan: plan || 'premium',
        status: subscription.status as 'active' | 'inactive' | 'canceled' | 'past_due',
        current_period_start: currentPeriodStart.toISOString().split('T')[0],
        current_period_end: currentPeriodEnd.toISOString().split('T')[0],
        cancel_at_period_end: subscription.cancel_at_period_end || false,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
      return
    }

    // Update user's plan if status changed to active
    if (subscription.status === 'active') {
      await supabase
        .from('users')
        .update({ plan: plan || 'premium' })
        .eq('id', userId)
    }

    console.log(`✅ Subscription updated for user ${userId}, status: ${subscription.status}`)
  } catch (error: any) {
    console.error('Error in handleSubscriptionUpdated:', error)
  }
}

/**
 * Handle subscription deleted event
 * User canceled subscription
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('Subscription deleted but no userId in metadata:', subscription.id)
      return
    }

    // Update subscriptions table
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled' as const,
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
      return
    }

    // Revert user to free plan
    await supabase
      .from('users')
      .update({ plan: 'free' })
      .eq('id', userId)

    console.log(`✅ Subscription canceled for user ${userId}`)
  } catch (error: any) {
    console.error('Error in handleSubscriptionDeleted:', error)
  }
}

/**
 * Handle charge failed event
 * Payment declined - subscription at risk
 */
async function handleChargeFailed(charge: Stripe.Charge) {
  try {
    const subscriptionId = charge.invoice ?
      (typeof charge.invoice === 'string' ? charge.invoice : charge.invoice.subscription)
      : null

    if (!subscriptionId || typeof subscriptionId !== 'string') {
      console.log('Charge failed but not associated with subscription:', charge.id)
      return
    }

    // Get subscription details
    const subscription = await stripeClient.subscriptions.retrieve(subscriptionId as string)
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('Failed charge but no userId in subscription metadata:', subscriptionId)
      return
    }

    // Update subscription status to past_due
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating subscription to past_due:', error)
      return
    }

    console.log(`⚠️ Charge failed for user ${userId}, subscription marked as past_due`)

    // TODO: Send email notification to user about failed payment
  } catch (error: any) {
    console.error('Error in handleChargeFailed:', error)
  }
}
