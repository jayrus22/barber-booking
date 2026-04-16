import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://citamejor.vercel.app'
  const supabase = await createClient()
  const { data: shops } = await supabase.from('shops').select('slug, created_at')

  const shopUrls: MetadataRoute.Sitemap = (shops || []).flatMap(s => [
    { url: `${base}/${s.slug}`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/${s.slug}/servicios`, lastModified: new Date(), priority: 0.7 },
    { url: `${base}/${s.slug}/barberos`, lastModified: new Date(), priority: 0.7 },
    { url: `${base}/${s.slug}/galeria`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/${s.slug}/reviews`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/${s.slug}/contacto`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/${s.slug}/reservar`, lastModified: new Date(), priority: 0.8 },
  ])

  return [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), priority: 0.4 },
    ...shopUrls,
  ]
}
