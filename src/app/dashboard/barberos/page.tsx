'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import type { Barber } from '@/lib/types'

export default function BarberosPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [shopId, setShopId] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', specialty: '', bio: '', photo_url: '' })
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    setShopId(shop.id)
    const { data } = await supabase.from('barbers').select('*').eq('shop_id', shop.id).order('name')
    setBarbers(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    const supabase = createClient()
    if (editing) {
      await supabase.from('barbers').update({
        name: form.name,
        specialty: form.specialty || null,
        bio: form.bio || null,
        photo_url: form.photo_url || null,
      }).eq('id', editing)
    } else {
      await supabase.from('barbers').insert({
        shop_id: shopId,
        name: form.name,
        specialty: form.specialty || null,
        bio: form.bio || null,
        photo_url: form.photo_url || null,
      })
    }
    setEditing(null)
    setAdding(false)
    setForm({ name: '', specialty: '', bio: '', photo_url: '' })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este barbero? Se borrarán sus citas y horarios.')) return
    const supabase = createClient()
    await supabase.from('barbers').delete().eq('id', id)
    load()
  }

  const startEdit = (barber: Barber) => {
    setEditing(barber.id)
    setAdding(false)
    setForm({
      name: barber.name,
      specialty: barber.specialty || '',
      bio: barber.bio || '',
      photo_url: barber.photo_url || '',
    })
  }

  const cancel = () => {
    setEditing(null)
    setAdding(false)
    setForm({ name: '', specialty: '', bio: '', photo_url: '' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Barberos</h1>
        <button
          onClick={() => { setAdding(true); setEditing(null); setForm({ name: '', specialty: '', bio: '', photo_url: '' }) }}
          className="bg-primary hover:bg-primary-hover text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {/* Add/Edit form */}
      {(adding || editing) && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-3">
          <h3 className="font-semibold">{editing ? 'Editar barbero' : 'Nuevo barbero'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre completo"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Especialidad</label>
              <input
                value={form.specialty}
                onChange={e => setForm({ ...form, specialty: e.target.value })}
                placeholder="Ej: Fade y diseños"
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Descripción breve..."
              rows={2}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL de foto</label>
            <input
              value={form.photo_url}
              onChange={e => setForm({ ...form, photo_url: e.target.value })}
              placeholder="https://..."
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!form.name}
              className="bg-primary hover:bg-primary-hover text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Guardar
            </button>
            <button onClick={cancel} className="px-4 py-2 rounded-lg border border-border hover:bg-card text-sm flex items-center gap-2">
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {barbers.map(barber => (
          <div key={barber.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
              {barber.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{barber.name}</p>
              {barber.specialty && <p className="text-sm text-primary">{barber.specialty}</p>}
              {barber.bio && <p className="text-sm text-muted truncate">{barber.bio}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(barber)} className="p-2 rounded-lg hover:bg-card-hover transition-colors">
                <Pencil className="w-4 h-4 text-muted" />
              </button>
              <button onClick={() => handleDelete(barber.id)} className="p-2 rounded-lg hover:bg-danger/10 transition-colors">
                <Trash2 className="w-4 h-4 text-danger" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {barbers.length === 0 && !adding && (
        <div className="text-center text-muted py-12">
          No hay barberos registrados. Agrega uno para empezar.
        </div>
      )}
    </div>
  )
}
