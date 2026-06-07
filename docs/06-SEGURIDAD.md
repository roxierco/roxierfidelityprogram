# 06 — Seguridad

Estas son las protecciones que ya están construidas en la plataforma.
Te explico cada una en lenguaje simple para que sepas qué te protege.

---

## 1. Aislamiento entre clientes (RLS)

**El riesgo más grave** en una plataforma como esta sería que un negocio
pudiera ver los datos de otro negocio. Esto está bloqueado a nivel de
base de datos con **Row Level Security (RLS)**.

Cada negocio solo puede leer y escribir SUS propias filas. Aunque alguien
intentara hacer trampa desde el navegador, la base de datos misma rechaza
el acceso. Tú (admin) sí puedes ver todo, gracias a una función especial
llamada `is_admin()`.

---

## 2. Contraseñas y sesiones

- Las contraseñas las maneja Supabase, que las guarda **encriptadas**.
  Nosotros nunca las vemos ni las guardamos en texto plano.
- Las sesiones se validan en cada petición con `getUser()`, que verifica
  el token contra el servidor de Supabase (no se puede falsificar).

---

## 3. Secretos protegidos

- Las llaves secretas (Supabase service role, Mercado Pago) viven solo en
  el **servidor**, nunca en el navegador.
- El archivo `.env.local` está en `.gitignore`: **nunca se sube a GitHub**.
- En Vercel, las variables se guardan encriptadas.

---

## 4. Validación de datos

Todo lo que un usuario escribe (formularios de registro, login) se valida
con **Zod** antes de tocar la base de datos. Esto previene datos basura y
varios tipos de ataque por entrada maliciosa.

---

## 5. Webhook de pagos verificado

Cuando Mercado Pago avisa de un pago, verificamos una **firma criptográfica**
para asegurarnos de que el aviso viene realmente de Mercado Pago y no de un
atacante intentando activar cuentas sin pagar.

---

## 6. Cabeceras de seguridad HTTP

La app envía cabeceras que protegen contra ataques comunes:

- **X-Frame-Options:** impide que tu app se inserte en sitios falsos (clickjacking)
- **X-Content-Type-Options:** evita engaños con tipos de archivo
- **Strict-Transport-Security:** fuerza conexiones seguras (HTTPS)
- **Referrer-Policy:** limita la información que se filtra a otros sitios

Están en `next.config.ts`.

---

## Buenas prácticas para ti

1. **Nunca compartas** tu archivo `.env.local` ni tus llaves
2. Usa una **contraseña fuerte** para tu cuenta de Supabase y de admin
3. Activa la **verificación en dos pasos** en GitHub, Vercel y Supabase
4. Empieza con credenciales de **PRUEBA** de Mercado Pago; cambia a
   producción solo cuando todo funcione
5. Antes de cobrar dinero real, **prueba el flujo completo** con un
   negocio de mentira

---

## Lo que falta (próximas fases)

- **Confirmación de correo** al registrarse (recomendado activar en Supabase)
- **Límite de intentos** de login (rate limiting) — se agrega fácil después
- **Apple/Google Wallet** — la base ya está lista, falta conectar certificados

---

Si tienes dudas de seguridad en cualquier punto, pregúntame antes de
salir a producción.
