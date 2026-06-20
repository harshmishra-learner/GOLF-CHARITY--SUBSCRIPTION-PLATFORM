import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
})

export const MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_ID_MONTHLY!
export const YEARLY_PRICE_ID = process.env.STRIPE_PRICE_ID_YEARLY!

export const calculatePrizePool = (activeSubscriberCount: number): number => {
  const contributionRate = 0.10 // 10% of subscription goes to prize pool
  const monthlyBase = 29.99 // Assumed monthly subscription price
  const yearlyBase = 299.99 // Assumed yearly subscription price

  // Average subscription value
  const avgSubscriptionValue = (monthlyBase * 9 + yearlyBase) / 10 // Assuming 9:1 ratio
  const totalPool = avgSubscriptionValue * contributionRate * activeSubscriberCount

  return Math.round(totalPool * 100) / 100
}

export const calculateDistribution = (totalPool: number) => {
  return {
    '5-number': Math.round(totalPool * 0.40 * 100) / 100,
    '4-number': Math.round(totalPool * 0.35 * 100) / 100,
    '3-number': Math.round(totalPool * 0.25 * 100) / 100,
  }
}
