import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingForm from '@/components/BookingForm'

export default async function ReservarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!shop) notFound()

  const [{ data: barbers }, { data: services }, { data: availability }] = await Promise.all([
    supabase.from('barbers').select('*').eq('shop_id', shop.id).eq('active', true).order('name'),
    supabase.from('services').select('*').eq('shop_id', shop.id).eq('active', true).order('price_cop'),
    supabase.from('availability').select('*').in(
      'barber_id',
      (await supabase.from('barbers').select('id').eq('shop_id', shop.id)).data?.map(b => b.id) || []
    ),
  ])

  return (
    <BookingForm
      shop={shop}
      barbers={barbers || []}
      services={services || []}
      availability={availability || []}
    />
  )
}
