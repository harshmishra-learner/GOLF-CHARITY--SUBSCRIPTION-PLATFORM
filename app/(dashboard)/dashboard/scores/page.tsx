'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { formatDate } from '@/app/lib/utils'

export default function ScoresPage() {
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ score: '', played_date: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchScores()
  }, [])

  async function fetchScores() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    const { data } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_date', { ascending: false })

    setScores(data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)

    if (!formData.score || !formData.played_date) {
      setError('Please fill in all fields')
      setSubmitting(false)
      return
    }

    const score = parseInt(formData.score)
    const playedDate = new Date(formData.played_date)

    if (isNaN(score) || score < 1 || score > 45) {
      setError('Score must be between 1 and 45')
      setSubmitting(false)
      return
    }

    if (playedDate > new Date()) {
      setError('Date cannot be in the future')
      setSubmitting(false)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('golf_scores')
        .insert({
          user_id: user.id,
          score,
          played_date: playedDate.toISOString().split('T')[0],
        })

      if (error) throw error

      setFormData({ score: '', played_date: '' })
      setShowForm(false)
      setSuccess(true)
      await fetchScores()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteScore(id: string) {
    if (!confirm('Are you sure? This will delete the score.')) return

    const supabase = createClient()
    await supabase.from('golf_scores').delete().eq('id', id)
    await fetchScores()
  }

  // Rest of the component remains the same...
  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Scores</h1>
        <p className="text-xl text-gray-600">Enter your latest Stableford scores. Only your newest 5 scores will be kept.</p>
      </motion.div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How the scoring works</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Enter your latest Stableford points (1-45)</li>
            <li>• Only your 5 most recent scores are retained</li>
            <li>• These scores become your lottery numbers for monthly draws</li>
            <li>• Higher scores are better for matching!</li>
          </ul>
        </CardContent>
      </Card>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Button onClick={() => setShowForm(!showForm)} variant="primary" size="lg">
          {showForm ? 'Cancel' : '+ Add New Score'}
        </Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          <Card>
            <CardHeader><CardTitle>Enter Score</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
                {success && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">Score saved successfully!</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stableford Score (1-45)</label>
                    <Input type="number" value={formData.score} onChange={(e) => setFormData({ ...formData, score: e.target.value })} required min="1" max="45" placeholder="e.g., 36" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Played</label>
                    <Input type="date" value={formData.played_date} onChange={(e) => setFormData({ ...formData, played_date: e.target.value })} required max={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <Button type="submit" variant="primary" isLoading={submitting}>Save Score</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {scores.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">⛳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Scores Yet</h3>
            <p className="text-gray-600">Your scores will appear here after you add them.</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle>Your Scores ({scores.length})<span className="text-sm font-normal text-gray-500 ml-2">(showing newest first)</span></CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestScores.map((score, index) => (
                  <motion.div key={score.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-gradient-to-br from-primary-500 to-secondary-500' : 'bg-gray-400'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-gray-900">{score.score} pts</div>
                        <div className="text-sm text-gray-600">{formatDate(score.played_date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{new Date(score.played_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <Button variant="ghost" size="sm" onClick={() => deleteScore(score.id)} className="text-red-600 hover:text-red-700">Delete</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
        <Card className="bg-gradient-to-br from-accent-50 to-yellow-50 border-accent-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">🎲</div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Your Numbers for the Next Draw</h3>
                <p className="text-gray-600 text-sm mb-3">Once you have at least 5 scores, they'll be automatically entered into the monthly draw.</p>
                {latestScores.length < 5 ? (
                  <div className="flex items-center space-x-2"><span className="text-sm text-gray-500">Add {5 - latestScores.length} more score(s) to complete your entry</span></div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {userNumbers.map((num: number) => (
                      <span key={num} className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">{num}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
