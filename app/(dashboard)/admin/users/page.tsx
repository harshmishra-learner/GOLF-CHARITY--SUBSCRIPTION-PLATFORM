'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { createClient } from '@/app/lib/supabase/client'
import { formatCurrency, formatDate } from '@/app/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const supabase = createClient()
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-xl text-gray-600">View and manage platform users</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <Card>
          <CardContent className="p-4">
            <Input placeholder="Search users by email or name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-md" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Card>
          <CardHeader><CardTitle>All Users ({filteredUsers.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-12">Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-gray-600">User</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Subscription</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Charity %</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Joined</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <motion.tr key={user.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-semibold text-gray-900">{user.full_name || 'N/A'}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="capitalize">{user.subscription_tier || 'None'}</div>
                          <div className="text-sm text-gray-500">{user.subscription_status || 'inactive'}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.subscription_status === 'active' ? 'bg-green-100 text-green-700' : user.subscription_status === 'past_due' ? 'bg-yellow-100 text-yellow-700' : user.subscription_status === 'canceled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {user.subscription_status || 'inactive'}
                          </span>
                        </td>
                        <td className="p-4">{user.charity_percentage}%</td>
                        <td className="p-4 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
