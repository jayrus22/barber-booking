export interface Shop {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  logo_url: string | null
  owner_id: string | null
  created_at: string
  // Extended
  description: string | null
  tagline: string | null
  instagram: string | null
  facebook: string | null
  whatsapp: string | null
  email: string | null
  hero_image_url: string | null
  latitude: number | null
  longitude: number | null
  city: string | null
  google_maps_embed: string | null
  deposit_percent: number | null
  currency: string | null
  primary_color: string | null
  opening_hours: Record<string, string> | null
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
  // Extended
  rating_avg: number | null
  rating_count: number | null
  instagram: string | null
  years_experience: number | null
}

export interface Service {
  id: string
  shop_id: string
  name: string
  duration_min: number
  price_cop: number
  active: boolean
  created_at: string
  // Extended
  description: string | null
  image_url: string | null
  popular: boolean | null
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
  customer_id: string | null
  notes: string | null
  email: string | null
  reminder_sent: boolean | null
  // Joined
  barber?: Barber
  service?: Service
}

export interface GalleryImage {
  id: string
  barber_id: string | null
  shop_id: string | null
  image_url: string
  caption: string | null
  sort_order: number | null
  created_at: string
}

export interface Review {
  id: string
  shop_id: string
  barber_id: string | null
  booking_id: string | null
  client_name: string
  rating: number
  comment: string | null
  approved: boolean
  created_at: string
  barber?: Barber
}

export interface Customer {
  id: string
  shop_id: string
  name: string
  phone: string
  email: string | null
  notes: string | null
  tags: string[] | null
  visit_count: number
  last_visit_at: string | null
  created_at: string
}

export interface BlockedDate {
  id: string
  shop_id: string
  barber_id: string | null
  date: string
  reason: string | null
  created_at: string
}

export interface MessageTemplate {
  id: string
  shop_id: string
  name: string
  channel: 'whatsapp' | 'sms' | 'email'
  body: string
  created_at: string
}

export interface Testimonial {
  id: string
  shop_id: string
  author: string
  quote: string
  avatar_url: string | null
  featured: boolean
  created_at: string
}
