import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Scissors,
  Star,
  Clock,
  ArrowRight,
  MapPin,
  Phone,
  CheckCircle2,
  Quote,
} from 'lucide-react'
import { formatCOP } from '@/lib/utils'
import type { Barber, Service, Testimonial, Review, GalleryImage, Shop } from '@/lib/types'

export default async function ShopHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single<Shop>()
  if (!shop) return null

  const [
    { data: barbers },
    { data: services },
    { data: testimonials },
    { data: reviews },
    { data: gallery },
  ] = await Promise.all([
    supabase.from('barbers').select('*').eq('shop_id', shop.id).eq('active', true).order('rating_avg', { ascending: false }),
    supabase.from('services').select('*').eq('shop_id', shop.id).eq('active', true).order('popular', { ascending: false }).order('price_cop'),
    supabase.from('testimonials').select('*').eq('shop_id', shop.id).eq('featured', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('reviews').select('*').eq('shop_id', shop.id).eq('approved', true).order('created_at', { ascending: false }).limit(6),
    supabase.from('gallery').select('*').eq('shop_id', shop.id).order('sort_order').limit(8),
  ])

  const avgRating =
    (reviews as Review[] | null)?.length
      ? ((reviews as Review[]).reduce((s, r) => s + r.rating, 0) / (reviews as Review[]).length).toFixed(1)
      : '5.0'

  const heroImg = shop.hero_image_url ||
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80'

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[78vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src={heroImg}
          alt={shop.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in-up">
          {shop.tagline && (
            <p className="text-primary uppercase tracking-[0.2em] text-xs sm:text-sm mb-4 font-semibold">
              {shop.tagline}
            </p>
          )}
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-5 leading-tight">
            {shop.name}
          </h1>
          {shop.description && (
            <p className="text-foreground/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 line-clamp-3">
              {shop.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-primary fill-primary" />
            ))}
            <span className="text-sm text-muted ml-2">
              {avgRating} / 5 — basado en clientes reales
            </span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/${slug}/reservar`} className="btn-primary text-base">
              <Scissors className="w-5 h-5" /> Reservar cita
            </Link>
            <Link href={`/${slug}/servicios`} className="btn-secondary text-base">
              Ver servicios <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK INFO BAR */}
      <section className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-6 grid sm:grid-cols-3 gap-4 text-sm">
          {shop.address && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Ubicación</p>
                <p className="font-medium">{shop.address}</p>
              </div>
            </div>
          )}
          {shop.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Teléfono</p>
                <a href={`tel:${shop.phone}`} className="font-medium hover:text-primary">{shop.phone}</a>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted">Horario</p>
              <p className="font-medium">Lun a Sáb · 9:00 AM — 8:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Lo que ofrecemos</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Nuestros servicios</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(services as Service[] | null)?.slice(0, 6).map(service => (
            <div key={service.id} className="bg-card border border-border rounded-xl overflow-hidden card-glow transition-all">
              {service.image_url && (
                <div className="relative h-40 w-full">
                  <Image src={service.image_url} alt={service.name} fill className="object-cover" />
                  {service.popular && (
                    <span className="absolute top-2 left-2 bg-primary text-black text-xs font-bold px-2 py-1 rounded">
                      POPULAR
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold">{service.name}</h3>
                  <span className="text-primary font-bold whitespace-nowrap">{formatCOP(service.price_cop)}</span>
                </div>
                {service.description && <p className="text-sm text-muted line-clamp-2 mb-3">{service.description}</p>}
                <p className="text-xs text-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {service.duration_min} minutos
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href={`/${slug}/servicios`} className="btn-secondary">
            Ver todos los servicios <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* BARBERS PREVIEW */}
      <section className="bg-card/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">El equipo</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Nuestros barberos</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(barbers as Barber[] | null)?.slice(0, 3).map(barber => (
              <div key={barber.id} className="bg-card border border-border rounded-xl overflow-hidden group">
                {barber.photo_url ? (
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={barber.photo_url}
                      alt={barber.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-64 w-full bg-primary/10 flex items-center justify-center">
                    <span className="text-7xl font-bold text-primary">{barber.name.charAt(0)}</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg">{barber.name}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="font-semibold">{barber.rating_avg || '5.0'}</span>
                    </div>
                  </div>
                  {barber.specialty && <p className="text-primary text-sm mb-2">{barber.specialty}</p>}
                  {barber.bio && <p className="text-sm text-muted line-clamp-2">{barber.bio}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href={`/${slug}/barberos`} className="btn-secondary">
              Conoce a todo el equipo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {(testimonials as Testimonial[] | null)?.length ? (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Lo dicen nuestros clientes</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Testimonios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {(testimonials as Testimonial[]).map(t => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-6 relative">
                <Quote className="w-8 h-8 text-primary/30 absolute top-3 right-3" />
                <p className="text-sm text-foreground/90 mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  {t.avatar_url ? (
                    <Image src={t.avatar_url} alt={t.author} width={40} height={40} className="rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {t.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{t.author}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-primary fill-primary" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* GALLERY PREVIEW */}
      {(gallery as GalleryImage[] | null)?.length ? (
        <section className="bg-card/30 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Nuestro trabajo</p>
              <h2 className="text-3xl sm:text-4xl font-bold">Galería</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(gallery as GalleryImage[]).slice(0, 8).map(g => (
                <div key={g.id} className="relative aspect-square overflow-hidden rounded-xl group">
                  <Image
                    src={g.image_url}
                    alt={g.caption || 'Gallery'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href={`/${slug}/galeria`} className="btn-secondary">
                Ver galería completa <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* WHY US */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: CheckCircle2, title: 'Reserva en 60 segundos', desc: 'Sin llamadas, sin esperar.' },
            { icon: Star, title: 'Equipo experto', desc: 'Barberos calificados con años de experiencia.' },
            { icon: Clock, title: 'Puntualidad', desc: 'Tu hora se respeta. Sin esperas largas.' },
          ].map((b, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <b.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-1">{b.title}</h3>
              <p className="text-sm text-muted">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16 text-center">
        <div className="bg-gradient-to-br from-primary/15 to-card border border-primary/30 rounded-2xl p-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">¿Listo para tu próximo corte?</h2>
          <p className="text-muted mb-6 max-w-xl mx-auto">
            Reserva en menos de un minuto. Sin compromiso. Confirmación inmediata.
          </p>
          <Link href={`/${slug}/reservar`} className="btn-primary text-base">
            <Scissors className="w-5 h-5" /> Reservar mi cita
          </Link>
        </div>
      </section>
    </div>
  )
}
