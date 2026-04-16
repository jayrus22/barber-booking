'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Trash2, MessageSquare, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Review, Barber } from '@/lib/types'

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    const [{ data: r }, { data: b }] = await Promise.all([
      supabase.from('reviews').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false }),
      supabase.from('barbers').select('*').eq('shop_id', shop.id),
    ])
    setReviews((r as Review[]) || [])
    setBarbers((b as Barber[]) || [])
  }, [])

  useEffect(() => { load() }, [load])

  const toggleApproved = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('reviews').update({ approved: !current }).eq('id', id)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    const supabase = createClient()
    await supabase.from('reviews').delete().eq('id', id)
    load()
  }

  const filtered = reviews.filter(r => {
    if (filter === 'approved') return r.approved
    if (filter === 'pending') return !r.approved
    return true
  })

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0'

  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
        <Star className="w-6 h-6 text-primary" /> Reseñas
      </h1>
      <p className="text-muted text-sm mb-6">
        Calificación promedio: <span className="font-bold text-primary">{avg}</span> ({reviews.length} reseñas)
      </p>

      <div className="flex gap-2 mb-4 text-sm">
        {(['all', 'approved', 'pending'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === f ? 'bg-primary text-black font-semibold' : 'bg-card border border-border'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'approved' ? 'Aprobadas' : 'Pendientes'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-muted py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          No hay reseñas.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(review => {
            const barber = barbers.find(b => b.id === review.barber_id)
            return (
              <div key={review.id} className={`bg-card border rounded-xl p-5 ${review.approved ? 'border-border' : 'border-danger/40'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{review.client_name}</h3>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-primary fill-primary' : 'text-border'}`} />
                    ))}
                  </div>
                </div>
                {barber && <p className="text-xs text-primary mb-2">Para {barber.name}</p>}
                {review.comment && <p className="text-sm text-muted mb-3">&ldquo;{review.comment}&rdquo;</p>}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">
                    {format(new Date(review.created_at), 'd MMM yyyy', { locale: es })}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleApproved(review.id, review.approved)}
                      className="p-1.5 rounded hover:bg-card-hover"
                      title={review.approved ? 'Ocultar' : 'Aprobar'}
                    >
                      {review.approved
                        ? <Eye className="w-4 h-4 text-success" />
                        : <EyeOff className="w-4 h-4 text-danger" />
                      }
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="p-1.5 rounded hover:bg-danger/10">
                      <Trash2 className="w-4 h-4 text-danger" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
