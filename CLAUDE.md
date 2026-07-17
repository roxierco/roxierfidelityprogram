# Roxier Fidelity — Notas para Claude Code

## Paquetes
- **Solo pnpm.** Nunca npm ni yarn. Corre `pnpm audit` antes de agregar dependencias.
- No agregues dependencias sin justificarlo.

## Modelo de datos (importante)
- `businesses` = negocios (tenants). `owner_id` los vincula al usuario de Supabase Auth.
- `loyalty_cards` = **diseño** de tarjeta por negocio (color, tipo, config). Tiene `card_type`.
- `end_customers` = los clientes reales. Aquí vive el estado por-cliente: `current_stamps`,
  `rewards_redeemed`, `cashback_balance`.
- El QR del cliente codifica `/c/{slug}/u/{customerId}?card={cardId}`.
- `wallet_events` = auditoría (columnas: `serial_number`, `event_type`, `detail` jsonb).
  El serial de Apple Wallet es `{customerId}-{cardId}`.

## Cashback — reglas no negociables
- **Dinero SIEMPRE en `numeric(10,2)`.** Prohibido `float`/`double` para saldos o montos.
- **Toda mutación de saldo pasa SOLO por las funciones RPC** `apply_cashback` y `redeem_cashback`.
  Nunca un `update` directo a `end_customers.cashback_balance` desde el cliente ni desde el API route.
- **Toda operación de escritura lleva `idempotency_key` única** para evitar doble cobro por
  reintentos de red o doble tap.
- **El empleado captura el MONTO DE LA COMPRA**, nunca el monto de cashback. El % lo aplica el servidor.
- **Google Wallet maneja dinero en micros** (×1,000,000): $85.50 = 85_500_000. Apple usa `value`
  numérico + `currencyCode: "MXN"`.
- **El saldo nunca puede quedar negativo** (constraint `>= 0`).
- **Concurrencia protegida con `SELECT ... FOR UPDATE`** dentro de las funciones RPC.
- La config de cashback (%, mínimo, tope, vigencia) vive en `loyalty_cards`, no en una tabla aparte,
  porque `card_type` ya es por-tarjeta.
- El SQL del módulo está en `supabase/cashback.sql` — se corre a mano en el SQL Editor de Supabase.
