'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { formatCurrency, formatDate, formatMonthYear } from '@/app/lib/utils'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<any[]>([])
  const [upcomingDraw, setUpcomingDraw] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      // Get user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Get user scores
      const { data: scoresData } = await supabase
        .from('golf_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('played_date', { ascending: false })

      setScores(scoresData || [])

      // Check for upcoming draw
      const now = new Date()
      const { month, year } = { month: now.getMonth() + 1, year: now.getFullYear() }
      const { data: drawData } = await supabase
        .from('draws')
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .single()

      if (drawData) {
        setUpcomingDraw(drawData)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const monthlyContribution = profile?.subscription_tier === 'yearly'
    ? 299.99 * 0.10 / 12
    : 29.99 * 0.10

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  const latestScores = scores.slice(0, 5)
  const userNumbers = latestScores.length === 5
    ? latestScores.sort((a, b) => a.score - b.score).map(s => s.score)
    : []

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-xl text-gray-600">
          Here's your golf charity dashboard
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Subscription</div>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {profile?.subscription_status || 'Inactive'}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {profile?.current_period_end
                  ? `Renews ${formatDate(profile.current_period_end)}`
                  : 'No active subscription'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Your Scores</div>
              <div className="text-2xl font-bold text-gray-900">{scores.length}/5</div>
              <div className="text-sm text-gray-500 mt-2">
                {5 - scores.length} more to complete set
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Won</div>
              <div className="text-2xl font-bold text-accent-600">$0.00</div>
              <div className="text-sm text-gray-500 mt-2">
                Lifetime winnings
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-600 mb-1">Monthly Impact</div>
              <div className="text-2xl font-bold text-secondary-600">
                {formatCurrency(monthlyContribution)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Goes to charity
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            <Link href="/dashboard/scores">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Your Latest Scores</span>
                    <Button variant="primary" size="sm">Enter New Score</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestScores.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">⛳</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Scores Yet</h3>
                      <p className="text-gray-600 mb-6">
                        Enter your latest Stableford scores to participate in monthly draws.
                      </p>
                      <Link href="/dashboard/scores">
                        <Button variant="primary">Add Your First Score</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {latestScores.map((score, index) => (
                        <div
                          key={score.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-gradient-to-br from-primary-500 to-secondary-500' : 'bg-gray-400'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-lg text-gray-900">{score.score} pts</div>
                              <div className="text-sm text-gray-600">{formatDate(score.played_date)}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(score.played_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Next Draw</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDraw ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">
                        {formatMonthYear(upcomingDraw.month, upcomingDraw.year)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        upcomingDraw.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {upcomingDraw.status}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Your Numbers</span>
                        <span className="font-medium">
                          {userNumbers.length === 5 ? userNumbers.join(', ') : `${5 - scores.length} more scores needed`}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-gray-600">No upcoming draw scheduled.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
            <Card className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white overflow-hidden relative">
              <CardContent className="relative p-6">
                <h3 className="text-xl font-bold mb-2">Your Charity Impact</h3>
                <div className="space-y-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between">
                    <span className="text-white/80">Monthly</span>
                    <span className="font-bold">{formatCurrency(monthlyContribution)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Yearly</span>
                    <span className="font-bold">{formatCurrency(monthlyContribution * 12)}</span>
                  </div>
                </div>
                <Link href="/dashboard/charity">
                  <Button className="w-full mt-4 bg-white text-primary-600 hover:bg-gray-100">
                    Change Charity
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/scores"><Button variant="outline" className="w-full justify-start">⛳ Enter Score</Button></Link>
                <Link href="/dashboard/winnings"><Button variant="outline" className="w-full justify-start">🏆 View Winnings</Button></Link>
                <Link href="/draw-results"><Button variant="outline" className="w-full justify-start">📊 Draw Results</Button></Link>
                <Link href="/charities"><Button variant="outline" className="w-full justify-start">❤️ Browse Charities</Button></Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
