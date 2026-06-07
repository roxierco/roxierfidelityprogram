# 04 — Subir a GitHub y publicar en Vercel

Aquí ponemos la aplicación **en internet** para que tus clientes la usen.
Son dos pasos: guardar el código en GitHub, y conectarlo a Vercel.

---

## PARTE A — Subir el código a GitHub

GitHub es como un "Google Drive" para código. Guarda tu proyecto y permite
que Vercel lo lea.

### Paso 1: Crear cuenta de GitHub

1. Entra a **https://github.com** y regístrate (gratis)

### Paso 2: Instalar GitHub Desktop (lo más fácil sin terminal)

1. Descarga **https://desktop.github.com**
2. Instálalo y entra con tu cuenta de GitHub

### Paso 3: Subir el proyecto

1. En GitHub Desktop, ve a **File → Add Local Repository**
2. Selecciona tu carpeta `roxier-fidelity`
3. Si te dice que no es un repositorio, dale a **"create a repository"**
4. Deja los valores por defecto y dale **"Create Repository"**
5. Escribe un resumen (ej: "Primera versión") y dale **"Commit to main"**
6. Arriba, dale a **"Publish repository"**
7. **IMPORTANTE:** marca la casilla **"Keep this code private"**
   (tu código no debe ser público)
8. Dale a **"Publish Repository"**

> El archivo `.env.local` con tus secretos **NO se sube** — ya está
> configurado para ser ignorado. Esto es correcto y seguro.

---

## PARTE B — Publicar en Vercel

Vercel toma tu código de GitHub y lo pone en internet, gratis para empezar.

### Paso 1: Crear cuenta de Vercel

1. Entra a **https://vercel.com**
2. Regístrate **con tu cuenta de GitHub** (dale "Continue with GitHub")

### Paso 2: Importar el proyecto

1. En Vercel, dale a **"Add New..." → "Project"**
2. Busca tu repositorio `roxier-fidelity` y dale **"Import"**
3. Vercel detecta que es Next.js automáticamente — no cambies la configuración

### Paso 3: Poner las variables de entorno

Antes de dale a "Deploy", busca la sección **"Environment Variables"**.
Aquí van TODAS las variables de tu `.env.local`, una por una:

| Name (nombre)                         | Value (valor)                        |
|---------------------------------------|---------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`            | (tu URL de Supabase)                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`       | (tu anon key)                         |
| `SUPABASE_SERVICE_ROLE_KEY`           | (tu service role key)                 |
| `MERCADOPAGO_ACCESS_TOKEN`            | (tu access token)                     |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`  | (tu public key)                       |
| `MERCADOPAGO_WEBHOOK_SECRET`          | (tu secreto de webhook)               |
| `NEXT_PUBLIC_APP_URL`                 | `https://roxierco.com`                |

### Paso 4: Desplegar

1. Dale a **"Deploy"**
2. Espera 1–2 minutos
3. ¡Vercel te dará una URL! (algo como `roxier-fidelity.vercel.app`)
4. Ábrela y verás tu app **en vivo en internet**

---

## PARTE C — Conectar a roxierco.com/fidelity

Tu app vive en `vercel.app`, pero la quieres en `roxierco.com/fidelity`.
Hay dos formas según cómo esté hecho tu sitio actual:

### Si roxierco.com también está en Vercel
1. En el proyecto de Vercel, ve a **Settings → Domains**
2. Agrega `roxierco.com`
3. Usa una configuración de **rewrites** para que `/fidelity` apunte aquí
   (te puedo ayudar con esto cuando llegues a este punto)

### Si roxierco.com está en otro lugar (WordPress, Wix, etc.)
La forma más simple es usar un subdominio: **`fidelity.roxierco.com`**
1. En Vercel → Settings → Domains, agrega `fidelity.roxierco.com`
2. Vercel te dirá qué registro DNS agregar en tu proveedor de dominio
3. Sigue esas instrucciones (es copiar y pegar un valor)

> Cuéntame en qué está hecho tu sitio actual y te doy los pasos exactos.

---

## Cada vez que cambies algo

1. Haces el cambio en tu computadora
2. En GitHub Desktop: escribes un resumen y das "Commit" → "Push"
3. Vercel **automáticamente** actualiza la app en internet en ~1 minuto

¡Así de fácil!

---

**Siguiente (referencia):** `docs/05-ARQUITECTURA.md` y `docs/06-SEGURIDAD.md`
