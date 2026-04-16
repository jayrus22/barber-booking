import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import type { Shop } from '@/lib/types'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: shop } = await supabase
    .from('shops')
    .select('name, tagline, description, hero_image_url')
    .eq('slug', slug)
    .single()

  if (!shop) return { title: 'Barbería' }

  return {
    title: shop.name,
    description: shop.description || shop.tagline || `Reserva tu cita en ${shop.name}`,
    openGraph: {
      title: shop.name,
      description: shop.description || shop.tagline || `Reserva tu cita en ${shop.name}`,
      images: shop.hero_image_url
        ? [{ url: shop.hero_image_url, width: 1200, height: 630 }]
        : undefined,
    },
  }
}

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single<Shop>()

  if (!shop) notFound()

  return (
    <>
      <PublicHeader shopName={shop.name} shopSlug={shop.slug} />
      <main className="flex-1">{children}</main>
      <PublicFooter shop={shop} />
      {shop.whatsapp && (
        <WhatsAppFloat
          phone={shop.whatsapp}
          message={`Hola! Quiero más información sobre ${shop.name}.`}
        />
      )}
    </>
  )
}
