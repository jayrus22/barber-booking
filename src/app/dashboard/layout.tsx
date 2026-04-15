import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get or create shop for this user
  let { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // If no shop, claim the demo shop or create one
  if (!shop) {
    // Try to claim unclaimed demo shop
    const { data: unclaimed } = await supabase
      .from('shops')
      .select('*')
      .is('owner_id', null)
      .limit(1)
      .single()

    if (unclaimed) {
      await supabase
        .from('shops')
        .update({ owner_id: user.id })
        .eq('id', unclaimed.id)
      shop = { ...unclaimed, owner_id: user.id }
    } else {
      // Create new shop
      const slug = `shop-${user.id.slice(0, 8)}`
      const { data: newShop } = await supabase
        .from('shops')
        .insert({
          name: 'Mi Barbería',
          slug,
          owner_id: user.id,
        })
        .select()
        .single()
      shop = newShop
    }
  }

  if (!shop) redirect('/login')

  return (
    <div className="min-h-screen flex">
      <DashboardNav shopName={shop.name} shopSlug={shop.slug} />
      <main className="flex-1 ml-0 md:ml-64">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
