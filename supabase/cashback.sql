-- ============================================================
--  ROXIER FIDELITY — Módulo de CASHBACK
--  Ejecuta TODO este archivo en Supabase → SQL Editor → Run.
--  Es idempotente: puedes correrlo varias veces sin romper nada.
-- ============================================================
--
--  DECISIONES DE DISEÑO (adaptado a la estructura real del repo):
--  · El SALDO vive por-cliente en `end_customers.cashback_balance`
--    (igual que current_stamps), NO en loyalty_cards.
--  · La CONFIG de cashback (%, mínimo, tope, vigencia) vive en
--    `loyalty_cards` junto al resto del diseño de la tarjeta, porque
--    card_type ya es por-tarjeta (patrón de coupon_value / max_uses).
--  · Toda mutación de saldo pasa SOLO por apply_cashback / redeem_cashback.
--  · Dinero SIEMPRE en numeric(10,2). Nunca float.
-- ============================================================


-- 1.1  Nuevo tipo de tarjeta: 'cashback' -------------------------------
--  El check original de card_type no permite 'cashback'; lo reemplazamos.
alter table public.loyalty_cards drop constraint if exists loyalty_cards_card_type_check;
alter table public.loyalty_cards
  add constraint loyalty_cards_card_type_check
  check (card_type in ('sellos', 'cupon', 'descuento', 'cashback'));


-- 1.2  Config de cashback en la tarjeta --------------------------------
alter table public.loyalty_cards
  add column if not exists cashback_percent      numeric(5,2)  not null default 0
    check (cashback_percent >= 0 and cashback_percent <= 100),
  add column if not exists cashback_min_purchase numeric(10,2) not null default 0
    check (cashback_min_purchase >= 0),
  add column if not exists cashback_max_balance  numeric(10,2)          -- null = sin tope
    check (cashback_max_balance is null or cashback_max_balance >= 0),
  add column if not exists cashback_expires_days integer;               -- null = no expira


-- 1.3  Saldo actual del cliente ----------------------------------------
alter table public.end_customers
  add column if not exists cashback_balance numeric(10,2) not null default 0
    check (cashback_balance >= 0);


-- 1.4  Historial de movimientos (fuente de verdad) ---------------------
create table if not exists public.cashback_transactions (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.end_customers(id) on delete cascade,
  card_id          uuid          references public.loyalty_cards(id) on delete set null,
  business_id      uuid not null references public.businesses(id) on delete cascade,
  type             text not null check (type in ('earned', 'redeemed', 'expired', 'adjustment')),
  amount           numeric(10,2) not null,   -- + suma saldo, - resta saldo
  purchase_amount  numeric(10,2),            -- solo para type='earned'
  balance_after    numeric(10,2) not null,   -- snapshot del saldo tras el movimiento
  idempotency_key  text unique,              -- evita duplicados por reintentos / doble tap
  created_by       uuid,                     -- usuario (dueño/empleado) que ejecutó la acción
  created_at       timestamptz not null default now()
);

create index if not exists idx_cashback_tx_customer on public.cashback_transactions(customer_id, created_at desc);
create index if not exists idx_cashback_tx_business on public.cashback_transactions(business_id, created_at desc);


