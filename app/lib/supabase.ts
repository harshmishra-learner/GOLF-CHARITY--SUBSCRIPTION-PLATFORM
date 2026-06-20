import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key
export const createClientComponent = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export type User = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_tier: 'monthly' | 'yearly' | null
  subscription_status: 'active' | 'inactive' | 'canceled' | 'past_due' | null
  subscription_id: string | null
  current_period_end: string | null
  charity_percentage: number | null
  selected_charity_id: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export type Charity = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  website: string | null
  contact_email: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type GolfScore = {
  id: string
  user_id: string
  score: number
  played_date: string
  created_at: string
  updated_at: string
}

export type Draw = {
  id: string
  month: number
  year: number
  draw_type: '3-number' | '4-number' | '5-number'
  status: 'draft' | 'simulation' | 'published' | 'paid'
  winning_numbers: number[]
  jackpot_amount: number
  total_pool_amount: number
  created_at: string
  published_at: string | null
}

export type DrawParticipant = {
  id: string
  draw_id: string
  user_id: string
  user_numbers: number[]
  match_type: '3-number' | '4-number' | '5-number'
  matched_count: number
  won: boolean
  prize_amount: number | null
  payout_status: 'pending' | 'paid'
  proof_url: string | null
  proof_approved: boolean
  created_at: string
}

export type WinnerVerification = {
  id: string
  draw_participant_id: string
  user_id: string
  proof_url: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export type Payment = {
  id: string
  user_id: string
  stripe_payment_intent_id: string | null
  stripe_subscription_id: string | null
  amount: number
  charity_amount: number
  prize_pool_amount: number
  status: 'succeeded' | 'failed' | 'refunded'
  created_at: string
}

export type CharityContribution = {
  id: string
  user_id: string
  charity_id: string
  payment_id: string | null
  amount: number
  month: number
  year: number
  created_at: string
}
