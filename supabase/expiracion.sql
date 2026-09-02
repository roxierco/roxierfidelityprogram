-- Ejecuta esto en el SQL Editor de Supabase
-- Fecha de expiración de las tarjetas de lealtad
--
-- Dos formas de caducar, excluyentes entre sí:
--   'dias'  → vence N días DESPUÉS de que cada cliente se registra.
--             Cada cliente tiene su propia fecha (el que entró ayer y el que
--             entró hace un mes no vencen el mismo día).
--   'fecha'  → todos vencen el mismo día. Sirve para campañas de temporada.

alter table public.loyalty_cards
  add column if not exists expiration_enabled boolean not null default false,
  add column if not exists expiration_type    text,
  add column if not exists expiration_days    integer,
  add column if not exists expiration_date    date;

-- El tipo solo puede ser uno de los dos
alter table public.loyalty_cards
  drop constraint if exists loyalty_cards_expiration_type_check;
alter table public.loyalty_cards
  add constraint loyalty_cards_expiration_type_check
  check (expiration_type is null or expiration_type in ('dias', 'fecha'));

-- Los días tienen que ser positivos
alter table public.loyalty_cards
  drop constraint if exists loyalty_cards_expiration_days_check;
alter table public.loyalty_cards
  add constraint loyalty_cards_expiration_days_check
  check (expiration_days is null or expiration_days > 0);

-- Si la expiración está encendida, tiene que haber un valor coherente.
-- Evita tarjetas que dicen "caduca" pero no saben cuándo.
alter table public.loyalty_cards
  drop constraint if exists loyalty_cards_expiration_coherente;
alter table public.loyalty_cards
  add constraint loyalty_cards_expiration_coherente
  check (
    expiration_enabled = false
    or (expiration_type = 'dias'  and expiration_days is not null)
    or (expiration_type = 'fecha' and expiration_date is not null)
  );

comment on column public.loyalty_cards.expiration_enabled is
  'Si la tarjeta caduca. Cuando es false, los otros tres campos se ignoran.';
comment on column public.loyalty_cards.expiration_type is
  'dias = N días desde que el cliente se registra (por-cliente). fecha = mismo día para todos.';
