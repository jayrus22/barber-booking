'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCOPShort, formatCOP } from '@/lib/utils'
import { DollarSign, Users, TrendingUp, Calendar, Clock, BarChart3 } from 'lucide-react'

const COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ef4444']

interface BookingRow {
  date: string
  start_time: string
  status: string
  barber_id: string
  service_id: string
  service: { name: string; price_cop: number } | null
  barber: { name: string } | null
}

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    const since = format(subDays(new Date(), days), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('bookings')
      .select('date, start_time, status, barber_id, service_id, service:services(name, price_cop), barber:barbers(name)')
      .eq('shop_id', shop.id)
      .gte('date', since)
      .order('date')
    setBookings((data as unknown as BookingRow[]) || [])
    setLoading(false)
  }, [days])

  useEffect(() => { load() }, [load])

  // Revenue per day
  const revenueByDay = (() => {
    const map = new Map<string, number>()
    bookings.filter(b => b.status === 'completed').forEach(b => {
      map.set(b.date, (map.get(b.date) || 0) + (b.service?.price_cop || 0))
    })
    return Array.from(map.entries())
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date: format(parseISO(date), 'd MMM', { locale: es }),
        value,
      }))
  })()

  // Bookings per day (count)
  const countByDay = (() => {
    const map = new Map<string, number>()
    bookings.forEach(b => {
      map.set(b.date, (map.get(b.date) || 0) + 1)
    })
    return Array.from(map.entries())
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: format(parseISO(date), 'd MMM', { locale: es }),
        count,
      }))
  })()

  // Bookings per hour (peak hours)
  const peakHours = (() => {
    const map = new Map<number, number>()
    bookings.forEach(b => {
      const hour = parseInt(b.start_time.split(':')[0])
      map.set(hour, (map.get(hour) || 0) + 1)
    })
    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}:00`,
      count: map.get(h) || 0,
    })).filter(d => d.count > 0)
  })()

  // Popular services
  const popularServices = (() => {
    const map = new Map<string, number>()
    bookings.forEach(b => {
      const name = b.service?.name || 'Sin servicio'
      map.set(name, (map.get(name) || 0) + 1)
    })
    return Array.from(map.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({ name, value: count }))
  })()

  // Top barbers
  const topBarbers = (() => {
    const map = new Map<string, { count: number; revenue: number }>()
    bookings.forEach(b => {
      const name = b.barber?.name || 'Desconocido'
      const cur = map.get(name) || { count: 0, revenue: 0 }
      cur.count += 1
      if (b.status === 'completed') cur.revenue += b.service?.price_cop || 0
      map.set(name, cur)
    })
    return Array.from(map.entries())
      .sort(([,a], [,b]) => b.count - a.count)
      .map(([name, d]) => ({ name, citas: d.count, ingresos: d.revenue }))
  })()

  // Status distribution
  const statusData = (() => {
    const map = new Map<string, number>()
    bookings.forEach(b => {
      map.set(b.status, (map.get(b.status) || 0) + 1)
    })
    const labels: Record<string, string> = {
      confirmed: 'Confirmadas',
      completed: 'Completadas',
      cancelled: 'Canceladas',
      no_show: 'No asistió',
    }
    return Array.from(map.entries()).map(([k, v]) => ({ name: labels[k] || k, value: v }))
  })()

  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.service?.price_cop || 0), 0)
  const totalBookings = bookings.length
  const completedCount = bookings.filter(b => b.status === 'completed').length
  const noShowCount = bookings.filter(b => b.status === 'no_show').length
  const noShowRate = totalBookings > 0 ? Math.round((noShowCount / totalBookings) * 100) : 0
  const avgTicket = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0

  const stats = [
    { label: 'Ingresos', value: formatCOP(totalRevenue), icon: DollarSign, color: 'text-success' },
    { label: 'Total citas', value: totalBookings.toString(), icon: Calendar, color: 'text-primary' },
    { label: 'Ticket promedio', value: formatCOPShort(avgTicket), icon: TrendingUp, color: 'text-primary' },
    { label: 'Tasa ausencia', value: `${noShowRate}%`, icon: Users, color: noShowRate > 20 ? 'text-danger' : 'text-muted' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Estadísticas
          </h1>
          <p className="text-sm text-muted mt-1">Datos de los últimos {days} días</p>
        </div>
        <select value={days} onChange={e => setDays(parseInt(e.target.value))} className="w-40">
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
          <option value={180}>Últimos 6 meses</option>
          <option value={365}>Último año</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Cargando estadísticas...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">{s.label}</span>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Ingresos por día</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} tickFormatter={v => formatCOPShort(v)} />
                  <Tooltip
                    contentStyle={{ background: '#111118', border: '1px solid #27272a', borderRadius: 8 }}
                    formatter={(v) => formatCOP(typeof v === 'number' ? v : parseFloat(String(v)))}
                  />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Citas por día</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={countByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid #27272a', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Horas pico
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="hour" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid #27272a', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Servicios populares</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={popularServices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {popularServices.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid #27272a', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Barberos top</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topBarbers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#71717a" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} width={120} />
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid #27272a', borderRadius: 8 }} />
                  <Bar dataKey="citas" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4">Estados de citas</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid #27272a', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
