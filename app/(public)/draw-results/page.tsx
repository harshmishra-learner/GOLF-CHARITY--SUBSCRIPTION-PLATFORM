'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header, Footer } from '@/app/components/layout'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import type { Draw } from '@/app/lib/supabase'
import { formatMonthYear } from '@/app/lib/utils'

export default function DrawResultsPage() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null)

  useEffect(() => {
    async function fetchDraws() {
      const supabase = createClient()
      const { data } = await supabase
        .from('draws')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(12)
      if (data) {
        setDraws(data)
        if (data.length > 0 && !selectedDraw) {
          setSelectedDraw(data[0])
        }
      }
      setLoading(false)
    }
    fetchDraws()
  }, [])

  const latestDraw = draws[0]
  const isPublished = latestDraw?.status === 'published' || latestDraw?.status === 'paid'

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Draw Results</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the latest winning numbers and prize distributions. Your scores are automatically entered each month!
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                {[1, 2, 3].map(n => (
                  <Card key={n} className="animate-pulse h-32" />
                ))}
              </div>
              <div className="lg:col-span-2">
                <Card className="animate-pulse h-96" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Draw History List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Draws</h2>
                {draws.map((draw) => (
                  <Card
                    key={draw.id}
                    className={`cursor-pointer transition-all ${
                      selectedDraw?.id === draw.id
                        ? 'ring-2 ring-primary-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedDraw(draw)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {formatMonthYear(draw.month, draw.year)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          draw.status === 'published' || draw.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : draw.status === 'simulation'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {draw.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {draw.winning_numbers.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {draw.winning_numbers.map(num => (
                              <span
                                key={num}
                                className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full text-xs font-bold"
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No numbers drawn yet</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Draw Details */}
              <div className="lg:col-span-2">
                {selectedDraw && (
                  <motion.div
                    key={selectedDraw.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-bold">
                            {formatMonthYear(selectedDraw.month, selectedDraw.year)}
                          </h2>
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            selectedDraw.status === 'published' || selectedDraw.status === 'paid'
                              ? 'bg-white/20'
                              : 'bg-gray-600'
                          }`}>
                            {selectedDraw.status.charAt(0).toUpperCase() + selectedDraw.status.slice(1)}
                          </span>
                        </div>

                        {isPublished && (
                          <div>
                            <p className="text-white/90 mb-4">Winning Numbers</p>
                            <div className="flex gap-3 flex-wrap">
                              {selectedDraw.winning_numbers.map(num => (
                                <motion.div
                                  key={num}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 shadow-lg"
                                >
                                  {num}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        {selectedDraw.status !== 'published' && selectedDraw.status !== 'paid' ? (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">⏳</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              Draw Not Yet Published
                            </h3>
                            <p className="text-gray-600">
                              This draw is scheduled but results haven't been announced yet.
                              Check back after the draw date!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-8">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-4">Prize Pool Breakdown</h3>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span>5-Number Match (Jackpot)</span>
                                    <span className="font-bold text-accent-600">
                                      ${selectedDraw.total_pool_amount ? (selectedDraw.total_pool_amount * 0.40).toFixed(2) : '0.00'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                      className="bg-accent-500 h-3 rounded-full transition-all duration-1000"
                                      style={{ width: '40%' }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span>4-Number Match</span>
                                    <span className="font-bold text-primary-600">
                                      ${selectedDraw.total_pool_amount ? (selectedDraw.total_pool_amount * 0.35).toFixed(2) : '0.00'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                      className="bg-primary-500 h-3 rounded-full"
                                      style={{ width: '35%' }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span>3-Number Match</span>
                                    <span className="font-bold text-secondary-600">
                                      ${selectedDraw.total_pool_amount ? (selectedDraw.total_pool_amount * 0.25).toFixed(2) : '0.00'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                      className="bg-secondary-500 h-3 rounded-full"
                                      style={{ width: '25%' }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 mt-4">
                                Total Prize Pool: ${selectedDraw.total_pool_amount.toFixed(2)}
                              </p>
                            </div>

                            <div className="border-t pt-8 text-center">
                              <Link href="/dashboard">
                                <Button size="lg" className="text-lg px-8 py-4">
                                  View My Participation
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
