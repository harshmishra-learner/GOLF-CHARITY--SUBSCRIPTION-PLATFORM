'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { formatCurrency } from '@/app/lib/utils'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubscribers: 0,
    totalRevenue: 0,
    totalCharities: 0,
    totalScores: 0,
    pendingVerifications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        const [usersCount, subscribersCount] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact' }),
          supabase.from('users').select('*', { count: 'exact' }).eq('subscription_status', 'active'),
        ])

        const { data: payments } = await supabase.from('payments').select('amount')
        const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

        const { count: charityCount } = await supabase.from('charities').select('*', { count: 'exact' })
        const { count: scoreCount } = await supabase.from('golf_scores').select('*', { count: 'exact' })
        const { count: verificationCount } = await supabase.from('winner_verifications').select('*', { count: 'exact' }).eq('status', 'pending')

        setStats({
          totalUsers: usersCount.count || 0,
          totalSubscribers: subscribersCount.count || 0,
          totalRevenue,
          totalCharities: charityCount || 0,
          totalScores: scoreCount || 0,
          pendingVerifications: verificationCount || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Active Subscribers', value: stats.totalSubscribers, icon: '✅', color: 'from-green-500 to-green-600' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: '💰', color: 'from-accent-500 to-yellow-600' },
    { label: 'Charities', value: stats.totalCharities, icon: '❤️', color: 'from-pink-500 to-rose-600' },
    { label: 'Total Scores', value: stats.totalScores, icon: '⛳', color: 'from-primary-500 to-primary-600' },
    { label: 'Pending Verifications', value: stats.pendingVerifications, icon: '⏳', color: stats.pendingVerifications > 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600' },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-xl text-gray-600">Platform overview and management</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Card key={card.label} className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${card.color}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">{card.label}</div>
                  <div className="text-3xl font-bold text-gray-900">{loading ? '...' : card.value}</div>
                </div>
                <div className="text-4xl opacity-80">{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/draws"><Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center"><span className="text-3xl mb-2">🎲</span><span>Run Draw</span></Button></Link>
              <Link href="/admin/winners"><Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center"><span className="text-3xl mb-2">✅</span><span>Verify Winners</span>{stats.pendingVerifications > 0 && <span className="mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{stats.pendingVerifications}</span>}</Button></Link>
              <Link href="/admin/charities"><Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center"><span className="text-3xl mb-2">❤️</span><span>Manage Charities</span></Button></Link>
              <Link href="/admin/reports"><Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center"><span className="text-3xl mb-2">📈</span><span>View Reports</span></Button></Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
