-- Barber Booking SaaS - Initial Schema
-- Multi-tenant barbershop scheduling platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Shops table
create table if not exists public.shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  address text,
  phone text,
  logo_url text,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Barbers table
create table if not exists public.barbers (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  photo_url text,
  specialty text,
  bio text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Services table
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  duration_min integer not null default 30,
  price_cop integer not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Availability table (weekly schedule per barber)
create table if not exists public.availability (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid references public.barbers(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now()
);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  barber_id uuid references public.barbers(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete cascade not null,
  client_name text not null,
  client_phone text not null,
  date date not null,
  start_time time not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'completed', 'cancelled', 'no_show')),
  deposit_paid boolean default false,
  created_at timestamptz default now()
);

-- Gallery images for barbers
create table if not exists public.gallery (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid references public.barbers(id) on delete cascade not null,
  image_url text not null,
  caption text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_shops_slug on public.shops(slug);
create index if not exists idx_barbers_shop on public.barbers(shop_id);
create index if not exists idx_services_shop on public.services(shop_id);
create index if not exists idx_availability_barber on public.availability(barber_id);
create index if not exists idx_bookings_shop_date on public.bookings(shop_id, date);
create index if not exists idx_bookings_barber_date on public.bookings(barber_id, date);
create index if not exists idx_gallery_barber on public.gallery(barber_id);

-- RLS policies
alter table public.shops enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;
alter table public.gallery enable row level security;

-- Public read access for shops, barbers, services, availability, gallery
create policy "Public read shops" on public.shops for select using (true);
create policy "Public read barbers" on public.barbers for select using (true);
create policy "Public read services" on public.services for select using (true);
create policy "Public read availability" on public.availability for select using (true);
create policy "Public read gallery" on public.gallery for select using (true);

-- Public insert for bookings (clients book without auth)
create policy "Public insert bookings" on public.bookings for insert with check (true);
create policy "Public read bookings" on public.bookings for select using (true);

-- Owner can manage their shop's data
create policy "Owner manage shops" on public.shops for all using (auth.uid() = owner_id);
create policy "Owner manage barbers" on public.barbers for all using (
  shop_id in (select id from public.shops where owner_id = auth.uid())
);
create policy "Owner manage services" on public.services for all using (
  shop_id in (select id from public.shops where owner_id = auth.uid())
);
create policy "Owner manage bookings" on public.bookings for all using (
  shop_id in (select id from public.shops where owner_id = auth.uid())
);
create policy "Owner manage availability" on public.availability for all using (
  barber_id in (
    select b.id from public.barbers b
    join public.shops s on b.shop_id = s.id
    where s.owner_id = auth.uid()
  )
);
create policy "Owner manage gallery" on public.gallery for all using (
  barber_id in (
    select b.id from public.barbers b
    join public.shops s on b.shop_id = s.id
    where s.owner_id = auth.uid()
  )
);
