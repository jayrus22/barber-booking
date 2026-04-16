import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Scissors, Camera } from 'lucide-react'
import type { GalleryImage } from '@/lib/types'

export default async function GaleriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, instagram')
    .eq('slug', slug)
    .single()
  if (!shop) return null

  const { data: images } = await supabase
    .from('gallery')
    .select('*')
    .eq('shop_id', shop.id)
    .order('sort_order')

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <p className="text-primary uppercase text-xs tracking-widest font-semibold mb-2">Nuestro trabajo</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Galería</h1>
        <p className="text-muted max-w-xl mx-auto">
          Cada corte cuenta una historia. Inspírate con nuestros últimos trabajos.
        </p>
        {shop.instagram && (
          <a
            href={`https://instagram.com/${shop.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline text-sm"
          >
            <Camera className="w-4 h-4" /> Síguenos en Instagram {shop.instagram}
          </a>
        )}
      </div>

      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(images as GalleryImage[]).map(img => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl group">
              <Image
                src={img.image_url}
                alt={img.caption || 'Trabajo'}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {img.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm font-medium">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-16">
          <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Aún no hay imágenes en la galería.</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href={`/${slug}/reservar`} className="btn-primary">
          <Scissors className="w-5 h-5" /> Reservar mi corte
        </Link>
      </div>
    </div>
  )
}
