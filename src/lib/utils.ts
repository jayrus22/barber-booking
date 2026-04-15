export function formatCOP(amount: number): string {
  return `$${amount.toLocaleString('es-CO')} COP`
}

export function getWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

export function getDayName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
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
