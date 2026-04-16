'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Ban, CalendarX } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Barber, BlockedDate } from '@/lib/types'

export default function BloqueosPage() {
  const [shopId, setShopId] = useState('')
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [blocks, setBlocks] = useState<BlockedDate[]>([])
  const [date, setDate] = useState('')
  const [barberId, setBarberId] = useState('')
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    setShopId(shop.id)
    const [{ data: b }, { data: bl }] = await Promise.all([
      supabase.from('barbers').select('*').eq('shop_id', shop.id).order('name'),
      supabase.from('blocked_dates').select('*').eq('shop_id', shop.id).order('date'),
    ])
    setBarbers(b || [])
    setBlocks((bl as BlockedDate[]) || [])
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!date) return
    const supabase = createClient()
    await supabase.from('blocked_dates').insert({
      shop_id: shopId,
      barber_id: barberId || null,
      date,
      reason: reason || null,
    })
    setDate(''); setBarberId(''); setReason('')
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este bloqueo?')) return
    const supabase = createClient()
    await supabase.from('blocked_dates').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
        <Ban className="w-6 h-6 text-primary" /> Bloqueos / Vacaciones
      </h1>
      <p className="text-muted text-sm mb-6">
        Bloquea fechas en las que no quieres recibir reservas (vacaciones, festivos, eventos).
      </p>

      <div className="bg-card border border-border rounded-xl p-5 mb-6 grid sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Barbero (opcional)</label>
          <select value={barberId} onChange={e => setBarberId(e.target.value)} className="w-full">
            <option value="">Toda la barbería</option>
            {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 flex gap-2 items-end">
          <input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Razón (opcional)"
            className="flex-1"
          />
          <button onClick={handleAdd} disabled={!date} className="btn-primary disabled:opacity-50">
            <Plus className="w-4 h-4" /> Bloquear
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center text-muted py-12">
          <CalendarX className="w-12 h-12 mx-auto mb-4 opacity-30" />
          No hay fechas bloqueadas.
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map(b => {
            const barber = barbers.find(x => x.id === b.barber_id)
            return (
              <div key={b.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                <CalendarX className="w-5 h-5 text-danger shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">
                    {format(new Date(b.date + 'T12:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })}
                  </p>
                  <p className="text-sm text-muted">
                    {barber ? `Barbero: ${barber.name}` : 'Toda la barbería'}
                    {b.reason && ` — ${b.reason}`}
                  </p>
                </div>
                <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-danger/10">
                  <Trash2 className="w-4 h-4 text-danger" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
