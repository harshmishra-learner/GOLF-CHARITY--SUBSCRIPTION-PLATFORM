'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { formatCurrency, formatDate } from '@/app/lib/utils'

export default function AdminWinnersPage() {
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => { fetchVerifications() }, [])

  async function fetchVerifications() {
    const supabase = createClient()
    const { data } = await supabase.from('winner_verifications').select(`
      *,
      draw_participants (
        *,
        draws (month, year)
      )
    `).order('created_at', { ascending: false })

    if (data) setVerifications(data)
    setLoading(false)
  }

  async function handleReview(id: string, status: 'approved' | 'rejected') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('winner_verifications').update({
      status,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)

    if (error) alert('Error: ' + error.message)
    else fetchVerifications()
  }

  async function markPayoutPaid(participantId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('draw_participants').update({ payout_status: 'paid' }).eq('id', participantId)
    if (error) alert('Error: ' + error.message)
    else fetchVerifications()
  }

  const filtered = verifications.filter(v => filter === 'all' || v.status === filter)
  const pendingCount = verifications.filter(v => v.status === 'pending').length

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Winner Verifications</h1>
            <p className="text-xl text-gray-600">Review and approve winner submissions</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                <Button key={f} variant={filter === f ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter(f)} className="capitalize">{f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}</Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Card>
          <CardHeader><CardTitle>Verifications ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-12">Loading...</div> : filtered.length === 0 ? (
              <div className="text-center py-12"><div className="text-5xl mb-4">✅</div><h3 className="text-xl font-semibold text-gray-900 mb-2">No {filter === 'all' ? '' : filter} verifications</h3></div>
            ) : (
              <div className="space-y-6">
                {filtered.map((item, index) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{item.draw_participants.user_numbers.sort((a: number, b: number) => a - b).join(', ')}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Draw:</span> {formatMonthYear(item.draw_participants.draws.month, item.draw_participants.draws.year)}</p>
                          <p><span className="font-medium">Match Type:</span> {item.draw_participants.match_type}</p>
                          <p><span className="font-medium">Prize:</span> {formatCurrency(item.draw_participants.prize_amount || 0)}</p>
                        </div>
                      </div>
                      <div className="ml-4">
                        {item.proof_url && <a href={item.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200">View Proof</a>}
                      </div>
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex items-center space-x-3 pt-4 border-t">
                        <Button variant="primary" size="sm" onClick={() => handleReview(item.id, 'approved')} className="bg-green-600 hover:bg-green-700">✓ Approve</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleReview(item.id, 'rejected')}>✗ Reject</Button>
                        <Button variant="primary" size="sm" onClick={() => markPayoutPaid(item.draw_participant_id)} className="ml-auto">Mark as Paid</Button>
                      </div>
                    )}

                    {item.admin_notes && <div className="mt-4 p-3 bg-gray-50 rounded-lg"><div className="text-sm text-gray-600"><span className="font-medium">Admin Notes:</span> {item.admin_notes}</div></div>}
                    <div className="mt-2 text-xs text-gray-500">Submitted {formatDate(item.created_at)}</div>
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
