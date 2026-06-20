'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { formatCurrency, formatMonthYear } from '@/app/lib/utils'

export default function WinningsPage() {
  const [participations, setParticipations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalWon, setTotalWon] = useState(0)
  const [pendingPayouts, setPendingPayouts] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data } = await supabase
        .from('draw_participants')
        .select(`
          *,
          draws (month, year, status)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setParticipations(data)
        const won = data.filter(p => p.prize_amount && p.payout_status === 'paid').reduce((sum, p) => sum + p.prize_amount, 0)
        const pending = data.filter(p => p.prize_amount && p.payout_status === 'pending').reduce((sum, p) => sum + p.prize_amount, 0)
        setTotalWon(won)
        setPendingPayouts(pending)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl">Loading...</div></div>
  }

  const wonItems = participations.filter(p => p.won)
  const pendingItems = participations.filter(p => p.prize_amount && p.payout_status === 'pending')

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Winnings</h1>
        <p className="text-xl text-gray-600">Track your prizes and payout status</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-accent-500 to-yellow-500 text-white">
            <CardContent className="p-6">
              <div className="text-sm text-white/80 mb-1">Total Won</div>
              <div className="text-3xl font-bold">{formatCurrency(totalWon)}</div>
              <div className="text-sm text-white/80 mt-2">Lifetime earnings</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-primary-500 to-blue-500 text-white">
            <CardContent className="p-6">
              <div className="text-sm text-white/80 mb-1">Pending Payout</div>
              <div className="text-3xl font-bold">{formatCurrency(pendingPayouts)}</div>
              <div className="text-sm text-white/80 mt-2">Awaiting verification</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="text-sm text-white/80 mb-1">Draw Entries</div>
              <div className="text-3xl font-bold">{participations.length}</div>
              <div className="text-sm text-white/80 mt-2">Total participations</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {wonItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <Card className="border-accent-200 bg-accent-50">
            <CardHeader><CardTitle className="flex items-center space-x-2"><span>🏆</span><span>Congratulations! Pending Verification</span></CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">You've won! To receive your prize, please upload proof of your scores from the golf platform (screenshot showing your scorecard).</p>
              <Button variant="primary">Upload Proof</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
          <Card>
            <CardHeader><CardTitle>Win History</CardTitle></CardHeader>
            <CardContent>
              {wonItems.length === 0 ? (
                <div className="text-center py-12"><div className="text-5xl mb-4">🎯</div><h3 className="text-xl font-semibold text-gray-900 mb-2">No Wins Yet</h3><p className="text-gray-600">Keep playing! Your scores are automatically entered each month.</p></div>
              ) : (
                <div className="space-y-4">
                  {wonItems.map((participation) => (
                    <div key={participation.id} className="border-l-4 border-accent-500 pl-4 py-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">{participation.match_type} Match</div>
                          <div className="text-sm text-gray-600">{formatMonthYear(participation.draws.month, participation.draws.year)}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${participation.payout_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {participation.payout_status === 'paid' ? 'Paid' : 'Pending'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">Matched {participation.matched_count} numbers</div>
                        <div className="text-xl font-bold text-accent-600">{formatCurrency(participation.prize_amount || 0)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <Card>
            <CardHeader><CardTitle>All Draw Entries</CardTitle></CardHeader>
            <CardContent>
              {participations.length === 0 ? (
                <div className="text-center py-12"><div className="text-5xl mb-4">📝</div><h3 className="text-xl font-semibold text-gray-900 mb-2">No Entries Yet</h3><p className="text-gray-600">Enter 5 scores to participate in monthly draws.</p></div>
              ) : (
                <div className="space-y-4">
                  {participations.map((participation) => (
                    <div key={participation.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">{participation.draws.month}/{participation.draws.year}</div>
                          <div className="text-sm text-gray-600">Your numbers: {participation.user_numbers.sort((a: number, b: number) => a - b).join(', ')}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${participation.won ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {participation.won ? `Won (${participation.matched_count})` : 'No win'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
