'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Plus, Trash2, Save, Copy } from 'lucide-react'
import type { MessageTemplate } from '@/lib/types'

export default function MensajesPage() {
  const [shopId, setShopId] = useState('')
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', channel: 'whatsapp' as 'whatsapp' | 'sms' | 'email', body: '' })

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    setShopId(shop.id)
    const { data } = await supabase
      .from('message_templates')
      .select('*')
      .eq('shop_id', shop.id)
      .order('created_at')
    setTemplates((data as MessageTemplate[]) || [])
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    const supabase = createClient()
    if (editing) {
      await supabase.from('message_templates').update({
        name: form.name,
        channel: form.channel,
        body: form.body,
      }).eq('id', editing)
    } else {
      await supabase.from('message_templates').insert({
        shop_id: shopId,
        ...form,
      })
    }
    setForm({ name: '', channel: 'whatsapp', body: '' })
    setAdding(false); setEditing(null)
    load()
  }

  const handleEdit = (t: MessageTemplate) => {
    setEditing(t.id)
    setAdding(false)
    setForm({ name: t.name, channel: t.channel, body: t.body })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return
    const supabase = createClient()
    await supabase.from('message_templates').delete().eq('id', id)
    load()
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" /> Plantillas de mensajes
        </h1>
        <button onClick={() => { setAdding(true); setEditing(null); setForm({ name: '', channel: 'whatsapp', body: '' }) }} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Nueva plantilla
        </button>
      </div>
      <p className="text-muted text-sm mb-6">
        Plantillas para WhatsApp, SMS o email. Usa <code className="text-primary">{'{nombre}'}</code>, <code className="text-primary">{'{fecha}'}</code>, <code className="text-primary">{'{hora}'}</code>, <code className="text-primary">{'{barbero}'}</code>, <code className="text-primary">{'{servicio}'}</code>, <code className="text-primary">{'{barberia}'}</code>.
      </p>

      {(adding || editing) && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-3">
          <h3 className="font-semibold">{editing ? 'Editar plantilla' : 'Nueva plantilla'}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre" />
            <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value as 'whatsapp'|'sms'|'email'})}>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
          <textarea
            value={form.body}
            onChange={e => setForm({...form, body: e.target.value})}
            placeholder="Hola {nombre}! Tu cita es el {fecha} a las {hora}..."
            rows={4}
            className="w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!form.name || !form.body} className="btn-primary disabled:opacity-50">
              <Save className="w-4 h-4" /> Guardar
            </button>
            <button onClick={() => { setAdding(false); setEditing(null) }} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <span className="text-xs text-primary uppercase tracking-wider">{t.channel}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => copy(t.body)} className="p-1.5 rounded hover:bg-card-hover" title="Copiar">
                  <Copy className="w-4 h-4 text-muted" />
                </button>
                <button onClick={() => handleEdit(t)} className="p-1.5 rounded hover:bg-card-hover">
                  <Save className="w-4 h-4 text-primary" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-danger/10">
                  <Trash2 className="w-4 h-4 text-danger" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted whitespace-pre-wrap">{t.body}</p>
          </div>
        ))}
      </div>

      {templates.length === 0 && !adding && (
        <div className="text-center text-muted py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          No tienes plantillas aún.
        </div>
      )}
    </div>
  )
}
