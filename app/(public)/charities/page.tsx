'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header, Footer } from '@/app/components/layout'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import type { Charity } from '@/app/lib/supabase'
import { useSearchParams } from 'next/navigation'

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('selected')

  useEffect(() => {
    async function fetchCharities() {
      const supabase = createClient()
      const { data } = await supabase
        .from('charities')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('name')
      if (data) setCharities(data)
      setLoading(false)
    }
    fetchCharities()
  }, [])

  const filteredCharities = charities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Charity Partners</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every month, a portion of your subscription goes directly to the charity
              you choose. Select from our verified partners and see the impact you're making.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-12">
            <input
              type="text"
              placeholder="Search charities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-lg"
            />
          </div>

          {/* Charity Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Card key={n} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCharities.map((charity, index) => (
                <motion.div
                  key={charity.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full overflow-hidden cursor-pointer group">
                    <div className="h-48 bg-gradient-to-br from-primary-400 to-secondary-400 relative overflow-hidden">
                      {charity.image_url ? (
                        <img
                          src={charity.image_url}
                          alt={charity.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          💝
                        </div>
                      )}
                      {charity.is_featured && (
                        <div className="absolute top-4 right-4 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{charity.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{charity.description}</p>
                      {charity.website && (
                        <a
                          href={charity.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Visit Website →
                        </a>
                      )}
                      <Link href={`/signup?charity=${charity.id}`}>
                        <Button variant="primary" className="w-full mt-4">
                          Support This Charity
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredCharities.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No charities found matching your search.</p>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
