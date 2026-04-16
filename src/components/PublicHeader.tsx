'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scissors, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  shopName: string
  shopSlug: string
}

const links = [
  { href: '', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/barberos', label: 'Barberos' },
  { href: '/galeria', label: 'Galería' },
  { href: '/reviews', label: 'Reseñas' },
  { href: '/contacto', label: 'Contacto' },
]

export default function PublicHeader({ shopName, shopSlug }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const base = `/${shopSlug}`

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={base} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
            <Scissors className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-bold leading-tight">{shopName}</p>
            <p className="text-[10px] uppercase text-muted tracking-wider">BarberBook</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => {
            const href = base + l.href
            const active = pathname === href || (l.href === '' && pathname === base)
            return (
              <Link
                key={l.href}
                href={href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted hover:text-foreground'
                )}
              >
                {l.label}
              </Link>
            )
          })}
          <Link
            href={`${base}/reservar`}
            className="ml-2 btn-primary text-sm"
          >
            <Scissors className="w-4 h-4" /> Reservar
          </Link>
        </nav>

        <button
          className="md:hidden p-2 rounded-lg border border-border"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map(l => {
              const href = base + l.href
              const active = pathname === href || (l.href === '' && pathname === base)
              return (
                <Link
                  key={l.href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted hover:text-foreground hover:bg-card-hover'
                  )}
                >
                  {l.label}
                </Link>
              )
            })}
            <Link
              href={`${base}/reservar`}
              onClick={() => setOpen(false)}
              className="btn-primary justify-center mt-2"
            >
              <Scissors className="w-4 h-4" /> Reservar cita
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
