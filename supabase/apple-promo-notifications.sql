-- ============================================================
--  ROXIER FIDELITY — Promociones a Apple Wallet
--  Corre TODO este archivo en Supabase → SQL Editor → Run.
--  Es idempotente y seguro: puedes correrlo varias veces.
-- ============================================================
--
--  Apple Wallet NO permite mandar un mensaje libre a la tarjeta como Google.
--  Solo notifica cuando CAMBIA un dato del pase. Para que las promociones
--  también lleguen a la pantalla de bloqueo del iPhone, guardamos el texto de
--  la última promo en el negocio; el pase lo muestra en un campo del reverso
--  con changeMessage, así que al enviar una promo nueva (cambia el valor) el
--  iPhone recibe la notificación.
-- ============================================================

alter table public.businesses
  add column if not exists latest_promo_text text,
  add column if not exists latest_promo_at   timestamptz;
