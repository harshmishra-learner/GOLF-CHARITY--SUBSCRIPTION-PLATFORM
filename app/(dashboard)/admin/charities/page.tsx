'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/app/components/ui/Button'
import { Input, Textarea } from '@/app/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { createClient } from '@/app/lib/supabase/client'

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCharity, setEditingCharity] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', description: '', image_url: '', website: '', contact_email: '', is_featured: false })

  useEffect(() => { fetchCharities() }, [])

  async function fetchCharities() {
    const supabase = createClient()
    const { data } = await supabase.from('charities').select('*').order('is_featured', { ascending: false }).order('name')
    setCharities(data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const supabase = createClient()
      if (editingCharity) {
        const { error } = await supabase.from('charities').update(formData).eq('id', editingCharity.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('charities').insert(formData)
        if (error) throw error
      }
      setShowForm(false)
      setEditingCharity(null)
      setFormData({ name: '', description: '', image_url: '', website: '', contact_email: '', is_featured: false })
      fetchCharities()
    } catch (error: any) {
      alert('Error saving charity: ' + error.message)
    }
  }

  async function deleteCharity(id: string) {
    if (!confirm('Are you sure you want to delete this charity?')) return
    const supabase = createClient()
    const { error } = await supabase.from('charities').delete().eq('id', id)
    if (error) alert('Error: ' + error.message)
    else fetchCharities()
  }

  function startEdit(charity: any) {
    setEditingCharity(charity)
    setFormData({ name: charity.name, description: charity.description || '', image_url: charity.image_url || '', website: charity.website || '', contact_email: charity.contact_email || '', is_featured: charity.is_featured })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Charity Management</h1>
            <p className="text-xl text-gray-600">Add, edit, or remove charity partners</p>
          </div>
          <Button variant="primary" onClick={() => { setShowForm(!showForm); setEditingCharity(null); setFormData({ name: '', description: '', image_url: '', website: '', contact_email: '', is_featured: false }); }}>{showForm ? 'Cancel' : '+ Add Charity'}</Button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-primary-200">
            <CardHeader><CardTitle>{editingCharity ? `Edit "${editingCharity.name}"` : 'Add New Charity'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Charity Name *</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Enter charity name" /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Description</label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Describe the charity's mission..." /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label><Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Website</label><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://..." /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label><Input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} placeholder="contact@charity.org" /></div>
                  <div className="flex items-center"><input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4" /><label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">Featured charity (shows on homepage)</label></div>
                </div>
                <div className="flex gap-3 pt-4"><Button type="submit" variant="primary">{editingCharity ? 'Update Charity' : 'Add Charity'}</Button><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <Card>
          <CardHeader><CardTitle>All Charities ({charities.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-12">Loading...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {charities.map((charity, index) => (
                  <motion.div key={charity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-2xl">{charity.image_url ? <img src={charity.image_url} alt="" className="w-full h-full object-cover rounded-full" /> : '💝'}</div>
                            <div><h3 className="font-semibold text-gray-900">{charity.name}</h3>{charity.is_featured && <span className="bg-accent-100 text-accent-700 text-xs px-2 py-1 rounded-full">Featured</span>}</div>
                          </div>
                          <div className="flex space-x-2"><Button variant="ghost" size="sm" onClick={() => startEdit(charity)}>Edit</Button><Button variant="ghost" size="sm" onClick={() => deleteCharity(charity.id)} className="text-red-600">Delete</Button></div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{charity.description || 'No description provided.'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {charity.website && <a href={charity.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Website</a>}
                          {charity.contact_email && <span>{charity.contact_email}</span>}
                        </div>
                      </CardContent>
                    </Card>
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
