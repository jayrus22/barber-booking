export interface Shop {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  logo_url: string | null
  owner_id: string | null
  created_at: string
}

export interface Barber {
  id: string
  shop_id: string
  name: string
  photo_url: string | null
  specialty: string | null
  bio: string | null
  active: boolean
  created_at: string
}

export interface Service {
  id: string
  shop_id: string
  name: string
  duration_min: number
  price_cop: number
  active: boolean
  created_at: string
}

export interface Availability {
  id: string
  barber_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
}

export interface Booking {
  id: string
  shop_id: string
  barber_id: string
  service_id: string
  client_name: string
  client_phone: string
  date: string
  start_time: string
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  deposit_paid: boolean
  created_at: string
  // Joined
  barber?: Barber
  service?: Service
}

export interface GalleryImage {
  id: string
  barber_id: string
  image_url: string
  caption: string | null
  created_at: string
}
