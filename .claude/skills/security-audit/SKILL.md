---
name: security-audit
description: Úsala cuando el usuario pida revisar, endurecer o auditar la seguridad de un proyecto Next.js + Supabase + Vercel (Roxier Fidelity, Roxier ERP o SaaS multi-tenant similar). Dispara con frases como "revisa la seguridad", "que no me hackeen", "harden this", "security audit", "políticas RLS", "checa vulnerabilidades", o antes de un deploy a producción. Cubre RLS, rutas API, secretos, headers, auth, dependencias y webhooks — y entrega una lista priorizada de arreglos, no solo un reporte.
---

# Auditoría de seguridad — Next.js + Supabase + Vercel (SaaS multi-tenant)

SaaS multi-tenant (negocios / tenants) en Next.js 15 (App Router), Supabase (Postgres + Auth), desplegado en Vercel, con pnpm.

**No entregues un reporte teórico.** El objetivo es encontrar problemas reales en ESTE código, priorizarlos y arreglar los críticos — con permiso explícito para cambios que toquen producción.

## Contexto real de Roxier Fidelity (verificar, no asumir)

- El SQL **no** está en `supabase/migrations/`: son archivos sueltos en `supabase/*.sql` que el usuario corre a mano en el SQL Editor. Léelos todos.
- Multi-tenant por `businesses.owner_id = auth.uid()`. Los clientes finales viven en `end_customers` y **no** tienen login: su tarjeta es pública por diseño (la abren desde un QR).
- Ya existe `src/lib/rate-limit.ts` — revisa dónde se aplica y dónde falta.
- Dinero: `apply_cashback` / `redeem_cashback` (RPC `security definer`, con `FOR UPDATE` e idempotencia).
- Hay rutas públicas a propósito: `/c/[slug]` (registro del cliente), `/api/enroll`, `/api/apple-wallet/*`. No las marques como fuga sin entender el diseño.

## Proceso

1. **Mapea antes de opinar.** Lee `package.json`, la estructura de `src/app/`, todos los `supabase/*.sql` y `src/middleware.ts`.
2. Corre los checks de las 7 categorías, en el orden de abajo.
3. Clasifica cada hallazgo: **CRÍTICO** (explotable hoy) / **IMPORTANTE** / **MEJORA**.
4. **Entrega la tabla priorizada antes de tocar código.** Pregunta si arreglas los críticos o solo reportas.
5. **Nunca pegues secretos reales** en el output, ni parcialmente. Refiérete a ellos como "la API key de X".

## 1. Row Level Security — lo más crítico en multi-tenant

- Lista TODAS las tablas y confirma `enable row level security` en cada una, incluidas las de auditoría (`wallet_events`, `visits`, `cashback_transactions`, `sucursales`, `apple_wallet_registrations`, `push_subscriptions`).
- Cada policy debe filtrar por el dueño real (`business_id in (select id from businesses where owner_id = auth.uid())`) y no depender de nada que el cliente pueda falsificar.
- Banderas rojas: `using (true)`, INSERT/UPDATE sin `with check`, tablas nuevas sin policy.
- La `service_role` key jamás debe llegar al cliente:
  `grep -rn "SERVICE_ROLE" src/ | grep -v "supabase/admin"` — solo debe aparecer en código server-only.
- Ojo con las funciones `security definer`: saltan RLS por diseño. Confirma que validan pertenencia **dentro** de la función y que quien las llama ya verificó al dueño.

## 2. Rutas API / Server Actions

- Todo input externo validado con Zod antes de tocar la base. Revisa especialmente las rutas que reciben `businessId` o `customerId` del cliente.
- **Regla de oro del proyecto:** recibir un `businessId` del body no prueba nada — hay que confirmar `owner_id = user.id` con el admin client antes de escribir.
- Rate limiting en: login, registro, enroll, sellado, cashback y webhooks. Si falta, propón dónde.
- Todo endpoint que mueva dinero/puntos debe ser idempotente (`idempotency_key`).
- Cero autorización solo en frontend: si el botón se esconde en la UI, el endpoint igual debe rechazar.

## 3. Webhooks

- Verifica firma antes de procesar: Mercado Pago (`MP_WEBHOOK_SECRET`, HMAC) y Apple Wallet (token de autenticación del pase).
- Si el secret no está configurado y el código "deja pasar" — eso es CRÍTICO en producción.
- Responder 200 para no provocar reintentos está bien, pero nunca antes de validar.

## 4. Secretos y variables de entorno

- `.env*` en `.gitignore` y sin secretos en el historial:
  `git log -p --all -- .env.local | head -50` (muestreo).
- Si aparece un secreto commiteado: **rotarlo**, no basta con borrarlo del archivo.
- Variables separadas por ambiente en Vercel (prod / preview / dev).
- Certificado APNs, llave privada de Google Wallet y `SUPABASE_SERVICE_ROLE_KEY`: solo server-side, nunca con prefijo `NEXT_PUBLIC_`.
- Revisa que no queden claves de ejemplo (`re_place...`, `ejemplo.com`) que hagan fallar cosas en silencio.

## 5. Headers de seguridad (`next.config.ts`)

Ya existen HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN` y `Permissions-Policy`. Revisa:

- **Falta CSP.** Propón una acotada a los dominios reales: Supabase (`*.supabase.co`), Mercado Pago, Google Wallet, y `blob:`/`data:` para el escáner de cámara.
- Introduce el CSP primero en `Content-Security-Policy-Report-Only` — un CSP mal armado rompe el escáner QR y las imágenes de los pases.
- `X-Frame-Options: SAMEORIGIN` es correcto solo si algo se embebe; si no, `DENY`.

## 6. Autenticación

- La confirmación por correo está **apagada** a propósito (decisión de negocio para no perder registros de anuncios). No lo marques como falla; sí verifica que exista otra vía de recuperación.
- Política mínima de contraseña activa en Supabase Auth.
- Expiración de sesión razonable.
- Rate limit y expiración de token en reset de contraseña y magic link (riesgo de account takeover).
- MFA para cuentas admin (`admin_users`).

## 7. Dependencias / cadena de suministro

- **Falta `.npmrc`** con `minimum-release-age` e `ignore-scripts=true` → CRÍTICO según las reglas del proyecto. Proponerlo con su justificación.
- `pnpm audit`: reporta solo severidad alta/crítica o con exploit conocido. Distingue lo que viene de dependencias transitivas (ej. `mercadopago > uuid`) de lo que sí puedes arreglar.
- Antes de agregar cualquier dependencia: `pnpm audit` y justificarla (regla del `CLAUDE.md`).

## Formato de entrega

Tabla: `Categoría | Hallazgo | Severidad | Archivo:línea | Fix sugerido`

Después de la tabla, pregunta explícitamente: **"¿Arreglo los críticos ahora?"**

No toques RLS ni el schema sin confirmación: una policy mal hecha **bloquea a usuarios legítimos** y el usuario tendría que correr SQL a mano para revertirlo.
