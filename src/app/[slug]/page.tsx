import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Scissors, MapPin, Phone, Clock, ArrowLeft, Star } from 'lucide-react'
import { formatCOP, getDayName } from '@/lib/utils'
import type { Barber, Service, Availability } from '@/lib/types'

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!shop) notFound()

  const [{ data: barbers }, { data: services }, { data: availability }] = await Promise.all([
    supabase.from('barbers').select('*').eq('shop_id', shop.id).eq('active', true).order('name'),
    supabase.from('services').select('*').eq('shop_id', shop.id).eq('active', true).order('price_cop'),
    supabase.from('availability').select('*').in(
      'barber_id',
      (await supabase.from('barbers').select('id').eq('shop_id', shop.id)).data?.map(b => b.id) || []
    ).order('day_of_week'),
  ])

  // Group availability by barber
  const availabilityMap = new Map<string, Availability[]>()
  ;(availability as Availability[] | null)?.forEach(a => {
    const existing = availabilityMap.get(a.barber_id) || []
    existing.push(a)
    availabilityMap.set(a.barber_id, existing)
  })

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Todas las barberías
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
              <Scissors className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted mt-1">
                {shop.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {shop.address}
                  </span>
                )}
                {shop.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {shop.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Servicios */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" /> Servicios
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(services as Service[] | null)?.map(service => (
              <div key={service.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {service.duration_min} min
                  </p>
                </div>
                <span className="text-primary font-semibold whitespace-nowrap">
                  {formatCOP(service.price_cop)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Barberos */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" /> Nuestros barberos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(barbers as Barber[] | null)?.map(barber => {
              const schedule = availabilityMap.get(barber.id) || []
              return (
                <div key={barber.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {barber.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{barber.name}</h3>
                      {barber.specialty && (
                        <p className="text-xs text-primary">{barber.specialty}</p>
                      )}
                    </div>
                  </div>
                  {barber.bio && (
                    <p className="text-sm text-muted mb-3">{barber.bio}</p>
                  )}
                  {schedule.length > 0 && (
                    <div className="text-xs text-muted space-y-0.5">
                      <p className="font-medium text-foreground text-xs mb-1">Horario:</p>
                      {schedule.map(s => (
                        <p key={s.id}>
                          {getDayName(s.day_of_week)}: {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-6">
          <Link
            href={`/${slug}/reservar`}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-black font-semibold px-8 py-3 rounded-lg transition-colors text-lg"
          >
            <Scissors className="w-5 h-5" /> Reservar cita
          </Link>
        </div>
      </main>
    </div>
  )
}
