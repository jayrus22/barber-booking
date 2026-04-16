'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserCircle, Search, MessageCircle, Phone, Mail, Calendar, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getWhatsAppLink } from '@/lib/utils'
import type { Customer } from '@/lib/types'

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [shopId, setShopId] = useState('')
  const [shopName, setShopName] = useState('')
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: shop } = await supabase.from('shops').select('id, name').eq('owner_id', user.id).single()
    if (!shop) return
    setShopId(shop.id)
    setShopName(shop.name)
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', shop.id)
      .order('last_visit_at', { ascending: false, nullsFirst: false })
    setCustomers((data as Customer[]) || [])
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!form.name || !form.phone) return
    const supabase = createClient()
    await supabase.from('customers').upsert({
      shop_id: shopId,
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      notes: form.notes || null,
    }, { onConflict: 'shop_id,phone' })
    setForm({ name: '', phone: '', email: '', notes: '' })
    setAdding(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return
    const supabase = createClient()
    await supabase.from('customers').delete().eq('id', id)
    load()
  }

  const filtered = useMemo(() => {
    if (!search) return customers
    const q = search.toLowerCase()
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    )
  }, [customers, search])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-primary" /> Clientes
        </h1>
        <button onClick={() => setAdding(!adding)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Nuevo cliente
        </button>
      </div>
      <p className="text-muted text-sm mb-6">CRM ligero. Los clientes se agregan automáticamente con cada reserva.</p>

      {adding && (
        <div className="bg-card border border-border rounded-xl p-5 mb-4 grid sm:grid-cols-2 gap-3">
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre completo *" />
          <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Teléfono *" />
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email (opcional)" />
          <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notas (opcional)" />
          <div className="sm:col-span-2 flex gap-2">
            <button onClick={handleAdd} disabled={!form.name || !form.phone} className="btn-primary disabled:opacity-50">
              Guardar
            </button>
            <button onClick={() => setAdding(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email"
          className="w-full pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-muted py-12">
          <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          {customers.length === 0 ? 'Aún no tienes clientes.' : 'No hay coincidencias.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted mt-0.5">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>
                  {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                  {c.last_visit_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Última visita: {format(new Date(c.last_visit_at + 'T12:00:00'), 'd MMM yyyy', { locale: es })}
                    </span>
                  )}
                </div>
                {c.notes && <p className="text-xs text-muted truncate mt-1">{c.notes}</p>}
              </div>
              <span className="text-xs text-muted">{c.visit_count} visitas</span>
              <a
                href={getWhatsAppLink(c.phone, `Hola ${c.name}! Te escribimos de ${shopName}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-[#25D366]/10 text-[#25D366]"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-danger/10">
                <Trash2 className="w-4 h-4 text-danger" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
