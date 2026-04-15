-- Seed data: Demo barbershop "Barbería El Patrón"
-- Note: owner_id is null for seed data (will be claimed by first auth user)

insert into public.shops (id, name, slug, address, phone, logo_url) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Barbería El Patrón', 'el-patron', 'Calle 85 #15-40, Bogotá', '+57 301 234 5678', null)
on conflict (slug) do nothing;

-- Barbers
insert into public.barbers (id, shop_id, name, photo_url, specialty, bio) values
  ('b1000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Carlos "El Maestro" Reyes', null, 'Fade y diseños', 'Más de 10 años de experiencia en cortes modernos. Especialista en degradados y diseños artísticos.'),
  ('b1000001-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Miguel Ángel Torres', null, 'Barba y corte clásico', 'Barbero tradicional con técnica moderna. Experto en arreglo de barba y cortes clásicos con tijera.'),
  ('b1000001-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Andrés Felipe López', null, 'Cortes urbanos', 'Joven talento con estilo urbano. Especialista en cortes de tendencia y asesoría de imagen.')
on conflict do nothing;

-- Services
insert into public.services (id, shop_id, name, duration_min, price_cop) values
  ('s1000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Corte de cabello', 30, 25000),
  ('s1000001-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Arreglo de barba', 20, 15000),
  ('s1000001-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Corte + Barba', 45, 35000),
  ('s1000001-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Corte con diseño', 45, 35000),
  ('s1000001-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Alisado capilar', 60, 50000),
  ('s1000001-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tinte de cabello', 60, 45000)
on conflict do nothing;

-- Availability (Mon-Sat, 9am-7pm for all barbers)
insert into public.availability (barber_id, day_of_week, start_time, end_time) values
  -- Carlos (Mon-Sat)
  ('b1000001-0000-0000-0000-000000000001', 1, '09:00', '19:00'),
  ('b1000001-0000-0000-0000-000000000001', 2, '09:00', '19:00'),
  ('b1000001-0000-0000-0000-000000000001', 3, '09:00', '19:00'),
  ('b1000001-0000-0000-0000-000000000001', 4, '09:00', '19:00'),
  ('b1000001-0000-0000-0000-000000000001', 5, '09:00', '19:00'),
  ('b1000001-0000-0000-0000-000000000001', 6, '09:00', '15:00'),
  -- Miguel (Mon-Fri)
  ('b1000001-0000-0000-0000-000000000002', 1, '10:00', '20:00'),
  ('b1000001-0000-0000-0000-000000000002', 2, '10:00', '20:00'),
  ('b1000001-0000-0000-0000-000000000002', 3, '10:00', '20:00'),
  ('b1000001-0000-0000-0000-000000000002', 4, '10:00', '20:00'),
  ('b1000001-0000-0000-0000-000000000002', 5, '10:00', '20:00'),
  -- Andrés (Tue-Sat)
  ('b1000001-0000-0000-0000-000000000003', 2, '08:00', '18:00'),
  ('b1000001-0000-0000-0000-000000000003', 3, '08:00', '18:00'),
  ('b1000001-0000-0000-0000-000000000003', 4, '08:00', '18:00'),
  ('b1000001-0000-0000-0000-000000000003', 5, '08:00', '18:00'),
  ('b1000001-0000-0000-0000-000000000003', 6, '08:00', '14:00')
on conflict do nothing;
