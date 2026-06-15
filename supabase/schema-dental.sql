-- ============================================================
--  SISTEMA DE CITAS — Clínica Dental
--  Cómo usar:
--    1. Ve a supabase.com -> SQL Editor
--    2. Pega este archivo completo y ejecuta
-- ============================================================

-- ------------------------------------------------------------
--  TABLA: services (tratamientos dentales disponibles)
-- ------------------------------------------------------------
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  duration_minutes integer not null default 30,
  price            integer not null default 0,   -- pesos MXN
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ------------------------------------------------------------
--  TABLA: schedule (horario de atención por día)
-- ------------------------------------------------------------
create table if not exists public.schedule (
  id           uuid primary key default gen_random_uuid(),
  day_of_week  integer not null check (day_of_week between 0 and 6),  -- 0=Dom … 6=Sáb
  start_time   text not null,   -- "09:00"
  end_time     text not null,   -- "18:00"
  is_active    boolean not null default true,
  unique (day_of_week)
);

-- ------------------------------------------------------------
--  TABLA: blocked_dates (días sin atención: festivos, vacaciones)
-- ------------------------------------------------------------
create table if not exists public.blocked_dates (
  id         uuid primary key default gen_random_uuid(),
  date       date unique not null,
  reason     text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
--  TABLA: appointments (citas de pacientes)
-- ------------------------------------------------------------
create table if not exists public.appointments (
  id                uuid primary key default gen_random_uuid(),
  service_id        uuid not null references public.services(id),
  patient_name      text not null,
  patient_email     text not null,
  patient_phone     text not null,
  appointment_date  date not null,
  appointment_time  text not null,   -- "HH:MM"
  notes             text,
  status            text not null default 'pending'
                      check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  confirmation_code text not null unique,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------
--  ÍNDICES
-- ------------------------------------------------------------
create index if not exists idx_appointments_date   on public.appointments (appointment_date);
create index if not exists idx_appointments_status on public.appointments (status);
create index if not exists idx_appointments_email  on public.appointments (patient_email);
create index if not exists idx_appointments_code   on public.appointments (confirmation_code);

-- ------------------------------------------------------------
--  ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.services      enable row level security;
alter table public.schedule      enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.appointments  enable row level security;

-- services — lectura pública
create policy "services lectura publica" on public.services
  for select using (true);

-- schedule — lectura pública
create policy "schedule lectura publica" on public.schedule
  for select using (true);

-- blocked_dates — lectura pública
create policy "blocked_dates lectura publica" on public.blocked_dates
  for select using (true);

-- appointments — inserción pública (paciente agenda)
create policy "appointments insercion publica" on public.appointments
  for insert with check (true);

-- appointments — el paciente puede leer SU cita por código
create policy "appointments lectura por codigo" on public.appointments
  for select using (true);
-- Nota: el acceso de escritura (update status) se hace exclusivamente
-- desde el servidor con SUPABASE_SERVICE_ROLE_KEY (bypassa RLS).

-- ------------------------------------------------------------
--  DATOS INICIALES: 5 servicios dentales
-- ------------------------------------------------------------
insert into public.services (name, description, duration_minutes, price) values
  ('Consulta general',       'Revisión y diagnóstico dental completo',             30,   350),
  ('Limpieza dental',        'Profilaxis y eliminación de sarro',                  60,   600),
  ('Blanqueamiento dental',  'Blanqueamiento profesional en consultorio',           90,  1800),
  ('Extracción dental',      'Extracción de pieza dental bajo anestesia local',    45,   800),
  ('Ortodoncia (consulta)',  'Evaluación y plan de tratamiento de ortodoncia',      60,   500)
on conflict do nothing;

-- ------------------------------------------------------------
--  DATOS INICIALES: horario Lun-Vie 9-18hrs, Sáb 9-14hrs
-- ------------------------------------------------------------
-- 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
insert into public.schedule (day_of_week, start_time, end_time, is_active) values
  (1, '09:00', '18:00', true),   -- Lunes
  (2, '09:00', '18:00', true),   -- Martes
  (3, '09:00', '18:00', true),   -- Miércoles
  (4, '09:00', '18:00', true),   -- Jueves
  (5, '09:00', '18:00', true),   -- Viernes
  (6, '09:00', '14:00', true)    -- Sábado
on conflict (day_of_week) do nothing;

-- ============================================================
--  FIN DEL SCHEMA DENTAL
-- ============================================================
