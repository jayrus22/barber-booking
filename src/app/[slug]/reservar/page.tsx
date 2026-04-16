import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingForm from '@/components/BookingForm'
import type { Shop } from '@/lib/types'

export default async function ReservarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ barber?: string; service?: string }>
}) {
  const { slug } = await params
  const { barber, service } = await searchParams
  const supabase = await createClient()

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single<Shop>()
  if (!shop) notFound()

  const { data: barbers } = await supabase
    .from('barbers')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('active', true)
    .order('rating_avg', { ascending: false })

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('active', true)
    .order('popular', { ascending: false })
    .order('price_cop')

  const barberIds = (barbers || []).map(b => b.id)
  const [{ data: availability }, { data: blocked }] = await Promise.all([
    supabase.from('availability').select('*').in('barber_id', barberIds.length ? barberIds : ['00000000-0000-0000-0000-000000000000']),
    supabase.from('blocked_dates').select('*').eq('shop_id', shop.id),
  ])

  return (
    <BookingForm
      shop={shop}
      barbers={barbers || []}
      services={services || []}
      availability={availability || []}
      blocked={blocked || []}
      initialBarberId={barber}
      initialServiceId={service}
    />
  )
}
