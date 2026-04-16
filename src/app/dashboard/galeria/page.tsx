'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ImageIcon, Save } from 'lucide-react'
import Image from 'next/image'
import type { GalleryImage } from '@/lib/types'

export default function GaleriaDashboardPage() {
  const [shopId, setShopId] = useState('')
  const [images, setImages] = useState<GalleryImage[]>([])
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) return
    setShopId(shop.id)
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .eq('shop_id', shop.id)
      .order('sort_order')
    setImages((data as GalleryImage[]) || [])
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!url) return
    const supabase = createClient()
    const sortOrder = images.length + 1
    await supabase.from('gallery').insert({
      shop_id: shopId,
      image_url: url,
      caption: caption || null,
      sort_order: sortOrder,
    })
    setUrl(''); setCaption('')
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return
    const supabase = createClient()
    await supabase.from('gallery').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
        <ImageIcon className="w-6 h-6 text-primary" /> Galería
      </h1>
      <p className="text-muted text-sm mb-6">Gestiona las fotos que aparecen en tu página pública.</p>

      <div className="bg-card border border-border rounded-xl p-5 mb-6 grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">URL de la imagen</label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full"
          />
        </div>
        <div className="flex gap-2 items-end">
          <input
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Descripción (opcional)"
            className="flex-1"
          />
          <button onClick={handleAdd} disabled={!url} className="btn-primary disabled:opacity-50">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center text-muted py-12">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          No hay imágenes en la galería.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="relative aspect-square">
                <Image src={img.image_url} alt={img.caption || ''} fill className="object-cover" />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <p className="text-xs text-muted truncate flex-1">{img.caption || 'Sin descripción'}</p>
                <button onClick={() => handleDelete(img.id)} className="p-1.5 rounded hover:bg-danger/10 shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
