import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/app/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('Received Stripe event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata?.user_id
  const subscriptionId = session.subscription

  if (!userId || !subscriptionId) {
    console.error('Missing user_id or subscription_id in checkout session')
    return
  }

  // Fetch subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Calculate charity percentage (default 10%)
  const charityPercentage = 10

  // Calculate amounts
  const totalAmount = subscription.items.data[0].price.unit_amount / 100
  const charityAmount = totalAmount * (charityPercentage / 100)
  const prizePoolAmount = totalAmount * 0.10

  // Create payment record
  await supabase.from('payments').insert({
    user_id: userId,
    stripe_payment_intent_id: session.payment_intent,
    stripe_subscription_id: subscriptionId,
    amount: totalAmount,
    charity_amount: charityAmount,
    prize_pool_amount: prizePoolAmount,
    status: 'succeeded',
  })

  // Create/update charity contribution for the month
  const now = new Date()
  const { data: userData } = await supabase.from('users').select('selected_charity_id').eq('id', userId).single()

  if (userData?.selected_charity_id) {
    await supabase.from('charity_contributions').upsert({
      user_id: userId,
      charity_id: userData.selected_charity_id,
      amount: charityAmount,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }, {
      onConflict: 'user_id,charity_id,month,year',
    })
  }

  // Update user record with subscription info
  await supabase.from('users').update({
    subscription_id: subscriptionId,
    subscription_status: 'active',
    subscription_tier: subscription.items.data[0].price.id.includes('yearly') ? 'yearly' : 'monthly',
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  }).eq('id', userId)

  console.log(`Subscription activated for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    // Try to find by subscription ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('subscription_id', subscription.id)
      .single()

    if (!userData) return
  }

  await supabase.from('users').update({
    subscription_status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  }).eq('id', userId)

  console.log(`Subscription ${subscription.id} status updated to ${subscription.status}`)
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('subscription_id', subscription.id)
      .single()

    if (!userData) return
  }

  await supabase.from('users').update({
    subscription_status: 'canceled',
  }).eq('id', userId)

  console.log(`Subscription ${subscription.id} deleted/canceled`)
}

async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription
  const userId = invoice.subscription_details?.metadata?.user_id

  if (!userId) {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .single()

    if (!userData) return
  }

  const totalAmount = invoice.amount_paid / 100
  const charityPercentage = 10 // Would ideally get from user settings
  const charityAmount = totalAmount * (charityPercentage / 100)
  const prizePoolAmount = totalAmount * 0.10

  // Create payment record
  await supabase.from('payments').insert({
    user_id: userId,
    stripe_payment_intent_id: invoice.payment_intent,
    stripe_subscription_id: subscriptionId,
    amount: totalAmount,
    charity_amount: charityAmount,
    prize_pool_amount: prizePoolAmount,
    status: 'succeeded',
  })

  // Update/refresh subscription period
  await supabase.from('users').update({
    current_period_end: new Date(invoice.next_payment_attempt * 1000).toISOString(),
  }).eq('id' || userId)

  console.log(`Payment succeeded for user ${userId}`)
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('subscription_id', subscriptionId)
    .single()

  if (!userData) return

  await supabase.from('users').update({
    subscription_status: 'past_due',
  }).eq('id', userData.id)

  console.log(`Payment failed for user ${userData.id}`)
}
