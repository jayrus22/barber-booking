'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Settings, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { Shop } from '@/lib/types'

export default function AjustesPage() {
  const [shop, setShop] = useState<Shop | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', tagline: '', description: '', address: '', city: '',
    phone: '', whatsapp: '', email: '',
    instagram: '', facebook: '',
    hero_image_url: '', logo_url: '', google_maps_embed: '',
    deposit_percent: 0,
  })

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('shops').select('*').eq('owner_id', user.id).single<Shop>()
    if (!data) return
    setShop(data)
    setForm({
      name: data.name,
      slug: data.slug,
      tagline: data.tagline || '',
      description: data.description || '',
      address: data.address || '',
      city: data.city || '',
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      email: data.email || '',
      instagram: data.instagram || '',
      facebook: data.facebook || '',
      hero_image_url: data.hero_image_url || '',
      logo_url: data.logo_url || '',
      google_maps_embed: data.google_maps_embed || '',
      deposit_percent: data.deposit_percent || 0,
    })
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!shop) return
    setSaving(true); setSaved(false)
    const supabase = createClient()
    const { error } = await supabase.from('shops').update({
      name: form.name,
      slug: form.slug,
      tagline: form.tagline || null,
      description: form.description || null,
      address: form.address || null,
      city: form.city || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      hero_image_url: form.hero_image_url || null,
      logo_url: form.logo_url || null,
      google_maps_embed: form.google_maps_embed || null,
      deposit_percent: form.deposit_percent || 0,
    }).eq('id', shop.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      load()
    } else {
      alert('Error al guardar: ' + error.message)
    }
  }

  if (!shop) return <p className="text-muted">Cargando...</p>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
        <Settings className="w-6 h-6 text-primary" /> Ajustes de tu barbería
      </h1>
      <p className="text-muted text-sm mb-6">
        Configura la información que se muestra en tu página pública.{' '}
        <Link href={`/${shop.slug}`} target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
          Ver página <ExternalLink className="w-3 h-3" />
        </Link>
      </p>

      <div className="space-y-6">
        <Section title="Información general">
          <Field label="Nombre">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full" />
          </Field>
          <Field label="Slug (URL)">
            <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')})} className="w-full" />
            <p className="text-xs text-muted mt-1">tu-barberia.com/{form.slug}</p>
          </Field>
          <Field label="Eslogan corto">
            <input value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} placeholder="Estilo, precisión y carácter" className="w-full" />
          </Field>
          <Field label="Descripción">
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="w-full" />
          </Field>
        </Section>

        <Section title="Contacto y ubicación">
          <Field label="Dirección">
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full" />
          </Field>
          <Field label="Ciudad">
            <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full" />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Teléfono">
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+57 300 123 4567" className="w-full" />
            </Field>
            <Field label="WhatsApp (con código país)">
              <input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="+573001234567" className="w-full" />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full" />
          </Field>
          <Field label="Embed de Google Maps (HTML)">
            <textarea value={form.google_maps_embed} onChange={e => setForm({...form, google_maps_embed: e.target.value})} rows={3} placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>' className="w-full font-mono text-xs" />
          </Field>
        </Section>

        <Section title="Imágenes y branding">
          <Field label="URL de imagen hero (banner)">
            <input value={form.hero_image_url} onChange={e => setForm({...form, hero_image_url: e.target.value})} placeholder="https://..." className="w-full" />
          </Field>
          <Field label="URL del logo">
            <input value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})} placeholder="https://..." className="w-full" />
          </Field>
        </Section>

        <Section title="Redes sociales">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Instagram (@usuario)">
              <input value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} placeholder="@tubarberia" className="w-full" />
            </Field>
            <Field label="Facebook (usuario o URL)">
              <input value={form.facebook} onChange={e => setForm({...form, facebook: e.target.value})} placeholder="tubarberia" className="w-full" />
            </Field>
          </div>
        </Section>

        <Section title="Reservas">
          <Field label="Depósito requerido (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={form.deposit_percent}
              onChange={e => setForm({...form, deposit_percent: parseInt(e.target.value) || 0})}
              className="w-32"
            />
            <p className="text-xs text-muted mt-1">Porcentaje del precio que el cliente paga al reservar (0 = sin depósito).</p>
          </Field>
        </Section>

        <div className="flex items-center gap-3 sticky bottom-4 bg-background/80 backdrop-blur-md py-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && <span className="text-success text-sm">¡Guardado!</span>}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  )
}
