# 05 — Arquitectura (cómo está organizado todo)

Este documento es una **referencia**. No necesitas memorizarlo, pero te
ayuda a entender dónde está cada cosa cuando quieras cambiar algo.

---

## Los 3 tipos de usuario

```
┌─────────────────────────────────────────────────────────┐
│  TÚ (Roxier) — Súper Admin                                │
│  Ve todos los negocios, sus planes, cuántos clientes      │
│  finales tiene cada uno. Ruta: /fidelity/admin            │
└─────────────────────────────────────────────────────────┘
            │ ofrece el servicio a...
            ▼
┌─────────────────────────────────────────────────────────┐
│  TUS CLIENTES — los Negocios (barberías, cafés...)        │
│  Tienen su propio login y dashboard. Crean su tarjeta,    │
│  ven sus métricas. Ruta: /fidelity/dashboard              │
└─────────────────────────────────────────────────────────┘
            │ dan tarjetas a...
            ▼
┌─────────────────────────────────────────────────────────┐
│  CLIENTES FINALES — la gente que visita el negocio        │
│  Guardan la tarjeta en Apple/Google Wallet con un QR.     │
│  No usan la web; solo su wallet.                          │
└─────────────────────────────────────────────────────────┘
```

---

## Mapa de carpetas

```
roxier-fidelity/
├── src/
│   ├── app/
│   │   ├── fidelity/
│   │   │   ├── page.tsx              ← Landing pública
│   │   │   ├── (auth)/               ← Login, registro y sus acciones
│   │   │   ├── dashboard/            ← Panel del negocio (tu cliente)
│   │   │   │   ├── page.tsx          ← Métricas
│   │   │   │   ├── tarjetas/         ← Editor de tarjeta
│   │   │   │   ├── clientes/         ← Lista de clientes finales
│   │   │   │   ├── promociones/
│   │   │   │   ├── notificaciones/
│   │   │   │   └── configuracion/    ← Plan y pago Mercado Pago
│   │   │   └── admin/                ← TU panel de súper admin
│   │   └── api/
│   │       └── mercadopago/          ← Cobros y webhook
│   ├── components/                   ← Piezas visuales reutilizables
│   ├── lib/                          ← Conexiones (Supabase, Mercado Pago)
│   └── types/                        ← Definiciones de datos
├── supabase/
│   └── schema.sql                    ← La estructura de la base de datos
└── docs/                             ← Estas guías
```

---

## Las tablas de la base de datos

| Tabla                | Qué guarda                                      |
|----------------------|--------------------------------------------------|
| `businesses`         | Tus clientes (los negocios)                      |
| `loyalty_cards`      | El diseño de la tarjeta de cada negocio          |
| `end_customers`      | Los clientes finales de cada negocio             |
| `visits`             | Cada visita/sello registrado                     |
| `promotions`         | Las promociones que crea cada negocio            |
| `push_notifications` | Historial de notificaciones enviadas             |
| `subscriptions`      | Control de pagos de Mercado Pago                 |
| `admin_users`        | Tú y tu equipo (acceso al panel admin)           |

---

## El flujo completo (paso a paso)

1. Un negocio entra a `roxierco.com/fidelity` y se **registra**
2. Se crea su cuenta y un registro en `businesses` con estado "trial"
3. Entra a su **dashboard**, diseña su tarjeta en "Mis tarjetas"
4. Cuando termina la prueba, **paga** con Mercado Pago en "Configuración"
5. El **webhook** de Mercado Pago confirma el pago y activa la cuenta
6. El negocio comparte su **QR**; sus clientes guardan la tarjeta en el wallet
   *(esta última parte se conecta en la Fase 4)*

---

**Siguiente:** `docs/06-SEGURIDAD.md`