-- 1.5  FUNCIÓN: acumular cashback (atómica + idempotente) --------------
create or replace function public.apply_cashback(
  p_customer_id     uuid,
  p_card_id         uuid,
  p_business_id     uuid,
  p_purchase_amount numeric,
  p_created_by      uuid default null,
  p_idempotency_key text default null
)
returns table (new_balance numeric, transaction_id uuid, earned numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cust_business uuid;
  v_old_balance   numeric(10,2);
  v_percent       numeric(5,2);
  v_min           numeric(10,2);
  v_max           numeric(10,2);
  v_active        boolean;
  v_type          text;
  v_earned        numeric(10,2);
  v_new_balance   numeric(10,2);
  v_tx_id         uuid;
begin
  if p_purchase_amount is null or p_purchase_amount <= 0 then
    raise exception 'INVALID_PURCHASE_AMOUNT';
  end if;

  -- Idempotencia: si ya procesamos esta llave, devolvemos el resultado previo.
  if p_idempotency_key is not null then
    select ct.balance_after, ct.id, ct.amount
      into v_new_balance, v_tx_id, v_earned
    from cashback_transactions ct
    where ct.idempotency_key = p_idempotency_key;
    if found then
      return query select v_new_balance, v_tx_id, v_earned;
      return;
    end if;
  end if;

  -- Bloqueamos la fila del cliente para evitar carreras (dos ventas simultáneas).
  select ec.business_id, ec.cashback_balance
    into v_cust_business, v_old_balance
  from end_customers ec
  where ec.id = p_customer_id
  for update;

  if not found then
    raise exception 'CARD_NOT_FOUND';
  end if;

  if v_cust_business <> p_business_id then
    raise exception 'CARD_NOT_FOUND';
  end if;

  -- Config de cashback en la tarjeta.
  select lc.cashback_percent, lc.cashback_min_purchase, lc.cashback_max_balance,
         lc.is_active, lc.card_type
    into v_percent, v_min, v_max, v_active, v_type
  from loyalty_cards lc
  where lc.id = p_card_id and lc.business_id = p_business_id;

  if not found or v_active is not true or v_type <> 'cashback' then
    raise exception 'CASHBACK_NOT_ENABLED';
  end if;

  if p_purchase_amount < v_min then
    raise exception 'BELOW_MIN_PURCHASE';
  end if;

  v_earned := round(p_purchase_amount * v_percent / 100.0, 2);

  update end_customers
     set cashback_balance = least(
           cashback_balance + v_earned,
           coalesce(v_max, cashback_balance + v_earned)  -- respeta el tope si existe
         )
   where id = p_customer_id
   returning cashback_balance into v_new_balance;

  -- Lo realmente acreditado (por si el tope recortó el monto).
  v_earned := v_new_balance - v_old_balance;

  insert into cashback_transactions
    (customer_id, card_id, business_id, type, amount, purchase_amount, balance_after, idempotency_key, created_by)
  values
    (p_customer_id, p_card_id, p_business_id, 'earned', v_earned, p_purchase_amount, v_new_balance, p_idempotency_key, p_created_by)
  returning id into v_tx_id;

  return query select v_new_balance, v_tx_id, v_earned;
end;
$$;


-- 1.6  FUNCIÓN: redimir cashback (atómica + idempotente) ---------------
create or replace function public.redeem_cashback(
  p_customer_id     uuid,
  p_card_id         uuid,
  p_business_id     uuid,
  p_redeem_amount   numeric,
  p_created_by      uuid default null,
  p_idempotency_key text default null
)
returns table (new_balance numeric, transaction_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cust_business uuid;
  v_balance       numeric(10,2);
  v_new_balance   numeric(10,2);
  v_tx_id         uuid;
begin
  if p_redeem_amount is null or p_redeem_amount <= 0 then
    raise exception 'INVALID_REDEEM_AMOUNT';
  end if;

  if p_idempotency_key is not null then
    select ct.balance_after, ct.id into v_new_balance, v_tx_id
    from cashback_transactions ct
    where ct.idempotency_key = p_idempotency_key;
    if found then
      return query select v_new_balance, v_tx_id;
      return;
    end if;
  end if;

  select ec.business_id, ec.cashback_balance
    into v_cust_business, v_balance
  from end_customers ec
  where ec.id = p_customer_id
  for update;

  if not found or v_cust_business <> p_business_id then
    raise exception 'CARD_NOT_FOUND';
  end if;

  if v_balance < p_redeem_amount then
    raise exception 'INSUFFICIENT_BALANCE';
  end if;

  update end_customers
     set cashback_balance = cashback_balance - p_redeem_amount
   where id = p_customer_id
   returning cashback_balance into v_new_balance;

  insert into cashback_transactions
    (customer_id, card_id, business_id, type, amount, balance_after, idempotency_key, created_by)
  values
    (p_customer_id, p_card_id, p_business_id, 'redeemed', -p_redeem_amount, v_new_balance, p_idempotency_key, p_created_by)
  returning id into v_tx_id;

  return query select v_new_balance, v_tx_id;
end;
$$;


-- 1.7  FUNCIÓN: expirar saldo (versión simple, opcional) ---------------
--  Política simple: si la tarjeta define vigencia (cashback_expires_days)
--  y el cliente no acumula NI redime desde hace más de esa vigencia,
--  su saldo se pone en cero y se registra el movimiento 'expired'.
--  La vigencia FIFO por transacción queda para una segunda iteración.
create or replace function public.expire_cashback()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row   record;
  v_count integer := 0;
begin
  for v_row in
    select ec.id as customer_id, ec.business_id, ec.cashback_balance,
           lc.id as card_id, lc.cashback_expires_days,
           coalesce(
             (select max(ct.created_at) from cashback_transactions ct where ct.customer_id = ec.id),
             ec.enrolled_at
           ) as last_move
    from end_customers ec
    join loyalty_cards lc
      on lc.business_id = ec.business_id
     and lc.card_type = 'cashback'
     and lc.is_active
     and lc.cashback_expires_days is not null
    where ec.cashback_balance > 0
  loop
    if v_row.last_move < now() - (v_row.cashback_expires_days || ' days')::interval then
      update end_customers set cashback_balance = 0 where id = v_row.customer_id;

      insert into cashback_transactions
        (customer_id, card_id, business_id, type, amount, balance_after)
      values
        (v_row.customer_id, v_row.card_id, v_row.business_id, 'expired', -v_row.cashback_balance, 0);

      v_count := v_count + 1;
    end if;
  end loop;

  return v_count;
end;
$$;


-- 1.8  RLS -------------------------------------------------------------
alter table public.cashback_transactions enable row level security;

-- El negocio solo LEE sus propios movimientos. Las escrituras de saldo
-- se hacen SOLO vía las funciones RPC (security definer), nunca por
-- insert/update directo desde el cliente.
drop policy if exists "movimientos cashback del negocio" on public.cashback_transactions;
create policy "movimientos cashback del negocio" on public.cashback_transactions
  for select using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
    or public.is_admin()
  );

-- ============================================================
--  FIN — Módulo de Cashback
-- ============================================================
