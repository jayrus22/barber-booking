import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Scissors, MapPin, Phone } from 'lucide-react'
import type { Shop } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: shops } = await supabase
    .from('shops')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">BarberBook</span>
          </div>
          <Link
            href="/login"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Acceso propietarios
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Reserva tu cita en segundos
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Encuentra tu barbería favorita y agenda sin llamar. Rápido, fácil y sin complicaciones.
          </p>
        </div>

        {/* Shop listing */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(shops as Shop[] | null)?.map((shop) => (
            <Link
              key={shop.id}
              href={`/${shop.slug}`}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-card-hover transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {shop.name}
                </h2>
              </div>
              {shop.address && (
                <div className="flex items-center gap-2 text-sm text-muted mb-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{shop.address}</span>
                </div>
              )}
              {shop.phone && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{shop.phone}</span>
                </div>
              )}
              <div className="mt-4 text-sm text-primary font-medium">
                Reservar cita →
              </div>
            </Link>
          ))}
        </div>

        {(!shops || shops.length === 0) && (
          <div className="text-center text-muted py-20">
            <Scissors className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No hay barberías registradas aún.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-muted">
          BarberBook &copy; {new Date().getFullYear()} — Plataforma de reservas para barberías
        </div>
      </footer>
    </div>
  )
}
