'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Scissors, Clock, Check, MessageCircle, CreditCard } from 'lucide-react'
import { formatCOP, formatTime, generateTimeSlots, getWhatsAppLink, cn } from '@/lib/utils'
import type { Shop, Barber, Service, Availability } from '@/lib/types'
import { format, addDays, getDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  shop: Shop
  barbers: Barber[]
  services: Service[]
  availability: Availability[]
}

type Step = 'barber' | 'service' | 'datetime' | 'info' | 'confirm'

export default function BookingForm({ shop, barbers, services, availability }: Props) {
  const [step, setStep] = useState<Step>('barber')
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [existingBookings, setExistingBookings] = useState<string[]>([])

  // Available dates for selected barber (next 14 days)
  const availableDates = useMemo(() => {
    if (!selectedBarber) return []
    const barberAvail = availability.filter(a => a.barber_id === selectedBarber.id)
    const availDays = new Set(barberAvail.map(a => a.day_of_week))
    const dates: string[] = []
    for (let i = 0; i < 14; i++) {
      const d = addDays(new Date(), i)
      if (availDays.has(getDay(d))) {
        dates.push(format(d, 'yyyy-MM-dd'))
      }
    }
    return dates
  }, [selectedBarber, availability])

  // Time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedBarber || !selectedDate || !selectedService) return []
    const dayOfWeek = getDay(new Date(selectedDate + 'T12:00:00'))
    const barberAvail = availability.find(
      a => a.barber_id === selectedBarber.id && a.day_of_week === dayOfWeek
    )
    if (!barberAvail) return []
    return generateTimeSlots(
      barberAvail.start_time,
      barberAvail.end_time,
      selectedService.duration_min
    )
  }, [selectedBarber, selectedDate, selectedService, availability])

  // Fetch existing bookings when date changes
  const loadBookings = async (date: string) => {
    if (!selectedBarber) return
    const supabase = createClient()
    const { data } = await supabase
      .from('bookings')
      .select('start_time')
      .eq('barber_id', selectedBarber.id)
      .eq('date', date)
      .in('status', ['confirmed', 'completed'])
    setExistingBookings(data?.map(b => b.start_time.slice(0, 5)) || [])
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    loadBookings(date)
  }

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
          date: selectedDate,
          start_time: selectedTime,
          status: 'confirmed',
          deposit_paid: false,
        })
        .select('id')
        .single()

      if (error) throw error
      setBookingId(data.id)
      setStep('confirm')
    } catch (err) {
      console.error(err)
      alert('Error al crear la reserva. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'barber', label: 'Barbero' },
    { key: 'service', label: 'Servicio' },
    { key: 'datetime', label: 'Fecha' },
    { key: 'info', label: 'Datos' },
    { key: 'confirm', label: 'Listo' },
  ]

  const stepIndex = steps.findIndex(s => s.key === step)

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href={`/${shop.slug}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" /> {shop.name}
          </Link>
          <h1 className="text-xl font-bold">Reservar cita</h1>

          {/* Steps indicator */}
          <div className="flex items-center gap-1 mt-4">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1 flex-1">
                <div className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= stepIndex ? "bg-primary" : "bg-border"
                )} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {steps.map(s => (
              <span key={s.key} className="text-xs text-muted">{s.label}</span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Select barber */}
        {step === 'barber' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Elige tu barbero</h2>
            <div className="grid gap-3">
              {barbers.map(barber => (
                <button
                  key={barber.id}
                  onClick={() => { setSelectedBarber(barber); setStep('service') }}
                  className="bg-card border border-border rounded-lg p-4 text-left hover:border-primary/50 hover:bg-card-hover transition-all flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                    {barber.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{barber.name}</p>
                    {barber.specialty && <p className="text-sm text-primary">{barber.specialty}</p>}
                    {barber.bio && <p className="text-sm text-muted mt-1 line-clamp-2">{barber.bio}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select service */}
        {step === 'service' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Elige el servicio</h2>
            <div className="grid gap-3">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep('datetime') }}
                  className="bg-card border border-border rounded-lg p-4 text-left hover:border-primary/50 hover:bg-card-hover transition-all flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {service.duration_min} min
                    </p>
                  </div>
                  <span className="text-primary font-semibold text-lg">{formatCOP(service.price_cop)}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('barber')} className="mt-4 text-sm text-muted hover:text-foreground">
              ← Cambiar barbero
            </button>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 'datetime' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Elige fecha y hora</h2>

            {/* Date picker */}
            <div className="mb-6">
              <p className="text-sm text-muted mb-2">Fecha disponible</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.map(date => {
                  const d = new Date(date + 'T12:00:00')
                  return (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        "flex flex-col items-center min-w-[70px] py-3 px-3 rounded-lg border transition-all shrink-0",
                        selectedDate === date
                          ? "bg-primary text-black border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-xs uppercase">
                        {format(d, 'EEE', { locale: es })}
                      </span>
                      <span className="text-lg font-bold">{format(d, 'd')}</span>
                      <span className="text-xs">{format(d, 'MMM', { locale: es })}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <p className="text-sm text-muted mb-2">Hora disponible</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {timeSlots.map(time => {
                    const booked = existingBookings.includes(time)
                    return (
                      <button
                        key={time}
                        onClick={() => !booked && setSelectedTime(time)}
                        disabled={booked}
                        className={cn(
                          "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                          booked
                            ? "bg-border/30 text-muted/50 border-border cursor-not-allowed line-through"
                            : selectedTime === time
                              ? "bg-primary text-black border-primary"
                              : "bg-card border-border hover:border-primary/50"
                        )}
                      >
                        {formatTime(time)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('service')} className="text-sm text-muted hover:text-foreground">
                ← Cambiar servicio
              </button>
              {selectedDate && selectedTime && (
                <button
                  onClick={() => setStep('info')}
                  className="ml-auto bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Continuar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Client info */}
        {step === 'info' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Tus datos</h2>

            {/* Summary */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Barbero</span>
                <span className="font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Servicio</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Fecha</span>
                <span className="font-medium">
                  {selectedDate && format(new Date(selectedDate + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hora</span>
                <span className="font-medium">{selectedTime && formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted">Total</span>
                <span className="font-semibold text-primary">{selectedService && formatCOP(selectedService.price_cop)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp / Teléfono</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('datetime')} className="text-sm text-muted hover:text-foreground">
                ← Cambiar fecha
              </button>
              <button
                onClick={handleSubmit}
                disabled={!clientName || !clientPhone || loading}
                className={cn(
                  "ml-auto font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2",
                  clientName && clientPhone && !loading
                    ? "bg-primary hover:bg-primary-hover text-black"
                    : "bg-border text-muted cursor-not-allowed"
                )}
              >
                {loading ? 'Reservando...' : 'Confirmar reserva'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 'confirm' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Cita confirmada</h2>
            <p className="text-muted mb-6">Tu reserva ha sido registrada exitosamente.</p>

            <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-2 text-sm max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-muted">Barbero</span>
                <span className="font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Servicio</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Fecha</span>
                <span className="font-medium">
                  {selectedDate && format(new Date(selectedDate + 'T12:00:00'), "EEE d MMM yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Hora</span>
                <span className="font-medium">{selectedTime && formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted">Total</span>
                <span className="font-semibold text-primary">{selectedService && formatCOP(selectedService.price_cop)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {shop.phone && (
                <a
                  href={getWhatsAppLink(
                    shop.phone,
                    `Hola! Reservé una cita en ${shop.name} para ${selectedDate} a las ${selectedTime && formatTime(selectedTime)}. Mi nombre es ${clientName}. ID: ${bookingId?.slice(0,8)}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> Confirmar por WhatsApp
                </a>
              )}
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-card border border-border hover:border-primary/50 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <CreditCard className="w-5 h-5" /> Pagar depósito (próximamente)
              </a>
            </div>

            <Link href={`/${shop.slug}`} className="block mt-6 text-sm text-muted hover:text-foreground">
              Volver a {shop.name}
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
