'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { formatTime, getWhatsAppLink, cn } from '@/lib/utils'
import type { Booking, Barber } from '@/lib/types'

export default function CalendarioPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [shopId, setShopId] = useState<string>('')
  const [shopPhone, setShopPhone] = useState<string>('')
  const [shopName, setShopName] = useState<string>('')

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: shop } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', user.id)
      .single()
    if (!shop) return

    setShopId(shop.id)
    setShopPhone(shop.phone || '')
    setShopName(shop.name)

    const { data: b } = await supabase
      .from('barbers')
      .select('*')
      .eq('shop_id', shop.id)
      .eq('active', true)
      .order('name')
    setBarbers(b || [])

    const weekEnd = addDays(weekStart, 6)
    const { data: bk } = await supabase
      .from('bookings')
      .select('*, barber:barbers(*), service:services(*)')
      .eq('shop_id', shop.id)
      .gte('date', format(weekStart, 'yyyy-MM-dd'))
      .lte('date', format(weekEnd, 'yyyy-MM-dd'))
      .order('start_time')
    setBookings((bk as Booking[]) || [])
  }, [weekStart])

  useEffect(() => { loadData() }, [loadData])

  const updateStatus = async (bookingId: string, status: string) => {
    const supabase = createClient()
    await supabase.from('bookings').update({ status }).eq('id', bookingId)
    loadData()
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendario semanal</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="p-2 rounded-lg border border-border hover:bg-card transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {format(weekStart, "d MMM", { locale: es })} — {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
          </span>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="p-2 rounded-lg border border-border hover:bg-card transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {days.map(day => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "text-center py-2 rounded-lg text-sm font-medium",
                    isToday ? "bg-primary text-black" : "bg-card border border-border"
                  )}
                >
                  <div className="text-xs uppercase">{format(day, 'EEE', { locale: es })}</div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>
              )
            })}
          </div>

          {/* Bookings grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const dayBookings = bookings.filter(b => b.date === dayStr)
              return (
                <div key={dayStr} className="space-y-1 min-h-[100px]">
                  {dayBookings.map(booking => (
                    <div
                      key={booking.id}
                      className={cn(
                        "rounded-lg p-2 text-xs border",
                        booking.status === 'confirmed' ? 'bg-primary/10 border-primary/30' :
                        booking.status === 'completed' ? 'bg-success/10 border-success/30' :
                        booking.status === 'cancelled' ? 'bg-danger/10 border-danger/30' :
                        'bg-muted/10 border-muted/30'
                      )}
                    >
                      <p className="font-bold">{formatTime(booking.start_time)}</p>
                      <p className="truncate">{booking.client_name}</p>
                      <p className="text-muted truncate">{booking.barber?.name}</p>
                      <div className="flex gap-1 mt-1">
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => updateStatus(booking.id, 'completed')}
                              className="text-success hover:underline"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => updateStatus(booking.id, 'no_show')}
                              className="text-danger hover:underline"
                            >
                              NS
                            </button>
                          </>
                        )}
                        <a
                          href={getWhatsAppLink(
                            booking.client_phone,
                            `Hola ${booking.client_name}! Recordatorio: tienes cita en ${shopName} el ${format(new Date(booking.date + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })} a las ${formatTime(booking.start_time)}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#25D366] hover:underline ml-auto"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
