'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header, Footer } from '@/app/components/layout'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Card, CardContent } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import type { Charity } from '@/app/lib/supabase'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const preselectedCharityId = searchParams.get('charity')

  const [step, setStep] = useState<'account' | 'subscription' | 'charity'>('account')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    subscriptionTier: 'monthly' as 'monthly' | 'yearly',
    charityPercentage: 10,
    selectedCharityId: preselectedCharityId || '',
  })
  const [charities, setCharities] = useState<Charity[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchCharities() {
      const supabase = createClient()
      const { data } = await supabase.from('charities').select('*')
      if (data) setCharities(data)
    }
    fetchCharities()
  }, [])

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setStep('subscription')
      setLoading(false)
    }
  }

  const handleSubscriptionSelect = (tier: 'monthly' | 'yearly') => {
    setFormData({ ...formData, subscriptionTier: tier })
    setStep('charity')
  }

  const handleCharitySubmit = async () => {
    if (!formData.selectedCharityId) {
      setError('Please select a charity')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Update user profile with subscription info and charity
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: formData.fullName || user.user_metadata.full_name,
          subscription_tier: formData.subscriptionTier,
          charity_percentage: formData.charityPercentage,
          selected_charity_id: formData.selectedCharityId,
        })

      if (updateError) throw updateError

      // Create Stripe checkout session
      const priceId = formData.subscriptionTier === 'yearly'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY

      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/signup`,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('Failed to create subscription')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const subscriptionPlans = [
    {
      tier: 'monthly' as const,
      name: 'Monthly',
      price: 29.99,
      period: '/month',
      description: 'Perfect for trying out',
    },
    {
      tier: 'yearly' as const,
      name: 'Yearly',
      price: 299.99,
      period: '/year',
      description: 'Save $60 (2 months free)',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-xl">
            <CardContent className="p-8">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-center space-x-4">
                  {['account', 'subscription', 'charity'].map((s, i) => (
                    <div key={s} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                        ['account', 'subscription', 'charity'].indexOf(step) >= i
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {i + 1}
                      </div>
                      {i < 2 && <div className="w-16 h-1 mx-2 rounded" style={{
                        background: ['account', 'subscription', 'charity'].indexOf(step) > i
                          ? '#0ea5e9'
                          : '#e5e7eb'
                      }} />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-2 space-x-12 text-sm">
                  <span className={step === 'account' ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                    Account
                  </span>
                  <span className={step === 'subscription' ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                    Subscription
                  </span>
                  <span className={step === 'charity' ? 'text-primary-600 font-medium' : 'text-gray-500'}>
                    Charity
                  </span>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              {/* Step 1: Account */}
              {step === 'account' && (
                <form onSubmit={handleAccountSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="••••••••"
                      minLength={8}
                    />
                  </div>
                  <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={loading}>
                    Create Account
                  </Button>
                </form>
              )}

              {/* Step 2: Subscription */}
              {step === 'subscription' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                    <p className="text-gray-600 mt-2">Select the plan that works for you</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {subscriptionPlans.map((plan) => (
                      <Card
                        key={plan.tier}
                        className={`cursor-pointer transition-all ${
                          formData.subscriptionTier === plan.tier
                            ? 'ring-2 ring-primary-500 bg-primary-50'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleSubscriptionSelect(plan.tier)}
                      >
                        <CardContent className="p-6 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                              {plan.tier === 'yearly' && (
                                <span className="bg-accent-100 text-accent-700 text-xs font-medium px-2 py-1 rounded-full">
                                  Best Value
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                              ${plan.price}
                              <span className="text-base font-normal text-gray-600">{plan.period}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep('account')} className="flex-1">
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setStep('charity')}
                      className="flex-1"
                      disabled={!formData.subscriptionTier}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Charity */}
              {step === 'charity' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Choose Your Charity
                    </h2>
                    <p className="text-gray-600">
                      Select a charity to support with a portion of your subscription
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Charity Selection
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {/* None Option */}
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          !formData.selectedCharityId
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData({ ...formData, selectedCharityId: '' })}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">No Specific Charity</div>
                            <div className="text-sm text-gray-600">
                              Contribute to our general charity fund
                            </div>
                          </div>
                          {!formData.selectedCharityId && (
                            <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {charities.map((charity) => (
                        <div
                          key={charity.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.selectedCharityId === charity.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData({ ...formData, selectedCharityId: charity.id })}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-gray-900">{charity.name}</div>
                                {charity.is_featured && (
                                  <span className="bg-accent-100 text-accent-700 text-xs font-medium px-2 py-1 rounded-full">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {charity.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Charity Contribution: {formData.charityPercentage}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={formData.charityPercentage}
                      onChange={(e) => setFormData({ ...formData, charityPercentage: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10%</span>
                      <span>100%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Default: 10% of your subscription supports your chosen charity.
                      Increase to contribute more.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep('subscription')} className="flex-1">
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCharitySubmit}
                      className="flex-1"
                      isLoading={loading}
                      disabled={!formData.selectedCharityId}
                    >
                      Complete Signup
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
