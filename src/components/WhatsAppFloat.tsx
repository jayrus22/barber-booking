import { MessageCircle } from 'lucide-react'

export default function WhatsAppFloat({ phone, message }: { phone: string; message?: string }) {
  const cleaned = phone.replace(/[^0-9]/g, '')
  const text = encodeURIComponent(message || 'Hola! Quiero más información.')
  return (
    <a
      href={`https://wa.me/${cleaned}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1DA851] text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center transition-all hover:scale-110 animate-float"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  )
}
