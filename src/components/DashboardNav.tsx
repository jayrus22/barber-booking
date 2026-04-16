'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Scissors,
  LayoutDashboard,
  Calendar,
  Users,
  Wrench,
  Clock,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Star,
  MessageSquare,
  Image as ImageIcon,
  Ban,
  BarChart3,
  Settings,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navSections = [
  {
    title: 'General',
    items: [
      { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
      { href: '/dashboard/calendario', label: 'Calendario', icon: Calendar },
      { href: '/dashboard/analytics', label: 'Estadísticas', icon: BarChart3 },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { href: '/dashboard/barberos', label: 'Barberos', icon: Users },
      { href: '/dashboard/servicios', label: 'Servicios', icon: Wrench },
      { href: '/dashboard/horarios', label: 'Horarios', icon: Clock },
      { href: '/dashboard/bloqueos', label: 'Bloqueos', icon: Ban },
      { href: '/dashboard/galeria', label: 'Galería', icon: ImageIcon },
    ],
  },
  {
    title: 'Clientes',
    items: [
      { href: '/dashboard/clientes', label: 'Clientes', icon: UserCircle },
      { href: '/dashboard/reviews', label: 'Reseñas', icon: Star },
      { href: '/dashboard/mensajes', label: 'Mensajes', icon: MessageSquare },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { href: '/dashboard/ajustes', label: 'Ajustes', icon: Settings },
    ],
  },
]

export default function DashboardNav({ shopName, shopSlug }: { shopName: string; shopSlug: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const nav = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Scissors className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold">BarberBook</span>
        </Link>
        <p className="text-xs text-muted mt-2 truncate">{shopName}</p>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.title}>
            <p className="px-3 text-[10px] uppercase tracking-wider text-muted mb-1.5 font-semibold">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted hover:text-foreground hover:bg-card-hover'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <Link
          href={`/${shopSlug}`}
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-card-hover transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver página pública
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-danger hover:bg-card-hover transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-card border border-border rounded-lg p-2"
        aria-label="Abrir menú"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {nav}
      </aside>
    </>
  )
}
