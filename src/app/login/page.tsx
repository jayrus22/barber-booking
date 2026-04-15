'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Scissors, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <Scissors className="w-7 h-7 text-primary" />
            BarberBook
          </Link>
          <p className="text-muted mt-2">
            {mode === 'login' ? 'Ingresa a tu panel' : 'Crea tu cuenta de propietario'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-black font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-muted">
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={() => setMode('register')} className="text-primary hover:underline">
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-primary hover:underline">
                  Ingresar
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  )
}
