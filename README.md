# Roxier Fidelity

Plataforma de tarjetas de lealtad digitales — un servicio de **Roxier Co.**

Tus clientes (negocios) se registran, pagan su mensualidad con Mercado Pago,
y desde su panel crean tarjetas de lealtad que sus clientes guardan en
Apple Wallet y Google Wallet con un código QR.

---

## ¿Qué incluye este proyecto?

- **Landing pública** en `/fidelity`
- **Registro e inicio de sesión** para tus clientes (los negocios)
- **Dashboard** con métricas, editor de tarjetas, clientes, promociones y notificaciones
- **Cobro mensual** con Mercado Pago
- **Panel de súper admin** donde TÚ ves todos tus clientes
- **Seguridad** lista para producción (RLS, validación, cabeceras HTTP)

> Apple Wallet y Google Wallet se conectan en una fase posterior. La base
> de datos ya está preparada para guardar esos pases.

---

## Tecnologías

| Herramienta   | Para qué sirve                          |
|---------------|------------------------------------------|
| Next.js 15    | El framework (frontend + backend)        |
| TypeScript    | Código seguro                            |
| Tailwind CSS  | Estilos con el branding Roxier           |
| Supabase      | Base de datos + sistema de login         |
| Mercado Pago  | Cobro mensual automático                 |
| Vercel        | Donde vive la app en internet            |

---

## Guías paso a paso

Lee los documentos en la carpeta `docs/` **en este orden**:

1. **`docs/01-INSTALACION.md`** — Preparar tu computadora y abrir el proyecto
2. **`docs/02-SUPABASE.md`** — Crear la base de datos
3. **`docs/03-MERCADOPAGO.md`** — Configurar los cobros
4. **`docs/04-GITHUB-Y-VERCEL.md`** — Subir y publicar la app en internet
5. **`docs/05-ARQUITECTURA.md`** — Cómo está organizado todo (referencia)
6. **`docs/06-SEGURIDAD.md`** — Qué protege la plataforma

---

## Arranque rápido (para quien ya sabe)

```bash
npm install
cp .env.example .env.local   # y llena las variables
npm run dev                  # abre http://localhost:3000
```

---

© Roxier Co.
