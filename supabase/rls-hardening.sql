-- ============================================================
--  ROXIER FIDELITY — Endurecimiento de RLS
--  Corre TODO este archivo en Supabase → SQL Editor → Run.
--  Es idempotente y seguro: puedes correrlo varias veces.
-- ============================================================
--
--  Estas tres tablas solo las usa el SERVIDOR (con el service_role key,
--  que salta RLS por diseño). Ningún código del cliente las lee ni escribe.
--  Por eso la protección correcta es: RLS activo y SIN políticas públicas
--  → nadie que no sea el servidor puede tocarlas (denegación por defecto).
--
--  En tu base de producción esto ya estaba activo (se verificó en la
--  auditoría). Este archivo deja el estado documentado y reproducible por
--  si algún día recreas la base desde cero.
-- ============================================================

alter table if exists public.wallet_events              enable row level security;
alter table if exists public.apple_wallet_registrations enable row level security;
alter table if exists public.push_subscriptions         enable row level security;

-- No se crean políticas a propósito: sin política, RLS niega TODO acceso a
-- los roles anon y authenticated. El servidor entra con service_role, que
-- ignora RLS, así que la app sigue funcionando igual.

-- ── Verificación ────────────────────────────────────────────
-- Corre esto aparte para confirmar que RLS quedó activo en TODAS las tablas.
-- Cualquier fila con 'SIN RLS' hay que revisarla.
--
--   select tablename,
--          case when rowsecurity then 'OK' else 'SIN RLS' end as estado
--   from pg_tables
--   where schemaname = 'public'
--   order by rowsecurity, tablename;
-- ============================================================
