import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Scissors, ArrowRight } from 'lucide-react'
import { formatCOP } from '@/lib/utils'
import type { Service } from '@/lib/types'

export default async function ServiciosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: shop } = await supabase.from('shops').select('id, name').eq('slug', slug).single()
  if (!shop) return null

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('active', true)
    .order('popular', { ascending: false })
    .order('price_cop')

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Catálogo</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Servicios y precios</h1>
        <p className="text-muted max-w-xl mx-auto">
          Todos nuestros servicios incluyen lavado, asesoría de estilo y atención personalizada.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {(services as Service[] | null)?.map(service => (
          <div key={service.id} className="bg-card border border-border rounded-xl overflow-hidden card-glow transition-all flex flex-col">
            {service.image_url && (
              <div className="relative h-48 w-full">
                <Image src={service.image_url} alt={service.name} fill className="object-cover" />
                {service.popular && (
                  <span className="absolute top-3 left-3 bg-primary text-black text-xs font-bold px-2 py-1 rounded">
                    POPULAR
                  </span>
                )}
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-lg">{service.name}</h3>
                <span className="text-primary font-bold text-lg whitespace-nowrap">{formatCOP(service.price_cop)}</span>
              </div>
              {service.description && (
                <p className="text-sm text-muted mb-4 flex-1">{service.description}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {service.duration_min} min
                </p>
                <Link
                  href={`/${slug}/reservar?service=${service.id}`}
                  className="text-primary font-medium text-sm hover:underline flex items-center gap-1"
                >
                  Reservar <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href={`/${slug}/reservar`} className="btn-primary">
          <Scissors className="w-5 h-5" /> Reservar cita
        </Link>
      </div>
    </div>
  )
}
