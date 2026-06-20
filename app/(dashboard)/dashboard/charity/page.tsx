'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import { formatCurrency } from '@/app/lib/utils'

export default function CharityPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [charities, setCharities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [percentage, setPercentage] = useState(10)
  const [selectedCharityId, setSelectedCharityId] = useState<string>('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single()
      setProfile(userData)
      setPercentage(userData.charity_percentage || 10)
      setSelectedCharityId(userData.selected_charity_id || '')

      const { data: charitiesData } = await supabase.from('charities').select('*').order('is_featured', { ascending: false })
      setCharities(charitiesData || [])

      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleSave() {
    setUpdating(true)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('users').update({
        charity_percentage: percentage,
        selected_charity_id: selectedCharityId || null,
      }).eq('id', user.id)

      if (error) throw error
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      alert('Failed to update: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-2xl">Loading...</div></div>
  }

  const monthlyBase = profile?.subscription_tier === 'yearly' ? 299.99 / 12 : 29.99
  const monthlyContribution = monthlyBase * (percentage / 100)
  const yearlyContribution = monthlyContribution * 12

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Charity</h1>
        <p className="text-xl text-gray-600">Choose where a portion of your subscription goes</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <Card>
              <CardHeader><CardTitle>Select a Charity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${!selectedCharityId ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedCharityId('')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">No Specific Charity</div>
                        <div className="text-sm text-gray-600">Contribute to our general charity fund</div>
                      </div>
                      {!selectedCharityId && <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    </div>
                  </div>
                  {charities.map((charity) => (
                    <div key={charity.id} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedCharityId === charity.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setSelectedCharityId(charity.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-gray-900">{charity.name}</div>
                            {charity.is_featured && <span className="bg-accent-100 text-accent-700 text-xs font-medium px-2 py-1 rounded-full">Featured</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{charity.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card>
              <CardHeader><CardTitle>Contribution Percentage</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your contribution: {percentage}%</label>
                    <input type="range" min="10" max="100" step="5" value={percentage} onChange={(e) => setPercentage(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                    <div className="flex justify-between text-xs text-gray-500 mt-2"><span>10%</span><span>100%</span></div>
                  </div>
                  <p className="text-sm text-gray-600">Choose what percentage of your subscription goes to your selected charity. The default is 10%. You can increase it to support even more!</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex gap-4">
            <Button variant="primary" onClick={handleSave} isLoading={updating} className="flex-1">Save Changes</Button>
          </div>

          {success && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">Your charity preferences have been saved successfully!</motion.div>}
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-secondary-600 to-primary-600 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Your Current Charity</h3>
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <div className="text-white/80 mb-1">Selected Charity</div>
                  <div className="text-lg font-semibold">{selectedCharityId ? charities.find(c => c.id === selectedCharityId)?.name || 'Unknown' : 'General Fund'}</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-white/80">Monthly Impact</span><span className="font-bold">{formatCurrency(monthlyContribution)}</span></div>
                  <div className="flex justify-between"><span className="text-white/80">Yearly Impact</span><span className="font-bold">{formatCurrency(yearlyContribution)}</span></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Card>
              <CardHeader><CardTitle>Why It Matters</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-3"><span className="text-2xl">🎯</span><p>Your contribution directly supports causes you care about</p></div>
                  <div className="flex items-start space-x-3"><span className="text-2xl">📈</span><p>Track your impact over time in your dashboard</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
