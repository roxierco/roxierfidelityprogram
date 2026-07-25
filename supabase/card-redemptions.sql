-- ============================================================
--  ROXIER FIDELITY — Canjes por tarjeta (cupones y descuentos)
--  Corre TODO este archivo en Supabase → SQL Editor → Run.
--  Es idempotente y seguro: puedes correrlo varias veces.
-- ============================================================
--
--  PROBLEMA QUE RESUELVE:
--  `end_customers.rewards_redeemed` es UN contador por cliente, compartido
--  entre todas las tarjetas. Usarlo para saber si un CUPÓN ya se canjeó estaba
--  mal: un cliente que ya ganó premios en una tarjeta de sellos veía cualquier
--  cupón nuevo como "ya canjeado". El canje debe llevarse POR (cliente, tarjeta).
--
--  Solo la usa el SERVIDOR (service_role, que salta RLS). Ningún código del
--  cliente la lee ni escribe → RLS activo y SIN políticas públicas.
-- ============================================================

create table if not exists public.card_redemptions (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id)    on delete cascade,
  customer_id  uuid not null references public.end_customers(id) on delete cascade,
  card_id      uuid not null references public.loyalty_cards(id) on delete cascade,
  redeemed_at  timestamptz not null default now()
);

-- Consulta caliente: ¿cuántas veces canjeó este cliente esta tarjeta?
create index if not exists card_redemptions_customer_card_idx
  on public.card_redemptions (customer_id, card_id);

alter table if exists public.card_redemptions enable row level security;
-- Sin políticas a propósito: RLS niega todo a anon/authenticated.
-- El servidor entra con service_role, que ignora RLS.

-- ── Verificación ────────────────────────────────────────────
--   select tablename,
--          case when rowsecurity then 'OK' else 'SIN RLS' end as estado
--   from pg_tables where schemaname = 'public' and tablename = 'card_redemptions';
-- ============================================================
