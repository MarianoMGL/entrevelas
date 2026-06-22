# 🕯️ Entrevelas — App de Producción

App web para gestionar la producción artesanal de velas: control de procesos por lote, inventario de insumos, costeo unitario completo y reportes financieros.

Hecha para un taller pequeño que produce velas 100% a mano. Resuelve dos problemas: **saber cuánto cuesta cada vela** y **tener control sobre los procesos de producción**.

- **Stack:** React 18 + Vite + Tailwind CSS
- **Persistencia:** localStorage (esta versión) — cliente Supabase y `schema.sql` listos para conectar
- **Sin autenticación** · Moneda **MXN** (precios sin IVA, con cálculo de IVA 16% donde aplica)

---

## Cómo correr

Requisitos: Node 18+.

```bash
cd entrevelas
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto http://localhost:5173).

La app arranca **con datos de ejemplo precargados** (insumos, modelos, colores, blends y 3 órdenes de demo). Todo se guarda en el navegador (localStorage). Para volver al estado inicial: **Costos fijos → Restaurar datos de ejemplo**.

### Build de producción

```bash
npm run build      # genera dist/
npm run preview    # sirve el build localmente
```

---

## Módulos

| Módulo | Qué hace |
|---|---|
| 🏠 **Dashboard** | Estado de lotes (en proceso / reposo / listos), alertas de stock y costeo, KPIs del mes |
| 📦 **Inventario** | Tabla editable de insumos con **precio por unidad mínima** calculado, alertas de stock, export CSV |
| 🕯️ **Catálogo** | Modelos de velas con tiempos de producción por etapa (lote de 50) |
| 🔬 **Órdenes** | Crea órdenes (OP-001…) y entra al flujo de producción |
| 🔥 **Flujo de producción** | **El corazón:** 6 pasos secuenciales con descuento automático de inventario |
| 📄 **Ficha de producción** | Documento imprimible (PDF vía navegador) que se genera al cerrar el lote |
| 💰 **Costeo por modelo** | Costo unitario completo: MPD + MOD + indirectos + merma, con gráfica de dona y precio sugerido |
| 🏷️ **Precios de venta** | Tabla de todos los modelos con margen editable, badge de antigüedad, export CSV |
| 📊 **Punto de equilibrio** | Calculadora con gráfica de ingresos vs. costos |
| ⚙️ **Capacidad instalada** | Piezas/mes por modelo y simulador de mix de pedidos |
| 🧾 **Costos fijos** | Tabla mensual editable + configuración global (sueldo, merma, depreciación…) |

### Flujo de producción (6 pasos)

1. **Preparación de cera (blend)** — calcula cera total = `peso × piezas × (1 + merma%)`, tabla de pesado con checkboxes, cronómetro de derretido. Descuenta ceras del inventario.
2. **Color** — biblioteca de colores, advertencia si el colorante supera el 1% del peso de cera. Descuenta colorantes.
3. **Aroma** — fragancia con % (6–12%), calcula gramos necesarios. Descuenta fragancia.
4. **Mezcla e implementación** — temperaturas, humedad, moldes y pabilos, rechupe.
5. **Llenado** — contador de piezas, registro de problemas, merma real, cronómetro.
6. **Reposo y curado** — contador regresivo (24/48/72 h), registros por etapa, prueba de quemado, aprobación → genera la ficha y marca el lote **Listo**.

Los cronómetros guardan el tiempo en el registro del lote, no solo en estado local. Cada gramo consumido queda registrado en movimientos de inventario (trazabilidad).

---

## Conectar Supabase (siguiente fase)

La app ya incluye todo lo necesario para migrar de localStorage a Supabase:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, ejecuta [`schema.sql`](schema.sql) (crea todas las tablas con UUIDs).
3. Copia `.env.example` a `.env` y completa:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
4. El cliente en [`src/lib/supabase.js`](src/lib/supabase.js) se activa automáticamente cuando detecta las variables (`isSupabaseConfigured`).

El siguiente paso de integración es reemplazar las lecturas/escrituras de `src/lib/store.jsx` (hoy contra localStorage) por consultas a Supabase usando el mismo modelo de datos. Las fotos opcionales (pasos 2 y 6) pueden ir a Supabase Storage.

---

## Estructura

```
entrevelas/
├── schema.sql                 # Schema completo de Supabase
├── .env.example               # Variables de entorno
├── src/
│   ├── lib/
│   │   ├── seed.js            # Datos precargados (insumos, modelos, colores, blends, órdenes demo)
│   │   ├── calc.js           # Cálculos: costeo, IVA, blends, curado
│   │   ├── store.jsx         # Estado global + persistencia localStorage
│   │   └── supabase.js       # Cliente Supabase (listo para conectar)
│   ├── components/           # UI compartida, sidebar, barra de llamas, gráficas SVG
│   └── pages/                # Un archivo por módulo
└── ...
```

## Reglas de negocio implementadas

- IVA 16% calculado por separado (insumos se guardan sin IVA).
- Merma de producción 8% default, editable por orden.
- Advertencia si el colorante supera el 1% del peso de la cera.
- Fragancia en rango 6–12%, con nota de agregar por debajo de 70 °C.
- Curado mínimo 24 h: no se puede aprobar el lote antes de cumplir el tiempo.
- Descuento automático de inventario y trazabilidad de cada insumo.
- Costeo sobre costo total (no solo materia prima); precio = costo total + margen.
- Fichas de producción sin datos de cliente (documento interno de taller).
