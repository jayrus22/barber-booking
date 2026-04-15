import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCOP, formatTime, getWhatsAppLink } from '@/lib/utils'
import {
  DollarSign,
  Users,
  XCircle,
  TrendingUp,
  Clock,
  MessageCircle,
} from 'lucide-react'
import type { Booking } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!shop) return null

  const today = format(new Date(), 'yyyy-MM-dd')

  // Today's bookings
  const { data: todayBookings } = await supabase
    .from('bookings')
    .select('*, barber:barbers(*), service:services(*)')
    .eq('shop_id', shop.id)
    .eq('date', today)
    .order('start_time')

  // Last 30 days stats
  const thirtyDaysAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  const { data: monthBookings } = await supabase
    .from('bookings')
    .select('*, service:services(price_cop)')
    .eq('shop_id', shop.id)
    .gte('date', thirtyDaysAgo)

  const totalRevenue = (monthBookings || [])
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + ((b.service as { price_cop: number } | null)?.price_cop || 0), 0)

  const totalBookings = (monthBookings || []).length
  const noShows = (monthBookings || []).filter(b => b.status === 'no_show').length
  const noShowRate = totalBookings > 0 ? Math.round((noShows / totalBookings) * 100) : 0

  // Most popular barber
  const barberCounts = new Map<string, { name: string; count: number }>()
  ;(monthBookings || []).forEach(b => {
    const existing = barberCounts.get(b.barber_id) || { name: b.barber_id, count: 0 }
    existing.count++
    barberCounts.set(b.barber_id, existing)
  })

  // Get barber names
  const { data: barbers } = await supabase
    .from('barbers')
    .select('id, name')
    .eq('shop_id', shop.id)

  barbers?.forEach(b => {
    const entry = barberCounts.get(b.id)
    if (entry) entry.name = b.name
  })

  const topBarber = Array.from(barberCounts.values()).sort((a, b) => b.count - a.count)[0]

  const stats = [
    {
      label: 'Ingresos (30 días)',
      value: formatCOP(totalRevenue),
      icon: DollarSign,
      color: 'text-success',
    },
    {
      label: 'Citas (30 días)',
      value: totalBookings.toString(),
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Tasa de ausencia',
      value: `${noShowRate}%`,
      icon: XCircle,
      color: noShowRate > 20 ? 'text-danger' : 'text-muted',
    },
    {
      label: 'Barbero popular',
      value: topBarber?.name || 'N/A',
      icon: TrendingUp,
      color: 'text-primary',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de control</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <h2 className="text-lg font-semibold mb-4">
        Citas de hoy — {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
      </h2>

      {(!todayBookings || todayBookings.length === 0) ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No hay citas programadas para hoy.
        </div>
      ) : (
        <div className="space-y-3">
          {(todayBookings as Booking[]).map(booking => (
            <div
              key={booking.id}
              className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="text-center min-w-[60px]">
                  <p className="text-lg font-bold text-primary">
                    {formatTime(booking.start_time)}
                  </p>
                </div>
                <div className="border-l border-border pl-3 flex-1">
                  <p className="font-medium">{booking.client_name}</p>
                  <p className="text-sm text-muted">
                    {booking.service?.name} — {booking.barber?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  booking.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                  booking.status === 'completed' ? 'bg-success/10 text-success' :
                  booking.status === 'cancelled' ? 'bg-danger/10 text-danger' :
                  'bg-muted/10 text-muted'
                }`}>
                  {booking.status === 'confirmed' ? 'Confirmada' :
                   booking.status === 'completed' ? 'Completada' :
                   booking.status === 'cancelled' ? 'Cancelada' : 'No asistió'}
                </span>
                <a
                  href={getWhatsAppLink(
                    booking.client_phone,
                    `Hola ${booking.client_name}! Recordatorio: tienes cita en ${shop.name} hoy a las ${formatTime(booking.start_time)}. Te esperamos!`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-[#25D366]/10 text-[#25D366] transition-colors"
                  title="Enviar recordatorio por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
