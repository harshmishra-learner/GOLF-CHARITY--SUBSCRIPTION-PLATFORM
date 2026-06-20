'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/app/components/ui/Button'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Draws', href: '/admin/draws', icon: '🎲' },
  { name: 'Charities', href: '/admin/charities', icon: '❤️' },
  { name: 'Winners', href: '/admin/winners', icon: '🏆' },
  { name: 'Reports', href: '/admin/reports', icon: '📈' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }

      setUser(user)
      setIsAdmin(true)
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-2xl">Loading...</div></div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">GolfCharity</Link>
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-full">ADMIN</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white hover:text-gray-200">Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-3">
            {adminNav.map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${pathname === item.href ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}>
                <span>{item.icon}</span><span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
