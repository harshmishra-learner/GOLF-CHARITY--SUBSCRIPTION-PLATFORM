'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { createClient } from '@/app/lib/supabase/client'
import { formatCurrency } from '@/app/lib/utils'

export default function AdminReportsPage() {
  const [reports, setReports] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalCharityContributions: 0,
    drawsConducted: 0,
    winnersPaid: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    try {
      const supabase = createClient()
      const [usersCount, subscribersCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('users').select('*', { count: 'exact' }).eq('subscription_status', 'active'),
      ])

      const { data: payments } = await supabase.from('payments').select('amount, created_at')
      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyPayments = payments?.filter(p => {
        const date = new Date(p.created_at)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      const { data: contributions } = await supabase.from('charity_contributions').select('amount')
      const { count: drawsCount } = await supabase.from('draws').select('*', { count: 'exact' })
      const { count: winnersCount } = await supabase.from('draw_participants').select('*', { count: 'exact' }).eq('payout_status', 'paid')

      setReports({
        totalUsers: usersCount.count || 0,
        activeSubscribers: subscribersCount.count || 0,
        totalRevenue,
        monthlyRevenue,
        totalCharityContributions: contributions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0,
        drawsConducted: drawsCount || 0,
        winnersPaid: winnersCount || 0,
      })
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-xl text-gray-600">Platform performance and insights</p>
          </div>
          <Button variant="outline" onClick={fetchReports}>Refresh Data</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card><CardContent className="p-6"><div className="text-sm text-gray-600 mb-1">Total Revenue</div><div className="text-3xl font-bold text-green-600">{loading ? '...' : formatCurrency(reports.totalRevenue)}</div><div className="text-sm text-green-600 mt-2">This month: {loading ? '...' : formatCurrency(reports.monthlyRevenue)}</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-sm text-gray-600 mb-1">Active Subscribers</div><div className="text-3xl font-bold text-primary-600">{loading ? '...' : reports.activeSubscribers}</div><div className="text-sm text-gray-500 mt-2">of {reports.totalUsers} total users</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-sm text-gray-600 mb-1">Charity Contributions</div><div className="text-3xl font-bold text-secondary-600">{loading ? '...' : formatCurrency(reports.totalCharityContributions)}</div><div className="text-sm text-gray-500 mt-2">Total donated</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-sm text-gray-600 mb-1">Winners Paid</div><div className="text-3xl font-bold text-accent-600">{loading ? '...' : reports.winnersPaid}</div><div className="text-sm text-gray-500 mt-2">Across {reports.drawsConducted} draws</div></CardContent></Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle>Platform Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b"><span className="text-gray-600">Total Users</span><span className="font-bold text-lg">{reports.totalUsers}</span></div>
                <div className="flex items-center justify-between py-3 border-b"><span className="text-gray-600">Active Subscriptions</span><span className="font-bold text-lg text-green-600">{reports.activeSubscribers}</span></div>
                <div className="flex items-center justify-between py-3 border-b"><span className="text-gray-600">Draws Conducted</span><span className="font-bold text-lg">{reports.drawsConducted}</span></div>
                <div className="flex items-center justify-between py-3 border-b"><span className="text-gray-600">Winners Paid Out</span><span className="font-bold text-lg text-accent-600">{reports.winnersPaid}</span></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle>Monthly Trends</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                <div className="text-center"><div className="text-5xl mb-2">📈</div><p>Charts would be displayed here</p></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
