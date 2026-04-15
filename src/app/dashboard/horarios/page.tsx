'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Plus, Trash2 } from 'lucide-react'
import { getDayName } from '@/lib/utils'
import type { Barber, Availability } from '@/lib/types'

export default function HorariosPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [selectedBarber, setSelectedBarber] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    const { data: b } = await supabase.from('barbers').select('*').eq('shop_id', shop.id).eq('active', true).order('name')
    setBarbers(b || [])
    if (b && b.length > 0 && !selectedBarber) {
      setSelectedBarber(b[0].id)
    }
  }, [selectedBarber])

  useEffect(() => { load() }, [load])

  const loadAvailability = useCallback(async () => {
    if (!selectedBarber) return
    const supabase = createClient()
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('barber_id', selectedBarber)
      .order('day_of_week')
    setAvailability(data || [])
  }, [selectedBarber])

  useEffect(() => { loadAvailability() }, [loadAvailability])

  const addSlot = async (dayOfWeek: number) => {
    const supabase = createClient()
    await supabase.from('availability').insert({
      barber_id: selectedBarber,
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '19:00',
    })
    loadAvailability()
  }

  const updateSlot = async (id: string, field: 'start_time' | 'end_time', value: string) => {
    const supabase = createClient()
    await supabase.from('availability').update({ [field]: value }).eq('id', id)
    setAvailability(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  const deleteSlot = async (id: string) => {
    const supabase = createClient()
    await supabase.from('availability').delete().eq('id', id)
    loadAvailability()
  }

  const days = [1, 2, 3, 4, 5, 6, 0] // Mon-Sun

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Horarios de disponibilidad</h1>

      {/* Barber selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Seleccionar barbero</label>
        <select
          value={selectedBarber}
          onChange={e => setSelectedBarber(e.target.value)}
          className="w-full max-w-xs"
        >
          {barbers.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Schedule grid */}
      <div className="space-y-3">
        {days.map(day => {
          const daySlots = availability.filter(a => a.day_of_week === day)
          return (
            <div key={day} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{getDayName(day)}</h3>
                <button
                  onClick={() => addSlot(day)}
                  className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar turno
                </button>
              </div>
              {daySlots.length === 0 ? (
                <p className="text-sm text-muted">Día libre — no hay turnos</p>
              ) : (
                <div className="space-y-2">
                  {daySlots.map(slot => (
                    <div key={slot.id} className="flex items-center gap-3">
                      <input
                        type="time"
                        value={slot.start_time.slice(0, 5)}
                        onChange={e => updateSlot(slot.id, 'start_time', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted">—</span>
                      <input
                        type="time"
                        value={slot.end_time.slice(0, 5)}
                        onChange={e => updateSlot(slot.id, 'end_time', e.target.value)}
                        className="w-32"
                      />
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="p-1.5 rounded hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-danger" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {barbers.length === 0 && (
        <div className="text-center text-muted py-12">
          Primero agrega barberos para configurar sus horarios.
        </div>
      )}
    </div>
  )
}
