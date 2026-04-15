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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/dashboard/calendario', label: 'Calendario', icon: Calendar },
  { href: '/dashboard/barberos', label: 'Barberos', icon: Users },
  { href: '/dashboard/servicios', label: 'Servicios', icon: Wrench },
  { href: '/dashboard/horarios', label: 'Horarios', icon: Clock },
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
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          <span className="font-bold">BarberBook</span>
        </div>
        <p className="text-xs text-muted mt-1 truncate">{shopName}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:text-foreground hover:bg-card"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <Link
          href={`/${shopSlug}`}
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-card transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver página pública
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-danger hover:bg-card transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-card border border-border rounded-lg p-2"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {nav}
      </aside>
    </>
  )
}
