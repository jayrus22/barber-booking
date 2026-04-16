import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, MessageCircle, Scissors } from 'lucide-react'
import { Instagram, Facebook } from '@/components/SocialIcons'
import { instagramUrl, facebookUrl, getDayName } from '@/lib/utils'
import type { Shop } from '@/lib/types'

const dayKeys = ['sun','mon','tue','wed','thu','fri','sat']

export default async function ContactoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: shop } = await supabase.from('shops').select('*').eq('slug', slug).single<Shop>()
  if (!shop) return null

  const ig = instagramUrl(shop.instagram)
  const fb = facebookUrl(shop.facebook)
  const wa = shop.whatsapp ? `https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola! Quiero información sobre ${shop.name}.`)}` : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Estamos para atenderte</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Contáctanos</h1>
        <p className="text-muted max-w-xl mx-auto">
          Encuéntranos, llámanos o escríbenos por WhatsApp. Respondemos rápido.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          {shop.address && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-0.5">Dirección</p>
                <p className="font-medium">{shop.address}</p>
                {shop.city && <p className="text-sm text-muted">{shop.city}</p>}
              </div>
            </div>
          )}

          {shop.phone && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-0.5">Teléfono</p>
                <a href={`tel:${shop.phone}`} className="font-medium hover:text-primary">{shop.phone}</a>
              </div>
            </div>
          )}

          {shop.email && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-0.5">Email</p>
                <a href={`mailto:${shop.email}`} className="font-medium hover:text-primary">{shop.email}</a>
              </div>
            </div>
          )}

          {shop.opening_hours && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Horario</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
                  {[1,2,3,4,5,6,0].map(i => {
                    const key = dayKeys[i]
                    const value = shop.opening_hours?.[key]
                    if (!value) return null
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted">{getDayName(i)}</span>
                        <span className={value === 'closed' ? 'text-danger' : 'font-medium'}>
                          {value === 'closed' ? 'Cerrado' : value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Socials */}
          <div className="border-t border-border pt-5">
            <p className="text-xs text-muted uppercase tracking-wider mb-3">Redes sociales</p>
            <div className="flex gap-3 flex-wrap">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-medium text-sm transition-colors">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {ig && (
                <a href={ig} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card-hover hover:bg-primary/10 hover:text-primary font-medium text-sm transition-colors">
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
              )}
              {fb && (
                <a href={fb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card-hover hover:bg-primary/10 hover:text-primary font-medium text-sm transition-colors">
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-card border border-border rounded-xl overflow-hidden h-[500px]">
          {shop.google_maps_embed ? (
            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: shop.google_maps_embed.replace(/width="[^"]*"/g, 'width="100%"').replace(/height="[^"]*"/g, 'height="100%"') }} />
          ) : shop.latitude && shop.longitude ? (
            <iframe
              src={`https://www.google.com/maps?q=${shop.latitude},${shop.longitude}&z=15&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted">
              <MapPin className="w-12 h-12 opacity-30" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href={`/${slug}/reservar`} className="btn-primary">
          <Scissors className="w-5 h-5" /> Reservar cita
        </Link>
      </div>
    </div>
  )
}
