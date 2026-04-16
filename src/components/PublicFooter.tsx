import Link from 'next/link'
import { Scissors, MessageCircle, MapPin, Phone, Mail } from 'lucide-react'
import { Instagram, Facebook } from '@/components/SocialIcons'
import { instagramUrl, facebookUrl } from '@/lib/utils'
import type { Shop } from '@/lib/types'

export default function PublicFooter({ shop }: { shop: Shop }) {
  const ig = instagramUrl(shop.instagram)
  const fb = facebookUrl(shop.facebook)
  const wa = shop.whatsapp ? `https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}` : null

  return (
    <footer className="border-t border-border mt-16 bg-card/30">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <Link href={`/${shop.slug}`} className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold">{shop.name}</span>
          </Link>
          {shop.tagline && <p className="text-sm text-muted">{shop.tagline}</p>}
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted">Explora</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href={`/${shop.slug}/servicios`} className="hover:text-primary transition-colors">Servicios</Link></li>
            <li><Link href={`/${shop.slug}/barberos`} className="hover:text-primary transition-colors">Barberos</Link></li>
            <li><Link href={`/${shop.slug}/galeria`} className="hover:text-primary transition-colors">Galería</Link></li>
            <li><Link href={`/${shop.slug}/reviews`} className="hover:text-primary transition-colors">Reseñas</Link></li>
            <li><Link href={`/${shop.slug}/reservar`} className="hover:text-primary transition-colors">Reservar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted">Contacto</h4>
          <ul className="space-y-2 text-sm text-muted">
            {shop.address && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <span>{shop.address}</span>
              </li>
            )}
            {shop.phone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <a href={`tel:${shop.phone}`} className="hover:text-foreground">{shop.phone}</a>
              </li>
            )}
            {shop.email && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <a href={`mailto:${shop.email}`} className="hover:text-foreground">{shop.email}</a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted">Síguenos</h4>
          <div className="flex gap-3">
            {ig && (
              <a href={ig} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-card border border-border hover:border-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {fb && (
              <a href={fb} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-card border border-border hover:border-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-card border border-border hover:border-whatsapp transition-colors text-whatsapp">
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-xs text-muted">
          {shop.name} &copy; {new Date().getFullYear()} — Reserva potenciada por{' '}
          <Link href="/" className="text-primary hover:underline">BarberBook</Link>
        </div>
      </div>
    </footer>
  )
}
