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

## Notificaciones de Wallet — reglas no negociables

Los dos wallets notifican de formas **completamente distintas**. Confundirlos es el error
que ya rompió las promociones una vez (commit `0ea7b96`, arreglado en `de37e66`).

### Apple Wallet — notifica por CAMBIO DE VALOR, no por mensaje
- Apple **no permite mandar mensajes libres**. El push de APNs va con payload vacío `{}` y
  solo despierta al iPhone; si el payload trae `aps.alert`, PassKit lo ignora y nunca
  actualiza el pase.
- El iPhone descarga el pase nuevo y **solo muestra una notificación si cambió el valor de
  un campo que YA existía**, y ese campo tiene `changeMessage`.
- **Por eso el campo de promo (`promoBackField` en `src/lib/apple-wallet.ts`) va SIEMPRE
  presente, incluso sin promo, con un texto por defecto.** Si se omite mientras no hay
  promo, la primera promoción es un campo *nuevo* y no un cambio de valor → el pase se
  actualiza en silencio y el aviso nunca aparece. No quites ese valor por defecto.
- El texto de la promo vive en `businesses.latest_promo_text`, no en el push.

### Google Wallet — sí notifica por mensaje
- Usa `addMessage` sobre el `loyaltyObject`: el texto viaja en la petición.
- **`walletFetch` NO lanza excepción cuando Google responde error**, devuelve
  `{ ok, status }`. Que la promesa se resuelva NO significa que se envió: hay que mirar
  `ok`, o un 404/403 se cuenta como éxito.

### Reglas comunes
- **Todo envío se cuenta por canal y se registra en `wallet_events`** (`promo_push_sent` /
  `promo_push_failed`, con `detail.canal`). Nunca `.catch(() => null)` en un envío: un fallo
  silencioso aquí es invisible durante meses.
- **El panel nunca debe reportar éxito sin haberlo verificado.** El endpoint devuelve el
  desglose real por canal; si no salió nada, se le dice al negocio.
- Las consultas de registros de Wallet **se filtran por el negocio**, nunca se traen todas
  para filtrar en JS: Supabase corta en ~1000 filas y los clientes de más se quedan sin aviso.
