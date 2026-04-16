import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Scissors,
  MapPin,
  Phone,
  ArrowRight,
  Star,
  CheckCircle2,
  Clock,
  CreditCard,
  Users,
  Calendar,
  BarChart3,
} from 'lucide-react'
import type { Shop } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: shops } = await supabase
    .from('shops')
    .select('id, name, slug, address, phone, hero_image_url, tagline, city')
    .order('name')

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg">BarberBook</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">
              Acceso propietarios
            </Link>
            <Link href="/login?mode=register" className="btn-primary text-sm">
              Registrar barbería
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80"
            alt=""
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center animate-fade-in-up">
          <p className="text-primary uppercase text-xs sm:text-sm tracking-[0.25em] font-semibold mb-4">
            Plataforma de reservas para barberías
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-5 leading-tight">
            Tu próximo corte,
            <br />
            <span className="text-primary">a un toque</span> de distancia
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto mb-8">
            Encuentra tu barbería favorita y agenda en segundos. Sin llamadas. Sin esperas.
            Confirmación inmediata por WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="#barberias" className="btn-primary text-base">
              <Scissors className="w-5 h-5" /> Reservar ahora
            </Link>
            <Link href="/login?mode=register" className="btn-secondary text-base">
              Soy dueño de barbería <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Sin tarjeta</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Confirmación al instante</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> WhatsApp integrado</span>
          </div>
        </div>
      </section>

      {/* Shops list */}
      <section id="barberias" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Barberías destacadas</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Encuentra tu lugar</h2>
        </div>

        {shops && shops.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(shops as Pick<Shop, 'id' | 'name' | 'slug' | 'address' | 'phone' | 'hero_image_url' | 'tagline' | 'city'>[]).map(shop => (
              <Link
                key={shop.id}
                href={`/${shop.slug}`}
                className="bg-card border border-border rounded-xl overflow-hidden card-glow transition-all"
              >
                <div className="relative h-44 w-full bg-card-hover">
                  {shop.hero_image_url ? (
                    <Image src={shop.hero_image_url} alt={shop.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Scissors className="w-12 h-12 text-primary opacity-40" />
                    </div>
                  )}
                  {shop.city && (
                    <span className="absolute top-3 right-3 bg-background/80 backdrop-blur text-xs px-2 py-1 rounded">
                      {shop.city}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1">{shop.name}</h3>
                  {shop.tagline && <p className="text-primary text-xs mb-3">{shop.tagline}</p>}
                  {shop.address && (
                    <p className="flex items-center gap-1.5 text-sm text-muted mb-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {shop.address}
                    </p>
                  )}
                  {shop.phone && (
                    <p className="flex items-center gap-1.5 text-sm text-muted">
                      <Phone className="w-3.5 h-3.5 shrink-0" /> {shop.phone}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium">
                    Ver y reservar <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-16">
            <Scissors className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Aún no hay barberías registradas.</p>
            <Link href="/login?mode=register" className="btn-primary mt-4">
              Registra la primera <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* For owners */}
      <section className="bg-card/30 border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Para dueños de barbería</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Todo lo que necesitas para llenar tu agenda</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Calendar, title: 'Agenda online 24/7', desc: 'Tus clientes reservan cuando quieran.' },
              { icon: Users, title: 'CRM de clientes', desc: 'Historial, preferencias y datos de cada visita.' },
              { icon: BarChart3, title: 'Estadísticas', desc: 'Ingresos, ausencias, barberos populares.' },
              { icon: CreditCard, title: 'Depósitos opcionales', desc: 'Reduce las inasistencias con un depósito.' },
            ].map((b, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 text-center">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1 text-sm">{b.title}</h3>
                <p className="text-xs text-muted">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/login?mode=register" className="btn-primary">
              Crear cuenta gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Cómo funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Tres pasos. Listo.</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { n: '01', title: 'Elige tu barbería', desc: 'Explora barberías cercanas y revisa servicios.' },
            { n: '02', title: 'Selecciona barbero, fecha y hora', desc: 'Mira la disponibilidad en tiempo real.' },
            { n: '03', title: 'Confirma y listo', desc: 'Recibe tu confirmación por WhatsApp al instante.' },
          ].map((s) => (
            <div key={s.n} className="bg-card border border-border rounded-xl p-6">
              <p className="text-primary font-mono text-sm mb-3">{s.n}</p>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-muted">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" />
            <span>BarberBook &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">Acceso propietarios</Link>
            <Link href="/login?mode=register" className="hover:text-foreground">Registrar barbería</Link>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="ml-1">Hecho en Colombia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
