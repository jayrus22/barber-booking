'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import {
  Scissors,
  Clock,
  Check,
  MessageCircle,
  CreditCard,
  Star,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  User,
  Phone,
} from 'lucide-react'
import {
  formatCOP,
  formatTime,
  generateTimeSlots,
  getWhatsAppLink,
  cn,
  bookingMessage,
} from '@/lib/utils'
import type { Shop, Barber, Service, Availability, BlockedDate } from '@/lib/types'
import {
  format,
  addDays,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  shop: Shop
  barbers: Barber[]
  services: Service[]
  availability: Availability[]
  blocked?: BlockedDate[]
  initialBarberId?: string
  initialServiceId?: string
}

type Step = 'service' | 'barber' | 'date' | 'time' | 'info' | 'confirm'

const steps: { key: Step; label: string }[] = [
  { key: 'service', label: 'Servicio' },
  { key: 'barber', label: 'Barbero' },
  { key: 'date', label: 'Fecha' },
  { key: 'time', label: 'Hora' },
  { key: 'info', label: 'Datos' },
  { key: 'confirm', label: 'Listo' },
]

export default function BookingForm({
  shop,
  barbers,
  services,
  availability,
  blocked = [],
  initialBarberId,
  initialServiceId,
}: Props) {
  const [step, setStep] = useState<Step>(initialServiceId ? 'barber' : 'service')

  const [selectedService, setSelectedService] = useState<Service | null>(
    initialServiceId ? services.find(s => s.id === initialServiceId) || null : null
  )
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(
    initialBarberId ? barbers.find(b => b.id === initialBarberId) || null : null
  )
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [existingBookings, setExistingBookings] = useState<string[]>([])
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const stepIndex = steps.findIndex(s => s.key === step)

  const goNext = (next: Step) => {
    setStep(next)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Available days (next 60 days that have availability and not blocked)
  const availableDateSet = useMemo(() => {
    if (!selectedBarber) return new Set<string>()
    const barberAvail = availability.filter(a => a.barber_id === selectedBarber.id)
    const days = new Set(barberAvail.map(a => a.day_of_week))
    const blockedDates = new Set(
      blocked
        .filter(b => !b.barber_id || b.barber_id === selectedBarber.id)
        .map(b => b.date)
    )
    const set = new Set<string>()
    for (let i = 0; i < 60; i++) {
      const d = addDays(new Date(), i)
      const ymd = format(d, 'yyyy-MM-dd')
      if (days.has(getDay(d)) && !blockedDates.has(ymd)) set.add(ymd)
    }
    return set
  }, [selectedBarber, availability, blocked])

  // Time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedBarber || !selectedDate || !selectedService) return []
    const dayOfWeek = getDay(new Date(selectedDate + 'T12:00:00'))
    const barberAvail = availability.find(
      a => a.barber_id === selectedBarber.id && a.day_of_week === dayOfWeek
    )
    if (!barberAvail) return []
    return generateTimeSlots(barberAvail.start_time, barberAvail.end_time, selectedService.duration_min)
  }, [selectedBarber, selectedDate, selectedService, availability])

  // Calendar month grid
  const monthGrid = useMemo(() => {
    const start = startOfMonth(calendarMonth)
    const end = endOfMonth(calendarMonth)
    const days = eachDayOfInterval({ start, end })
    // Pad start to a Sunday-aligned grid
    const padStart = getDay(start)
    const padEnd = 6 - getDay(end)
    return [
      ...Array(padStart).fill(null),
      ...days,
      ...Array(padEnd).fill(null),
    ]
  }, [calendarMonth])

  useEffect(() => {
    if (!selectedBarber || !selectedDate) return
    const supabase = createClient()
    supabase
      .from('bookings')
      .select('start_time')
      .eq('barber_id', selectedBarber.id)
      .eq('date', selectedDate)
      .in('status', ['confirmed', 'completed'])
      .then(({ data }) => {
        setExistingBookings(data?.map(b => b.start_time.slice(0, 5)) || [])
      })
  }, [selectedBarber, selectedDate])

  const handleSubmit = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          shop_id: shop.id,
          barber_id: selectedBarber.id,
          service_id: selectedService.id,
          client_name: clientName,
          client_phone: clientPhone,
          email: clientEmail || null,
          notes: notes || null,
          date: selectedDate,
          start_time: selectedTime,
          status: 'confirmed',
          deposit_paid: false,
        })
        .select('id')
        .single()
      if (error) throw error

      // Try to upsert customer (best-effort, RLS may prevent — safe to ignore)
      await supabase
        .from('customers')
        .upsert(
          {
            shop_id: shop.id,
            name: clientName,
            phone: clientPhone,
            email: clientEmail || null,
            visit_count: 1,
            last_visit_at: selectedDate,
          },
          { onConflict: 'shop_id,phone', ignoreDuplicates: true }
        )

      setBookingId(data.id)
      goNext('confirm')
    } catch (err) {
      console.error(err)
      alert('Error al crear la reserva. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const depositAmount = selectedService && shop.deposit_percent
    ? Math.round((selectedService.price_cop * shop.deposit_percent) / 100)
    : 0

  return (
    <div className="min-h-screen pb-12">
      <div className="border-b border-border bg-card/30">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <Link
            href={`/${shop.slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a {shop.name}
          </Link>
          <h1 className="text-2xl font-bold">Reservar cita</h1>
          {/* Progress */}
          <div className="mt-5">
            <div className="flex items-center gap-1">
              {steps.map((s, i) => (
                <div
                  key={s.key}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i <= stepIndex ? 'bg-primary' : 'bg-border'
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {steps.map(s => (
                <span
                  key={s.key}
                  className={cn(
                    'text-[10px] sm:text-xs',
                    s.key === step ? 'text-primary font-semibold' : 'text-muted'
                  )}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* STEP 1 — SERVICE */}
        {step === 'service' && (
          <section className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">¿Qué servicio quieres?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service)
                    goNext('barber')
                  }}
                  className={cn(
                    'bg-card border rounded-xl overflow-hidden text-left transition-all hover:border-primary card-glow',
                    selectedService?.id === service.id ? 'border-primary' : 'border-border'
                  )}
                >
                  {service.image_url && (
                    <div className="relative h-32 w-full">
                      <Image src={service.image_url} alt={service.name} fill className="object-cover" />
                      {service.popular && (
                        <span className="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-2 py-1 rounded">
                          POPULAR
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold">{service.name}</p>
                      <span className="text-primary font-bold whitespace-nowrap">{formatCOP(service.price_cop)}</span>
                    </div>
                    {service.description && (
                      <p className="text-xs text-muted line-clamp-2 mb-2">{service.description}</p>
                    )}
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {service.duration_min} min
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* STEP 2 — BARBER */}
        {step === 'barber' && (
          <section className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">Elige tu barbero</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {barbers.map(barber => (
                <button
                  key={barber.id}
                  onClick={() => {
                    setSelectedBarber(barber)
                    goNext('date')
                  }}
                  className={cn(
                    'bg-card border rounded-xl overflow-hidden text-left transition-all hover:border-primary card-glow',
                    selectedBarber?.id === barber.id ? 'border-primary' : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-3 p-4">
                    {barber.photo_url ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                        <Image src={barber.photo_url} alt={barber.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                        {barber.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{barber.name}</p>
                      {barber.specialty && <p className="text-xs text-primary truncate">{barber.specialty}</p>}
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="font-semibold">{barber.rating_avg || '5.0'}</span>
                        <span className="text-muted">({barber.rating_count || 0})</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <button onClick={() => goNext('service')} className="text-sm text-muted hover:text-foreground">
                ← Cambiar servicio
              </button>
            </div>
          </section>
        )}

        {/* STEP 3 — DATE */}
        {step === 'date' && selectedBarber && (
          <section className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">Elige una fecha</h2>
            <div className="bg-card border border-border rounded-xl p-5 mb-4">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                  disabled={isSameMonth(calendarMonth, new Date()) || isBefore(calendarMonth, new Date())}
                  className="p-2 rounded-lg hover:bg-card-hover disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold">
                  {format(calendarMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <button
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  className="p-2 rounded-lg hover:bg-card-hover"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-1 text-xs text-muted text-center font-semibold">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((day, i) => {
                  if (!day) return <div key={i} />
                  const ymd = format(day, 'yyyy-MM-dd')
                  const isPast = isBefore(day, startOfDay(new Date()))
                  const isAvailable = availableDateSet.has(ymd) && !isPast
                  const isSelected = selectedDate === ymd
                  const isToday = isSameDay(day, new Date())
                  return (
                    <button
                      key={i}
                      onClick={() => isAvailable && (setSelectedDate(ymd), goNext('time'))}
                      disabled={!isAvailable}
                      className={cn(
                        'aspect-square rounded-lg text-sm font-medium transition-all',
                        isSelected && 'bg-primary text-black',
                        !isSelected && isAvailable && 'hover:bg-primary/10 hover:text-primary',
                        !isAvailable && 'text-muted/30 cursor-not-allowed',
                        isToday && !isSelected && 'border border-primary/40'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted mb-6">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary inline-block" /> Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-primary/40 inline-block" /> Hoy
              </span>
            </div>
            <button onClick={() => goNext('barber')} className="text-sm text-muted hover:text-foreground">
              ← Cambiar barbero
            </button>
          </section>
        )}

        {/* STEP 4 — TIME */}
        {step === 'time' && selectedDate && (
          <section className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-1">Elige una hora</h2>
            <p className="text-sm text-muted mb-4 flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              {format(new Date(selectedDate + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}
            </p>

            {timeSlots.length === 0 ? (
              <p className="text-muted">No hay horarios disponibles para esta fecha.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                {timeSlots.map(time => {
                  const booked = existingBookings.includes(time)
                  return (
                    <button
                      key={time}
                      disabled={booked}
                      onClick={() => {
                        setSelectedTime(time)
                        goNext('info')
                      }}
                      className={cn(
                        'py-2.5 px-2 rounded-lg border text-sm font-medium transition-all',
                        booked
                          ? 'bg-border/30 text-muted/50 border-border cursor-not-allowed line-through'
                          : selectedTime === time
                            ? 'bg-primary text-black border-primary'
                            : 'bg-card border-border hover:border-primary'
                      )}
                    >
                      {formatTime(time)}
                    </button>
                  )
                })}
              </div>
            )}
            <button onClick={() => goNext('date')} className="text-sm text-muted hover:text-foreground">
              ← Cambiar fecha
            </button>
          </section>
        )}

        {/* STEP 5 — INFO */}
        {step === 'info' && (
          <section className="animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">Tus datos</h2>

            {/* Summary */}
            <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Servicio</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Barbero</span>
                <span className="font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Fecha</span>
                <span className="font-medium">
                  {selectedDate &&
                    format(new Date(selectedDate + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hora</span>
                <span className="font-medium">{selectedTime && formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted">Total</span>
                <span className="font-bold text-primary">
                  {selectedService && formatCOP(selectedService.price_cop)}
                </span>
              </div>
              {depositAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Depósito ({shop.deposit_percent}%)</span>
                  <span className="text-primary">{formatCOP(depositAmount)}</span>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1">
                  <User className="w-4 h-4" /> Nombre completo
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1">
                  <Phone className="w-4 h-4" /> WhatsApp / Teléfono
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email (opcional)</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Algo que debamos saber..."
                  rows={2}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button onClick={() => goNext('time')} className="text-sm text-muted hover:text-foreground self-center">
                ← Cambiar hora
              </button>
              <button
                onClick={handleSubmit}
                disabled={!clientName || !clientPhone || loading}
                className={cn(
                  'sm:ml-auto font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2',
                  clientName && clientPhone && !loading
                    ? 'bg-primary hover:bg-primary-hover text-black'
                    : 'bg-border text-muted cursor-not-allowed'
                )}
              >
                {loading ? 'Reservando...' : <>Confirmar reserva <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </section>
        )}

        {/* STEP 6 — CONFIRM */}
        {step === 'confirm' && (
          <section className="animate-fade-in-up text-center py-6">
            <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5 animate-pulse-soft">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-3xl font-bold mb-2">¡Cita confirmada!</h2>
            <p className="text-muted mb-8">
              Te esperamos. Recibirás un recordatorio por WhatsApp.
            </p>

            <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-2 text-sm max-w-md mx-auto text-left">
              <div className="flex justify-between">
                <span className="text-muted">Servicio</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Barbero</span>
                <span className="font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Fecha</span>
                <span className="font-medium">
                  {selectedDate && format(new Date(selectedDate + 'T12:00:00'), 'EEE d MMM yyyy', { locale: es })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hora</span>
                <span className="font-medium">{selectedTime && formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted">Total</span>
                <span className="font-bold text-primary">{selectedService && formatCOP(selectedService.price_cop)}</span>
              </div>
              {bookingId && (
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-muted">Código</span>
                  <span className="font-mono">{bookingId.slice(0, 8).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              {(shop.whatsapp || shop.phone) && selectedService && selectedBarber && selectedDate && selectedTime && (
                <a
                  href={getWhatsAppLink(
                    shop.whatsapp || shop.phone || '',
                    bookingMessage({
                      shopName: shop.name,
                      clientName,
                      date: format(new Date(selectedDate + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es }),
                      time: formatTime(selectedTime),
                      barberName: selectedBarber.name,
                      serviceName: selectedService.name,
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> Enviar por WhatsApp
                </a>
              )}
              {depositAmount > 0 && (
                <button
                  className="inline-flex items-center gap-2 bg-card border border-border hover:border-primary font-medium px-6 py-3 rounded-lg transition-colors"
                  disabled
                >
                  <CreditCard className="w-5 h-5" /> Pagar depósito {formatCOP(depositAmount)}
                </button>
              )}
            </div>

            <Link href={`/${shop.slug}`} className="text-muted hover:text-foreground text-sm inline-flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5" /> Volver a {shop.name}
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
