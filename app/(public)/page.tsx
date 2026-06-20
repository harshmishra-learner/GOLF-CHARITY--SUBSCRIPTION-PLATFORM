'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header, Footer } from '@/app/components/layout'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'
import type { Charity } from '@/app/lib/supabase'

const features = [
  {
    icon: '🎯',
    title: 'Track Your Scores',
    description: 'Enter your latest Stableford scores and keep track of your performance over time.',
  },
  {
    icon: '🎉',
    title: 'Win Monthly Prizes',
    description: 'Your scores become your lottery numbers. Match 3, 4, or all 5 to win cash prizes!',
  },
  {
    icon: '❤️',
    title: 'Support Charities',
    description: 'Choose your favorite charity. A portion of your subscription goes directly to their cause.',
  },
]

export default function HomePage() {
  const [featuredCharities, setFeaturedCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCharities() {
      const supabase = createClient()
      const { data } = await supabase
        .from('charities')
        .select('*')
        .eq('is_featured', true)
        .limit(3)
      if (data) setFeaturedCharities(data)
      setLoading(false)
    }
    fetchCharities()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-secondary-500/10" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Golf for{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Good
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Turn your golf scores into chances to win. Every subscription supports
              amazing charities while you compete in monthly prize draws.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="xl" className="w-full sm:w-auto text-lg px-10 py-6 animate-pulse-glow">
                  Start Playing →
                </Button>
              </Link>
              <Link href="/charities">
                <Button variant="outline" size="xl" className="w-full sm:w-auto text-lg px-10 py-6">
                  See Our Charities
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to start winning and giving</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 text-4xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      <section className="py-24 bg-gradient-to-b from-purple-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Charities</h2>
            <p className="text-xl text-gray-600">Your subscription makes a real impact</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="animate-pulse">
                  <CardContent className="p-8">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCharities.map((charity, index) => (
                <motion.div
                  key={charity.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full overflow-hidden group cursor-pointer">
                    <div className="h-48 bg-gradient-to-br from-primary-400 to-secondary-400 relative overflow-hidden">
                      {charity.image_url ? (
                        <img
                          src={charity.image_url}
                          alt={charity.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          ❤️
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{charity.name}</h3>
                      <p className="text-gray-600 line-clamp-3">{charity.description}</p>
                      <Link href={`/charities?selected=${charity.id}`}>
                        <Button variant="outline" className="w-full mt-4">
                          Support This Charity
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Prize Pool Explanation */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">Example Prize Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>5-Number Match (Jackpot)</span>
                    <span className="font-bold">$4,000</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-accent-400 h-3 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>4-Number Match</span>
                    <span className="font-bold">$3,500</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-secondary-400 h-3 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>3-Number Match</span>
                    <span className="font-bold">$2,500</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-primary-400 h-3 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
              <p className="mt-6 text-sm text-white/80">
                *Based on 500 subscribers at $29.99/month. Actual prizes vary monthly.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of golfers supporting charities while competing for
            life-changing prizes. Subscribe today and be part of something bigger.
          </p>
          <Link href="/signup">
            <Button
              size="xl"
              variant="secondary"
              className="text-2xl px-12 py-8 bg-white text-primary-600 hover:bg-gray-100 shadow-2xl"
            >
              Get Started Now
            </Button>
          </Link>
          <p className="mt-6 text-white/80 text-sm">
            30-day money-back guarantee. Cancel anytime.
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
