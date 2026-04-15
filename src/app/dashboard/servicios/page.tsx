'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { formatCOP } from '@/lib/utils'
import type { Service } from '@/lib/types'

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [shopId, setShopId] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', duration_min: '30', price_cop: '' })
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    setShopId(shop.id)
    const { data } = await supabase.from('services').select('*').eq('shop_id', shop.id).order('price_cop')
    setServices(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    const supabase = createClient()
    const payload = {
      name: form.name,
      duration_min: parseInt(form.duration_min),
      price_cop: parseInt(form.price_cop),
    }
    if (editing) {
      await supabase.from('services').update(payload).eq('id', editing)
    } else {
      await supabase.from('services').insert({ ...payload, shop_id: shopId })
    }
    setEditing(null)
    setAdding(false)
    setForm({ name: '', duration_min: '30', price_cop: '' })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return
    const supabase = createClient()
    await supabase.from('services').delete().eq('id', id)
    load()
  }

  const startEdit = (s: Service) => {
    setEditing(s.id)
    setAdding(false)
    setForm({ name: s.name, duration_min: s.duration_min.toString(), price_cop: s.price_cop.toString() })
  }

  const cancel = () => {
    setEditing(null)
    setAdding(false)
    setForm({ name: '', duration_min: '30', price_cop: '' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <button
          onClick={() => { setAdding(true); setEditing(null); setForm({ name: '', duration_min: '30', price_cop: '' }) }}
          className="bg-primary hover:bg-primary-hover text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {(adding || editing) && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-3">
          <h3 className="font-semibold">{editing ? 'Editar servicio' : 'Nuevo servicio'}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Corte de cabello"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duración (min) *</label>
              <input
                type="number"
                value={form.duration_min}
                onChange={e => setForm({ ...form, duration_min: e.target.value })}
                placeholder="30"
                min="5"
                step="5"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio (COP) *</label>
              <input
                type="number"
                value={form.price_cop}
                onChange={e => setForm({ ...form, price_cop: e.target.value })}
                placeholder="25000"
                min="0"
                step="1000"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!form.name || !form.price_cop || !form.duration_min}
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

      <div className="space-y-3">
        {services.map(service => (
          <div key={service.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{service.name}</p>
              <p className="text-sm text-muted">{service.duration_min} min</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary font-semibold">{formatCOP(service.price_cop)}</span>
              <button onClick={() => startEdit(service)} className="p-2 rounded-lg hover:bg-card-hover transition-colors">
                <Pencil className="w-4 h-4 text-muted" />
              </button>
              <button onClick={() => handleDelete(service.id)} className="p-2 rounded-lg hover:bg-danger/10 transition-colors">
                <Trash2 className="w-4 h-4 text-danger" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !adding && (
        <div className="text-center text-muted py-12">
          No hay servicios registrados. Agrega uno para empezar.
        </div>
      )}
    </div>
  )
}
