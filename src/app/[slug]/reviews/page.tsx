import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Star, MessageSquare, Scissors } from 'lucide-react'
import type { Review, Barber } from '@/lib/types'

export default async function ReviewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: shop } = await supabase.from('shops').select('id, name').eq('slug', slug).single()
  if (!shop) return null

  const [{ data: reviews }, { data: barbers }] = await Promise.all([
    supabase.from('reviews').select('*').eq('shop_id', shop.id).eq('approved', true).order('created_at', { ascending: false }),
    supabase.from('barbers').select('id, name').eq('shop_id', shop.id),
  ])

  const barberMap = new Map((barbers as Pick<Barber, 'id' | 'name'>[] | null)?.map(b => [b.id, b.name]) || [])
  const all = (reviews as Review[] | null) || []

  const avg = all.length ? (all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1) : '5.0'
  const counts = [5, 4, 3, 2, 1].map(n => ({ n, count: all.filter(r => r.rating === n).length }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Lo que opinan nuestros clientes</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Reseñas</h1>
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-10 grid sm:grid-cols-2 gap-6 items-center">
        <div className="text-center">
          <p className="text-6xl font-extrabold text-primary mb-2">{avg}</p>
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.round(parseFloat(avg)) ? 'text-primary fill-primary' : 'text-border'}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted">{all.length} reseñas en total</p>
        </div>
        <div className="space-y-2">
          {counts.map(({ n, count }) => {
            const pct = all.length ? (count / all.length) * 100 : 0
            return (
              <div key={n} className="flex items-center gap-2 text-sm">
                <span className="w-12 flex items-center gap-1">
                  {n} <Star className="w-3 h-3 text-primary fill-primary" />
                </span>
                <div className="flex-1 h-2 bg-card-hover rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-muted">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review list */}
      {all.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {all.map(review => (
            <div key={review.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{review.client_name}</h3>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-primary fill-primary' : 'text-border'}`} />
                  ))}
                </div>
              </div>
              {review.barber_id && barberMap.get(review.barber_id) && (
                <p className="text-xs text-primary mb-2">Barbero: {barberMap.get(review.barber_id)}</p>
              )}
              {review.comment && <p className="text-sm text-muted">&ldquo;{review.comment}&rdquo;</p>}
              <p className="text-xs text-muted mt-3">
                {new Date(review.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-16">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Aún no hay reseñas. ¡Sé el primero en opinar!</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href={`/${slug}/reservar`} className="btn-primary">
          <Scissors className="w-5 h-5" /> Reservar mi cita
        </Link>
      </div>
    </div>
  )
}
