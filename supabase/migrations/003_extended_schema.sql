-- Extended Schema: Additional features (reviews, customers, blocked dates, shop gallery, hours)

-- Drop old single-image gallery constraint by adding shop_id to gallery
alter table public.gallery
  add column if not exists shop_id uuid references public.shops(id) on delete cascade,
  add column if not exists sort_order integer default 0;

-- Make barber_id nullable so we can have shop-wide gallery items
alter table public.gallery alter column barber_id drop not null;

-- Extend shops with richer fields
alter table public.shops
  add column if not exists description text,
  add column if not exists tagline text,
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists whatsapp text,
  add column if not exists email text,
  add column if not exists hero_image_url text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists city text,
  add column if not exists google_maps_embed text,
  add column if not exists deposit_percent integer default 0,
  add column if not exists currency text default 'COP',
  add column if not exists primary_color text default '#f59e0b',
  add column if not exists opening_hours jsonb;

-- Extend barbers
alter table public.barbers
  add column if not exists rating_avg numeric(3,2) default 0,
  add column if not exists rating_count integer default 0,
  add column if not exists instagram text,
  add column if not exists years_experience integer;

-- Extend services
alter table public.services
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists popular boolean default false;

-- Extend bookings for notes and customer link
alter table public.bookings
  add column if not exists customer_id uuid,
  add column if not exists notes text,
  add column if not exists email text,
  add column if not exists reminder_sent boolean default false;

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  barber_id uuid references public.barbers(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  client_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  approved boolean default true,
  created_at timestamptz default now()
);

-- Customers (CRM lite)
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text,
  notes text,
  tags text[],
  visit_count integer default 0,
  last_visit_at date,
  created_at timestamptz default now(),
  unique(shop_id, phone)
);

-- Blocked dates (vacations)
create table if not exists public.blocked_dates (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  barber_id uuid references public.barbers(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz default now()
);

-- Message templates (WhatsApp/SMS)
create table if not exists public.message_templates (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp','sms','email')),
  body text not null,
  created_at timestamptz default now()
);

-- Testimonials (curated) - separate from reviews
create table if not exists public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  author text not null,
  quote text not null,
  avatar_url text,
  featured boolean default true,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_reviews_shop on public.reviews(shop_id);
create index if not exists idx_reviews_barber on public.reviews(barber_id);
create index if not exists idx_customers_shop on public.customers(shop_id);
create index if not exists idx_blocked_dates_shop on public.blocked_dates(shop_id);
create index if not exists idx_blocked_dates_barber_date on public.blocked_dates(barber_id, date);
create index if not exists idx_gallery_shop on public.gallery(shop_id);

-- RLS
alter table public.reviews enable row level security;
alter table public.customers enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.message_templates enable row level security;
alter table public.testimonials enable row level security;

-- Public read for reviews, testimonials, blocked_dates (needed for booking)
drop policy if exists "Public read reviews" on public.reviews;
create policy "Public read reviews" on public.reviews for select using (approved = true);
drop policy if exists "Public insert reviews" on public.reviews;
create policy "Public insert reviews" on public.reviews for insert with check (true);

drop policy if exists "Public read testimonials" on public.testimonials;
create policy "Public read testimonials" on public.testimonials for select using (true);

drop policy if exists "Public read blocked_dates" on public.blocked_dates;
create policy "Public read blocked_dates" on public.blocked_dates for select using (true);

-- Owner manage policies
drop policy if exists "Owner manage reviews" on public.reviews;
create policy "Owner manage reviews" on public.reviews for all using (
  shop_id in (select id from public.shops where owner_id = auth.uid())
);
drop policy if exists "Owner manage customers" on public.customers;
create policy "Owner manage customers" on public.customers for all using (
  shop_id in (select id from public.shops where owner_id = auth.uid())
);
drop policy if exists "Owner manage blocked" on public.blocked_dates;
create policy "Owner manage blocked" on public.blocked_dates for all using (
  shop_id in (select id from public.shops where owner_id = auth.uid())
);
drop policy if exists "Owner manage templates" on public.message_templates;
create policy "Owner manage templates" on public.message_templates for all using (
  shop_id in (select id from public.shops where owner_id = auth.uid())
);
drop policy if exists "Owner manage testimonials" on public.testimonials;
create policy "Owner manage testimonials" on public.testimonials for all using (
  shop_id in (select id from public.shops where owner_id = auth.uid())
);

-- Storage bucket for shop uploads (logos, hero, gallery)
insert into storage.buckets (id, name, public)
values ('shop-media', 'shop-media', true)
on conflict (id) do nothing;
