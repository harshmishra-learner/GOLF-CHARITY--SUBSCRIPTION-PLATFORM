'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { DrawEngine } from '@/app/lib/draw-engine'
import { formatMonthYear } from '@/app/lib/utils'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSimulator, setShowSimulator] = useState(false)
  const [simResult, setSimResult] = useState<any>(null)
  const [runningSim, setRunningSim] = useState(false)

  useEffect(() => {
    fetchDraws()
  }, [])

  async function fetchDraws() {
    const supabase = createClient()
    const { data } = await supabase.from('draws').select('*').order('year', { ascending: false }).order('month', { ascending: false })
    setDraws(data || [])
    setLoading(false)
  }

  async function runSimulation() {
    setRunningSim(true)
    setSimResult(null)

    try {
      const supabase = createClient()
      const { data: users } = await supabase.from('users').select('id').eq('subscription_status', 'active')

      if (!users || users.length === 0) {
        alert('No active subscribers to simulate')
        setRunningSim(false)
        return
      }

      const userIds = users.map(u => u.id)
      const { data: allScores } = await supabase.from('golf_scores').select('*').in('user_id', userIds)

      const participants = userIds.map(userId => ({
        user_id: userId,
        scores: allScores?.filter(s => s.user_id === userId) || [],
      }))

      const result = DrawEngine.simulateDraw(
        { drawType: 'random', winningNumbersCount: 5 },
        participants,
        
      )

      setSimResult(result)
    } catch (error) {
      console.error('Simulation error:', error)
      alert('Failed to run simulation')
    } finally {
      setRunningSim(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Draw Management</h1>
            <p className="text-xl text-gray-600">Configure and run monthly draws</p>
          </div>
          <Button variant="outline" onClick={() => setShowSimulator(!showSimulator)}>{showSimulator ? 'Hide Simulator' : 'Simulate Draw'}</Button>
        </div>
      </motion.div>

      {showSimulator && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
          <Card className="border-primary-200 bg-primary-50">
            <CardHeader><CardTitle>Draw Simulator</CardTitle></CardHeader>
            <CardContent>
              <Button variant="primary" onClick={runSimulation} isLoading={runningSim}>{runningSim ? 'Running...' : 'Run Simulation'}</Button>
              {simResult && (
                <div className="mt-6 p-6 bg-white rounded-lg border">
                  <h3 className="text-xl font-bold mb-4">Simulation Results</h3>
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-2">Winning Numbers</div>
                    <div className="flex gap-3">
                      {simResult.draw.winning_numbers.map((num: any, i: number) => (
                        <div key={i} className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">{String(num)}</div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600">3-Number Matches</div><div className="text-2xl font-bold text-primary-600">{simResult.winners['3-number'].length}</div></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600">4-Number Matches</div><div className="text-2xl font-bold text-secondary-600">{simResult.winners['4-number'].length}</div></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600">5-Number Matches</div><div className="text-2xl font-bold text-accent-600">{simResult.winners['5-number'].length}</div></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <Card>
          <CardHeader><CardTitle>Scheduled Draws ({draws.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-12">Loading...</div> : (
              <div className="space-y-4">
                {draws.map((draw, index) => (
                  <motion.div key={draw.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{formatMonthYear(draw.month, draw.year)}</div>
                      <div className="text-sm text-gray-600">{draw.draw_type} - {draw.status}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {draw.status === 'published' && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Winning Numbers</div>
                          <div className="flex gap-1">{draw.winning_numbers.map((num: any) => <span key={num} className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{num}</span>)}</div>
                        </div>
                      )}
                      <Button variant="ghost" size="sm" disabled={draw.status === 'published'}>{draw.status === 'published' ? 'Published' : 'Publish'}</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
