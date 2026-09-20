# Cómo comprar el dominio en Cloudflare — paso a paso

> Para `entrevelas.com` (~$10.44 USD ≈ $200 MXN al año). Tú haces la compra con tu tarjeta;
> yo no hago pagos. Cuando termines, me avisas y dejo el sitio conectado.

---

## Antes de empezar
- Ten a la mano: un **correo**, una **tarjeta** (débito o crédito) y unos 10 minutos.
- Datos de contacto para el registro (los pide ICANN, es obligatorio): **nombre, dirección, teléfono, correo**.
  La privacidad WHOIS es **gratis** en Cloudflare, así que esos datos no quedan públicos.

---

## Paso 1 — Crear cuenta en Cloudflare (si no tienes)
1. Entra a **https://dash.cloudflare.com/sign-up**
2. Escribe tu correo y una contraseña → **Sign Up**.
3. Abre tu correo y da clic en el enlace de verificación que te manda Cloudflare.

## Paso 2 — Ir a registro de dominios
1. Ya dentro del panel, en el menú de la izquierda busca **“Domain Registration”** (Registro de dominios).
2. Da clic en **“Register Domains”** (Registrar dominios).

## Paso 3 — Buscar y elegir el dominio
1. En el buscador escribe **entrevelas.com** y presiona Enter.
2. Si aparece **disponible** (con su precio ~$10.44/año), da clic en **Purchase / Add to cart**.
   - Si `entrevelas.com` estuviera ocupado, prueba variantes: `entrevelasmx.com`, `velasentrevelas.com`, `entre-velas.com`.
3. Continúa a **Checkout** (Pagar).

## Paso 4 — Datos de contacto
1. Llena el formulario de **Registrant / Contact** con nombre, dirección, teléfono y correo.
2. Verás que la **privacidad WHOIS** viene incluida gratis (no hay que pagar extra).

## Paso 5 — Pago y renovación automática
1. Ingresa los datos de tu **tarjeta**.
2. **Activa “Auto-renew”** (renovación automática). ✅ Muy importante: así el dominio **no se te vence**
   por olvido (si se vence, alguien más lo puede tomar).
3. Confirma la compra.

> Listo: el dominio queda en tu cuenta y ya usa los servidores DNS de Cloudflare automáticamente.

---

## Paso 6 — Agregar los registros DNS (para que apunte al sitio)
Dentro de Cloudflare, entra a tu dominio → pestaña **DNS** → **Add record**, y agrega estos dos:

| Type | Name | Target / Content | Proxy status |
|---|---|---|---|
| CNAME | `@` | `marianomgl.github.io` | **DNS only** (nube gris, no naranja) |
| CNAME | `www` | `marianomgl.github.io` | **DNS only** (nube gris) |

- Cloudflare permite el CNAME en `@` (raíz) gracias a “CNAME flattening”, así no necesitas los registros A/AAAA.
- **Importante:** deja la nubecita en **gris (DNS only)**, no naranja, para que GitHub pueda emitir su
  candado de seguridad (HTTPS) sin conflictos.

*(Este paso también te lo puedo hacer yo si me das acceso, o te guío en vivo; es rápido.)*

---

## Paso 7 — Avísame y yo termino
Cuando ya lo compraste, mándame por chat **solo el nombre del dominio** (ej. “ya quedó entrevelas.com”).
Con eso yo:
1. Cambio 2 líneas en el código (`base: '/'` + archivo `CNAME`) y hago push.
2. Te digo qué activar en GitHub (Settings → Pages → Custom domain + Enforce HTTPS).
3. En unos minutos/horas (propagación DNS) el sitio abrirá en `https://entrevelas.com`.

> ⚠️ **Seguridad:** nunca me compartas tu **contraseña de Cloudflare ni los datos de tu tarjeta**.
> No los necesito. Solo el nombre del dominio.

---

## Costo recurrente
- Dominio: **~$200 MXN/año** (renovación al costo en Cloudflare).
- Hosting del sitio: **$0** (sigue gratis en GitHub Pages).
