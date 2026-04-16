import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Award, ArrowRight, Scissors } from 'lucide-react'
import { Instagram } from '@/components/SocialIcons'
import { instagramUrl, getDayShort } from '@/lib/utils'
import type { Barber, Availability } from '@/lib/types'

export default async function BarberosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: shop } = await supabase.from('shops').select('id, name').eq('slug', slug).single()
  if (!shop) return null

  const { data: barbers } = await supabase
    .from('barbers')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('active', true)
    .order('rating_avg', { ascending: false })

  const ids = (barbers as Barber[] | null)?.map(b => b.id) || []
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .in('barber_id', ids)
    .order('day_of_week')

  const availMap = new Map<string, Availability[]>()
  ;(availability as Availability[] | null)?.forEach(a => {
    const list = availMap.get(a.barber_id) || []
    list.push(a)
    availMap.set(a.barber_id, list)
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">El equipo</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Conoce a nuestros barberos</h1>
        <p className="text-muted max-w-xl mx-auto">
          Profesionales con años de experiencia listos para atenderte.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(barbers as Barber[] | null)?.map(barber => {
          const ig = instagramUrl(barber.instagram)
          const days = (availMap.get(barber.id) || []).map(a => a.day_of_week)
          return (
            <div key={barber.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              {barber.photo_url ? (
                <div className="relative h-72 w-full overflow-hidden">
                  <Image src={barber.photo_url} alt={barber.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-72 w-full bg-primary/10 flex items-center justify-center">
                  <span className="text-7xl font-bold text-primary">{barber.name.charAt(0)}</span>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="font-bold text-lg">{barber.name}</h2>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-xs">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="font-semibold">{barber.rating_avg || '5.0'}</span>
                    <span className="text-muted">({barber.rating_count || 0})</span>
                  </div>
                </div>
                {barber.specialty && (
                  <p className="text-primary text-sm font-medium mb-2">{barber.specialty}</p>
                )}
                {barber.bio && <p className="text-sm text-muted mb-4 flex-1">{barber.bio}</p>}

                {barber.years_experience ? (
                  <p className="text-xs text-muted flex items-center gap-1.5 mb-2">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    {barber.years_experience} años de experiencia
                  </p>
                ) : null}

                {days.length > 0 && (
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5,6,0].map(d => {
                      const active = days.includes(d)
                      return (
                        <span
                          key={d}
                          className={`text-[10px] uppercase px-1.5 py-1 rounded font-semibold ${
                            active ? 'bg-primary/15 text-primary' : 'bg-card-hover text-muted/60 line-through'
                          }`}
                        >
                          {getDayShort(d)}
                        </span>
                      )
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  {ig ? (
                    <a href={ig} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors flex items-center gap-1 text-sm">
                      <Instagram className="w-4 h-4" /> {barber.instagram}
                    </a>
                  ) : <span />}
                  <Link
                    href={`/${slug}/reservar?barber=${barber.id}`}
                    className="text-primary font-semibold text-sm hover:underline flex items-center gap-1"
                  >
                    Reservar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <Link href={`/${slug}/reservar`} className="btn-primary">
          <Scissors className="w-5 h-5" /> Reservar con cualquier barbero
        </Link>
      </div>
    </div>
  )
}
