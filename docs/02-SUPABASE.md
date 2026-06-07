# 02 — Configurar Supabase (la base de datos)

Supabase guarda toda la información: tus clientes, sus tarjetas, sus
clientes finales, los pagos. También maneja los inicios de sesión.
Tiene un plan **gratuito** suficiente para arrancar.

---

## Paso 1: Crear tu cuenta

1. Entra a **https://supabase.com**
2. Dale a **"Start your project"** y regístrate (puedes usar tu cuenta de GitHub)

---

## Paso 2: Crear el proyecto

1. Dale a **"New Project"**
2. Llena:
   - **Name:** `roxier-fidelity`
   - **Database Password:** crea una contraseña fuerte y **GUÁRDALA** en un lugar seguro
   - **Region:** elige la más cercana a México (ej: "East US" o "West US")
3. Dale a **"Create new project"** y espera ~2 minutos mientras se prepara

---

## Paso 3: Crear las tablas (la estructura de datos)

1. En el menú izquierdo, busca **"SQL Editor"**
2. Dale a **"+ New query"**
3. Abre el archivo `supabase/schema.sql` de tu proyecto
4. **Copia TODO** su contenido y pégalo en el editor de Supabase
5. Dale al botón **"Run"** (abajo a la derecha)
6. Debe decir **"Success"**. ¡Listo! Ya tienes todas las tablas.

---

## Paso 4: Conseguir tus llaves

1. En el menú izquierdo, ve a **"Project Settings"** (el engrane)
2. Entra a la sección **"API"**
3. Verás varios valores. Copia estos tres a tu archivo `.env.local`:

   | En Supabase dice...        | Pégalo en `.env.local` como...      |
   |----------------------------|--------------------------------------|
   | Project URL                | `NEXT_PUBLIC_SUPABASE_URL`           |
   | anon / public (key)        | `NEXT_PUBLIC_SUPABASE_ANON_KEY`      |
   | service_role (secret key)  | `SUPABASE_SERVICE_ROLE_KEY`          |

> La llave **service_role** es muy poderosa. Trátala como una contraseña.
> Nunca la compartas.

---

## Paso 5: Configurar el login por correo

1. En el menú, ve a **"Authentication"** → **"Sign In / Providers"**
2. Asegúrate de que **"Email"** esté activado
3. Para empezar a probar más rápido, puedes desactivar "Confirm email"
   (en Authentication → Providers → Email). En producción es mejor dejarlo activo.

---

## Paso 6: Convertirte en súper admin

Para que TÚ puedas ver el panel de admin con todos tus clientes:

1. Primero, **regístrate normalmente** en la app (cuando la tengas corriendo)
   con tu correo personal, como si fueras un negocio.
2. Luego, en Supabase ve a **"SQL Editor"** → "New query" y corre esto
   (reemplaza el correo por el tuyo):

   ```sql
   insert into public.admin_users (id, full_name)
   select id, 'Tu Nombre'
   from auth.users
   where email = 'tucorreo@ejemplo.com';
   ```

3. Ahora puedes entrar a `/fidelity/admin` y verás el panel de administrador.

---

**Siguiente:** abre `docs/03-MERCADOPAGO.md`
