-- ============================================================
--  ROXIER FIDELITY — Módulo de SUCURSALES (multi-ubicación)
--  Ejecuta TODO este archivo en Supabase → SQL Editor → Run.
--  Es idempotente: puedes correrlo varias veces sin romper nada.
-- ============================================================
--
--  El cliente NO pertenece a una sucursal: su tarjeta es única y
--  acumula en cualquiera. La sucursal se guarda en cada VISITA
--  (la determina el escáner que registra), solo para estadísticas.
-- ============================================================

-- 1. Tabla de sucursales -----------------------------------------------
create table if not exists public.sucursales (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  name         text not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists idx_sucursales_business on public.sucursales(business_id);

-- 2. Marcar la sucursal en cada visita y movimiento de cashback --------
alter table public.visits
  add column if not exists sucursal_id uuid references public.sucursales(id) on delete set null;

alter table public.cashback_transactions
  add column if not exists sucursal_id uuid references public.sucursales(id) on delete set null;

-- 3. RLS: el negocio solo ve/gestiona sus propias sucursales -----------
alter table public.sucursales enable row level security;

drop policy if exists "sucursales del negocio" on public.sucursales;
create policy "sucursales del negocio" on public.sucursales
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
    or public.is_admin()
  );

-- ============================================================
--  FIN — Módulo de Sucursales
-- ============================================================
