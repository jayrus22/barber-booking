'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Scissors, LogIn, Mail, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function LoginInner() {
  const params = useSearchParams()
  const initialMode = params.get('mode') === 'register' ? 'register' : 'login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } else if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } else {
      // forgot
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      })
      if (error) {
        setError(error.message)
      } else {
        setInfo('Te enviamos un correo con instrucciones para restablecer tu contraseña.')
      }
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-muted hover:text-foreground inline-flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-3">
            <Scissors className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">BarberBook</h1>
          <p className="text-muted text-sm mt-1">
            {mode === 'login' && 'Ingresa a tu panel de control'}
            {mode === 'register' && 'Crea tu cuenta de propietario'}
            {mode === 'forgot' && 'Restablece tu contraseña'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-lg shadow-black/30"
        >
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-success/10 border border-success/30 text-success text-sm rounded-lg p-3">
              {info}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="text-sm font-medium mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> Contraseña</span>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setInfo('') }}
                    className="text-xs text-primary hover:underline font-normal"
                  >
                    ¿Olvidaste?
                  </button>
                )}
              </label>
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center"
          >
            <LogIn className="w-4 h-4" />
            {loading
              ? 'Cargando...'
              : mode === 'login'
                ? 'Ingresar'
                : mode === 'register'
                  ? 'Crear cuenta'
                  : 'Enviar instrucciones'}
          </button>

          {mode !== 'forgot' && (
            <>
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted">o</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-card-hover border border-border hover:border-primary px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.84 0 3.41.66 4.65 1.84l3.46-3.46C18.04 1.49 15.24 0 12 0 7.39 0 3.4 2.69 1.49 6.6l4.04 3.16C6.51 7.27 9.04 5.04 12 5.04z"/>
                  <path fill="#34A853" d="M23.49 12.27c0-.81-.07-1.59-.21-2.34H12v4.42h6.45c-.28 1.5-1.13 2.78-2.4 3.63l3.92 3.04c2.29-2.11 3.62-5.22 3.62-8.75z"/>
                  <path fill="#FBBC05" d="M5.53 14.23c-.24-.71-.38-1.47-.38-2.23s.14-1.52.38-2.23L1.49 6.6C.55 8.31 0 10.1 0 12s.55 3.69 1.49 5.4l4.04-3.17z"/>
                  <path fill="#4285F4" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.92-3.04c-1.08.72-2.46 1.16-4.01 1.16-2.96 0-5.49-2.23-6.47-5.22L1.49 17.4C3.4 21.31 7.39 24 12 24z"/>
                </svg>
                Continuar con Google
              </button>
            </>
          )}

          <p className="text-center text-sm text-muted pt-2">
            {mode === 'login' && (
              <>
                ¿No tienes cuenta?{' '}
                <button type="button" onClick={() => { setMode('register'); setError(''); setInfo('') }} className="text-primary hover:underline">
                  Regístrate
                </button>
              </>
            )}
            {mode === 'register' && (
              <>
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); setInfo('') }} className="text-primary hover:underline">
                  Ingresar
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => { setMode('login'); setError(''); setInfo('') }} className="text-primary hover:underline">
                ← Volver a ingresar
              </button>
            )}
          </p>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Al continuar, aceptas nuestros términos de servicio y política de privacidad.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
