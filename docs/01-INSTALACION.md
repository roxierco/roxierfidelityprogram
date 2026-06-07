# 01 — Instalación en tu computadora

Esta guía te lleva desde cero hasta ver la aplicación corriendo en tu
propia computadora. No necesitas saber programar. Sigue cada paso en orden.

---

## Paso 1: Instalar Node.js

Node.js es el motor que hace funcionar la aplicación.

1. Entra a **https://nodejs.org**
2. Descarga la versión que diga **"LTS"** (la recomendada, botón grande)
3. Abre el archivo descargado y dale "Siguiente" a todo hasta terminar
4. Para confirmar que se instaló, abre la **Terminal**:
   - **Windows:** busca "PowerShell" en el menú inicio y ábrelo
   - **Mac:** busca "Terminal" con Spotlight (Cmd + Espacio)
5. Escribe esto y presiona Enter:
   ```bash
   node --version
   ```
   Si ves algo como `v20.11.0`, ¡funcionó!

---

## Paso 2: Abrir el proyecto

1. Descomprime la carpeta `roxier-fidelity` que recibiste
2. Guárdala en un lugar fácil de encontrar (ej: tu Escritorio)
3. En la Terminal, navega hasta la carpeta. Por ejemplo:
   ```bash
   cd Desktop/roxier-fidelity
   ```
   (Tip: escribe `cd ` y luego arrastra la carpeta a la Terminal — pega la ruta sola.)

---

## Paso 3: Instalar las piezas del proyecto

Dentro de la carpeta, en la Terminal, escribe:

```bash
npm install
```

Esto descarga todo lo que la app necesita. Tarda 1–2 minutos.
Verás muchas líneas de texto — es normal.

---

## Paso 4: Configurar las variables (las llaves secretas)

1. En la carpeta del proyecto, busca el archivo **`.env.example`**
2. Haz una **copia** y renómbrala a **`.env.local`**
3. Ábrela con el Bloc de notas (Windows) o TextEdit (Mac)
4. Verás varias líneas con valores de ejemplo. Las llenaremos en las
   siguientes guías (Supabase y Mercado Pago). Por ahora déjala así.

> **MUY IMPORTANTE:** el archivo `.env.local` contiene secretos.
> NUNCA lo compartas ni lo subas a internet. El proyecto ya está
> configurado para que GitHub lo ignore automáticamente.

---

## Paso 5: Encender la aplicación

Cuando termines las guías de Supabase y Mercado Pago, vuelve aquí y escribe:

```bash
npm run dev
```

Luego abre tu navegador en **http://localhost:3000**

¡Verás la aplicación corriendo en tu computadora! (Solo tú la ves por ahora.)

Para apagarla, vuelve a la Terminal y presiona **Ctrl + C**.

---

**Siguiente:** abre `docs/02-SUPABASE.md`
