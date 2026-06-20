export * from '../lib/supabase'

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly'
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 29.99,
    interval: 'month',
    features: [
      'Enter up to 5 latest scores',
      'Participate in monthly draws',
      'Select your charity',
      '10% default contribution to charity',
      'Winner verification portal',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 299.99,
    interval: 'year',
    features: [
      'Everything in Monthly',
      '2 months free (save $60)',
      'Priority winner verification',
      'Exclusive charity events',
      'Early access to new features',
    ],
  },
]

export interface DrawResult {
  draw: Draw
  winners: {
    '3-number': DrawParticipant[]
    '4-number': DrawParticipant[]
    '5-number': DrawParticipant[]
  }
  prizeDistribution: {
    '3-number': number
    '4-number': number
    '5-number': number
  }
  pools: {
    '3-number': number
    '4-number': number
    '5-number': number
  }
  has5MatchWinner: boolean
}
