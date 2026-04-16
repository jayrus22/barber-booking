import Link from 'next/link'
import { Scissors, Home, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mb-6">
        <Scissors className="w-10 h-10 text-primary" />
      </div>
      <p className="text-primary uppercase text-xs tracking-[0.25em] font-semibold mb-2">Error 404</p>
      <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">Página no encontrada</h1>
      <p className="text-muted max-w-md mb-8">
        Esta página no existe o fue removida. Volvamos a casa.
      </p>
      <Link href="/" className="btn-primary">
        <Home className="w-4 h-4" /> Ir al inicio <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
