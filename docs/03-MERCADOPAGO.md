# 03 — Configurar Mercado Pago (los cobros)

Mercado Pago cobra automáticamente la mensualidad a la tarjeta de cada
negocio que se registra. Empezamos con credenciales de **PRUEBA** (no cobran
dinero real) y al final cambiamos a las de producción.

---

## Paso 1: Crear tu cuenta de desarrollador

1. Entra a **https://www.mercadopago.com.mx/developers**
2. Inicia sesión con tu cuenta de Mercado Pago (o crea una)
3. Ve a **"Tus integraciones"** → **"Crear aplicación"**
4. Llena:
   - **Nombre:** `Roxier Fidelity`
   - **¿Qué producto vas a integrar?** elige **"Suscripciones"**
5. Crea la aplicación

---

## Paso 2: Conseguir las credenciales de PRUEBA

1. Dentro de tu aplicación, ve a **"Credenciales de prueba"**
2. Copia estos valores a tu `.env.local`:

   | En Mercado Pago dice...   | Pégalo en `.env.local` como...           |
   |---------------------------|-------------------------------------------|
   | Access Token (TEST-...)   | `MERCADOPAGO_ACCESS_TOKEN`                |
   | Public Key (TEST-...)     | `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`      |

---

## Paso 3: Configurar el webhook (avisos de pago)

El webhook le avisa a tu app cuando un pago se aprueba o se cancela.

1. En tu aplicación de Mercado Pago, ve a **"Webhooks"**
2. En **URL de producción**, pon:
   ```
   https://roxierco.com/api/mercadopago/webhook
   ```
   (Mientras pruebas en tu computadora, puedes dejar esto para después
   del despliegue en Vercel.)
3. En **Eventos**, selecciona **"Suscripciones"** (`subscription_preapproval`)
4. Mercado Pago te dará una **"Clave secreta"** del webhook. Cópiala a
   `.env.local` como `MERCADOPAGO_WEBHOOK_SECRET`

---

## Paso 4: Probar un pago

Con credenciales de prueba, Mercado Pago te da **tarjetas de prueba** que no
cobran dinero real. Las encuentras en la documentación de Mercado Pago,
sección "Tarjetas de prueba". Úsalas para confirmar que el flujo de pago
funciona antes de salir a producción.

---

## Paso 5: Pasar a PRODUCCIÓN (cuando ya vas a cobrar de verdad)

1. Cuando estés listo para cobrar dinero real, vuelve a "Tus integraciones"
2. Copia las **"Credenciales de producción"** (empiezan con `APP_USR-...`
   en vez de `TEST-...`)
3. Reemplázalas en Vercel (lo verás en la guía 04)
4. Actualiza también la clave del webhook de producción

> **Tip de seguridad:** nunca pongas credenciales de producción en tu
> computadora local. Solo en Vercel, como variables de entorno protegidas.

---

**Siguiente:** abre `docs/04-GITHUB-Y-VERCEL.md`
