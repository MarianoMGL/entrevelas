# Dominio propio para Entrevelas — investigación y costeo

> Investigación (sep 2026). **No se ha comprado nada.** Requiere tu confirmación.
> Tipo de cambio usado: ~$19 MXN/USD (aproximado, verificar al pagar).

Hoy el sitio vive en `https://marianomgl.github.io/entrevelas/` (gratis). Un dominio propio
le da una dirección más corta y profesional, p. ej. `https://entrevelas.com`.

---

## 1. Opciones de nombre y extensión

| Opción | Vibe | Costo aprox. RENOVACIÓN / año | Notas |
|---|---|---|---|
| **entrevelas.com** | Estándar, internacional | **~$190–210 MXN** (en Cloudflare, al costo) | La más barata y estable si se registra en Cloudflare. |
| **entrevelas.com.mx** | Identidad mexicana, moderada | **~$395 MXN** | Buen punto medio. No disponible en Cloudflare (usar GoDaddy/Akky/Hostinger). |
| **entrevelas.mx** | Máxima identidad MX, corta | **~$900–1,000 MXN** | La más cara por mucho. Solo si te importa mucho el ".mx". |

> Ojo con el "primer año promocional": muchos registradores anuncian $90–$145 el primer año
> y luego **renuevan mucho más caro**. La tabla usa el precio de **renovación real**, que es lo que
> pagarás cada año.

---

## 2. Dónde registrarlo — comparativa de registradores

| Registrador | .com (renovación/año) | ¿Vende .mx / .com.mx? | Privacidad WHOIS | Comentario |
|---|---|---|---|---|
| **Cloudflare** ⭐ | **~$10.44 USD (~$200 MXN)** al costo, sin margen | ❌ No .mx | Gratis | Lo más barato y transparente; el precio no sube con trucos. Requiere usar sus DNS (compatible con GitHub Pages). |
| **Namecheap** | ~$13–15 USD (~$260–290 MXN) | .com.mx sí; .mx limitado | Gratis | Precios estables en USD, buena reputación. |
| **GoDaddy MX** | ~$485 MXN | ✅ .mx y .com.mx | De pago (extra) | Más caro en renovación; el más común en México. |
| **Akky / Hostinger / Neubox** | ~$349–649 MXN | ✅ .mx y .com.mx | Varía | Registradores mexicanos; útiles si quieres facturación local en MXN. |

⚠️ **Aviso de precio (nov 2026):** Verisign sube la tarifa mayorista del .com el 1 de noviembre de 2026;
después de esa fecha el .com al costo en Cloudflare pasa a ~$11.15 USD/año. Registrar antes de esa fecha
congela el precio actual un año más.

---

## 3. Recomendación

- **Si priorizas costo y simpleza → `entrevelas.com` en Cloudflare.** ~$200 MXN/año, sin sorpresas,
  privacidad gratis, y se integra perfecto con GitHub Pages. Es mi recomendación principal.
- **Si te importa la identidad mexicana → `entrevelas.com.mx`** (en Namecheap o Akky). ~$395 MXN/año.
- **`entrevelas.mx`** solo si de verdad quieres esa extensión corta; cuesta ~4–5× más que un .com.

**Antes de comprar:** hay que verificar que el nombre esté **disponible** (lo revisas escribiéndolo
en el buscador del registrador). No lo compré ni lo aparté.

---

## 4. Cómo conectarlo a GitHub Pages (cuando decidas)

Pasos que yo haría (o te guío) una vez comprado el dominio:

### 4.1 Cambio en el código (importante)
Al usar dominio propio, el sitio deja de vivir en `/entrevelas/` y pasa a la raíz del dominio.
Hay que cambiar en `vite.config.js`:

```js
base: '/'   // en vez de '/entrevelas/'
```

y crear el archivo `public/CNAME` con el dominio (o dejar que GitHub lo cree desde Settings).
Es un cambio de ~2 líneas; lo hago yo y con un push queda.

### 4.2 Configuración en GitHub
1. Repo → **Settings → Pages → Custom domain** → escribir `entrevelas.com` → Save.
2. Marcar **Enforce HTTPS** (aparece unos minutos después de validar el DNS).

### 4.3 Registros DNS (en el registrador)
**Para dominio raíz** (`entrevelas.com`) — crear 4 registros **A** y 4 **AAAA**:

```
A     @   185.199.108.153
A     @   185.199.109.153
A     @   185.199.110.153
A     @   185.199.111.153
AAAA  @   2606:50c0:8000::153
AAAA  @   2606:50c0:8001::153
AAAA  @   2606:50c0:8002::153
AAAA  @   2606:50c0:8003::153
```

**Para el "www"** (`www.entrevelas.com`) — un registro **CNAME**:

```
CNAME   www   marianomgl.github.io.
```

> En Cloudflare, el apex se resuelve solo con "CNAME flattening"; también funciona con los registros A/AAAA de arriba.
> La propagación del DNS puede tardar de minutos a 24–48 horas. El HTTPS de GitHub se activa solo una vez validado.

### 4.4 Costo recurrente total
Solo el dominio: **~$200–400 MXN/año** según extensión. El hosting sigue **gratis** en GitHub Pages.

---

## Resumen en una línea
`entrevelas.com` en **Cloudflare** (~$200 MXN/año) es la mejor relación costo/estabilidad; conectarlo a
GitHub Pages son unos registros DNS + un cambio de 2 líneas en el código. Dime cuál eliges y lo dejamos listo.
