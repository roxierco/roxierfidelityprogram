-- ============================================================
--  ROXIER FIDELITY — Arquitectura de Base de Datos
--  Versión 1.0
-- ============================================================
--  Cómo usar este archivo:
--  1. Entra a tu proyecto en supabase.com
--  2. Ve a "SQL Editor" en el menú izquierdo
--  3. Pega TODO este archivo y dale "Run"
--  Esto crea todas las tablas y la seguridad de la plataforma.
-- ============================================================

-- ------------------------------------------------------------
--  CONCEPTO CLAVE: Multi-tenant (multi-inquilino)
-- ------------------------------------------------------------
--  Cada "negocio" que contrata el servicio es un TENANT.
--  La regla de oro de seguridad: un negocio JAMÁS puede ver
--  los datos de otro negocio. Esto se garantiza con RLS
--  (Row Level Security) de Supabase — más abajo.
-- ------------------------------------------------------------


-- ============================================================
--  TABLA 1: businesses (los negocios — tus clientes)
-- ============================================================
create table public.businesses (
  id              uuid primary key default gen_random_uuid(),
  -- El dueño del negocio (vincula con el sistema de login de Supabase)
  owner_id        uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  slug            text unique not null,         -- identificador para URLs (ej: "cafe-la-paloma")
  email           text not null,
  phone           text,
  -- Estado de la cuenta (tú como admin puedes activar/desactivar)
  status          text not null default 'trial' check (status in ('trial', 'active', 'suspended', 'cancelled')),
  -- Plan contratado
  plan            text not null default 'basico' check (plan in ('basico', 'pro', 'empresarial')),
  monthly_price   integer not null default 500,  -- precio en pesos MXN
  trial_ends_at   timestamptz default (now() + interval '15 days'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
--  TABLA 2: loyalty_cards (diseño de tarjeta de cada negocio)
-- ============================================================
create table public.loyalty_cards (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  title           text not null default 'Tarjeta de lealtad',
  description     text,
  -- Personalización visual (el negocio la edita desde "Mis tarjetas")
  logo_url        text,
  color_primary   text not null default '#FF2E63',
  color_background text not null default '#0E0E10',
  text_color      text not null default '#F5F4F2',
  -- Mecánica de sellos: "compra X, obtén gratis"
  stamps_required integer not null default 10,
  reward_text     text not null default 'Un producto gratis',
  is_active       boolean not null default true,
  -- Personalización avanzada del fondo
  bg_type         text not null default 'solid' check (bg_type in ('solid', 'gradient', 'image')),
  color_gradient_end  text,
  gradient_direction  text,
  bg_image_url        text,
  bg_image_position   text check (bg_image_position in ('top', 'center', 'bottom', 'cover')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
--  TABLA 3: end_customers (clientes finales del negocio)
-- ============================================================
--  Estas son las personas que reciben la tarjeta en su Wallet.
create table public.end_customers (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  -- Datos que se capturan al registrarse (definidos en el brief)
  full_name       text not null,
  phone           text,
  email           text,
  birth_date      date,
  gender          text check (gender in ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
  -- Estado de la tarjeta
  current_stamps  integer not null default 0,
  total_visits    integer not null default 0,
  rewards_redeemed integer not null default 0,
  -- IDs de los pases en las wallets (se llenan en la Fase 4)
  apple_pass_serial text,
  google_pass_id  text,
  enrolled_at     timestamptz not null default now(),
  last_visit_at   timestamptz
);

-- ============================================================
--  TABLA 4: visits (registro de cada visita/sello)
-- ============================================================
create table public.visits (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  customer_id     uuid not null references public.end_customers(id) on delete cascade,
  stamps_added    integer not null default 1,
  is_redemption   boolean not null default false,  -- true si fue canje de premio
  created_at      timestamptz not null default now()
);

-- ============================================================
--  TABLA 5: promotions (promociones que crea el negocio)
-- ============================================================
create table public.promotions (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  title           text not null,
  message         text not null,
  is_active       boolean not null default true,
  starts_at       timestamptz default now(),
  ends_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- ============================================================
--  TABLA 6: push_notifications (historial de notificaciones)
-- ============================================================
create table public.push_notifications (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  title           text not null,
  message         text not null,
  recipients_count integer not null default 0,
  sent_at         timestamptz not null default now()
);

-- ============================================================
--  TABLA 7: admin_users (tú y tu equipo — súper admin)
-- ============================================================
create table public.admin_users (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null,
  created_at      timestamptz not null default now()
);

-- ============================================================
--  TABLA 8: subscriptions (control de pagos de Mercado Pago)
-- ============================================================
create table public.subscriptions (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  mercadopago_subscription_id text,
  status          text not null default 'pending' check (status in ('pending', 'authorized', 'paused', 'cancelled')),
  amount          integer not null,
  next_payment_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ============================================================
--  ÍNDICES (hacen las consultas rápidas)
-- ============================================================
create index idx_businesses_owner on public.businesses(owner_id);
create index idx_loyalty_cards_business on public.loyalty_cards(business_id);
create index idx_end_customers_business on public.end_customers(business_id);
create index idx_visits_business on public.visits(business_id);
create index idx_visits_customer on public.visits(customer_id);
create index idx_promotions_business on public.promotions(business_id);


-- ============================================================
--  SEGURIDAD: Row Level Security (RLS)
-- ============================================================
--  Esto es lo MÁS importante para la seguridad.
--  Activa RLS en todas las tablas. Sin las políticas de abajo,
--  NADIE puede leer ni escribir nada (cierre por defecto).
-- ============================================================
alter table public.businesses        enable row level security;
alter table public.loyalty_cards      enable row level security;
alter table public.end_customers      enable row level security;
alter table public.visits             enable row level security;
alter table public.promotions         enable row level security;
alter table public.push_notifications enable row level security;
alter table public.admin_users        enable row level security;
alter table public.subscriptions      enable row level security;

-- Función auxiliar: ¿el usuario actual es admin de Roxier?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
--  POLÍTICAS: businesses
-- ------------------------------------------------------------
-- Un negocio solo ve y edita SU propio registro. El admin ve todos.
create policy "negocio ve lo suyo" on public.businesses
  for select using (owner_id = auth.uid() or public.is_admin());
create policy "negocio actualiza lo suyo" on public.businesses
  for update using (owner_id = auth.uid() or public.is_admin());
create policy "crear negocio propio" on public.businesses
  for insert with check (owner_id = auth.uid());

-- ------------------------------------------------------------
--  POLÍTICAS: loyalty_cards, end_customers, visits, promotions,
--  push_notifications — todas siguen el MISMO patrón:
--  el negocio solo accede a las filas que le pertenecen.
-- ------------------------------------------------------------
create policy "tarjetas del negocio" on public.loyalty_cards
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
    or public.is_admin()
  );

create policy "clientes del negocio" on public.end_customers
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
    or public.is_admin()
  );

create policy "visitas del negocio" on public.visits
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
    or public.is_admin()
  );

create policy "promociones del negocio" on public.promotions
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
    or public.is_admin()
  );

create policy "notificaciones del negocio" on public.push_notifications
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
    or public.is_admin()
  );

create policy "suscripciones del negocio" on public.subscriptions
  for select using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
    or public.is_admin()
  );

-- ------------------------------------------------------------
--  POLÍTICAS: admin_users — solo los admin pueden verse entre sí
-- ------------------------------------------------------------
create policy "admin ve admins" on public.admin_users
  for select using (public.is_admin());


-- ============================================================
--  AUTOMATIZACIÓN: actualizar "updated_at" automáticamente
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_businesses    before update on public.businesses    for each row execute function public.touch_updated_at();
create trigger touch_loyalty_cards before update on public.loyalty_cards for each row execute function public.touch_updated_at();
create trigger touch_subscriptions before update on public.subscriptions for each row execute function public.touch_updated_at();

-- ============================================================
--  FIN DEL SCHEMA
-- ============================================================
