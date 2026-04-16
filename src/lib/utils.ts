export function formatCOP(amount: number): string {
  return `$${amount.toLocaleString('es-CO')} COP`
}

export function formatCOPShort(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}k`
  return `$${amount}`
}

export function getWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

export function getDayName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[day] || ''
}

export function getDayShort(day: number): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return days[day] || ''
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${hour12}:${m} ${ampm}`
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMin: number
): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)

  let currentMin = startH * 60 + startM
  const endMin = endH * 60 + endM

  while (currentMin + durationMin <= endMin) {
    const h = Math.floor(currentMin / 60)
    const m = currentMin % 60
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    currentMin += durationMin
  }

  return slots
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function instagramUrl(handle: string | null | undefined): string | null {
  if (!handle) return null
  const clean = handle.replace(/^@/, '').trim()
  if (!clean) return null
  return `https://instagram.com/${clean}`
}

export function facebookUrl(handle: string | null | undefined): string | null {
  if (!handle) return null
  const clean = handle.replace(/^@/, '').trim()
  if (!clean) return null
  if (clean.startsWith('http')) return clean
  return `https://facebook.com/${clean}`
}

export function bookingMessage(opts: {
  shopName: string
  clientName: string
  date: string
  time: string
  barberName?: string
  serviceName?: string
}): string {
  return `Hola! Reservé en ${opts.shopName}. Cita el ${opts.date} a las ${opts.time}${
    opts.barberName ? ` con ${opts.barberName}` : ''
  }${opts.serviceName ? ` para ${opts.serviceName}` : ''}. Mi nombre: ${opts.clientName}.`
}
