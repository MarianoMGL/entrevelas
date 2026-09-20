# Prompt de implementación — Mejoras Entrevelas (v2)

> Pega este bloque como instrucción. Está pensado para ejecutarse de una vez o por bloques.

---

## Contexto (no lo re-derives)

Trabajas sobre **Entrevelas**, app de producción artesanal de velas en `entrevelas/` (dentro de `Desktop/FABLE 5`).

- **Stack:** React 18 + Vite + Tailwind. Ruteo con `HashRouter`.
- **Persistencia:** localStorage vía `src/lib/store.jsx`; datos de ejemplo en `src/lib/seed.js`; cálculos en `src/lib/calc.js`. **NO** usa Supabase todavía (schema.sql y cliente listos, pero inactivos).
- **UI compartida:** `src/components/ui.jsx`, sidebar en `src/components/Layout.jsx`, barra de llamas en `FlameProgress.jsx`, gráficas SVG en `charts.jsx`.
- **Páginas:** una por módulo en `src/pages/`.
- **Deploy:** push a `main` → GitHub Actions publica solo en https://marianomgl.github.io/entrevelas/ (repo público MarianoMGL/entrevelas).

**Reglas al implementar:**
1. Mantén la paleta y el estilo actuales (café `#5C3D2E`, ámbar `#C8763A`, verde `#7A9E7E`, crema `#FAF7F2`).
2. Todo nuevo dato debe persistir en el store de localStorage y tener seed de ejemplo coherente.
3. Verifica en el preview (sin errores de consola) antes de dar por hecho cada bloque.
4. Al terminar, corre `npm run build`, haz commit y push (el sitio se actualiza solo).
5. Para exportar a Excel real (.xlsx) usa `xlsx` (SheetJS); si no, CSV que abra en Excel. Preferir .xlsx donde la nota diga "que se baje a un Excel".

---

## BLOQUE A — Inventario de Insumos

- [ ] **A1. Alta de insumos más flexible.** En el formulario de "+ Agregar insumo", permitir presentación por **Kilo / bolsa / frasco / pieza / metro / ml**; agregar `kg` como unidad y convertir a la unidad mínima automáticamente para el cálculo de $/unidad.
- [ ] **A2. Stock con máximo y mínimo.** Añadir campo `stock_maximo` (hoy solo existe `stock_minimo`). Mostrar ambos en la tabla y en el alta/edición. Alerta en rojo si `stock_actual <= stock_minimo`; aviso ámbar si `stock_actual >= stock_maximo` (sobre-stock).
- [ ] **A3. Limpiar / ordenar la vista.** Agregar orden por columnas (nombre, categoría, stock, $/unidad) y agrupado visual por categoría. Compactar la tabla.

## BLOQUE B — Catálogo de Modelos

- [ ] **B1. Edición completa de modelos.** Hoy solo se editan tiempos + toggle activo. Habilitar editar **nombre, categoría, peso, diámetro, piezas por molde, notas** (formulario de edición inline, no solo alta).
- [ ] **B2. Tamaño de lote base + tiempos.** Permitir definir el **tamaño de lote de referencia** por modelo (hoy los tiempos asumen lote de 50) y editar los tiempos por etapa (ya editable — verificar).
- [ ] **B3. Personalización de categorías.** Que el usuario pueda **crear/editar/eliminar categorías** de modelos (no lista fija). Guardar categorías en el store; usarlas en selects de Catálogo y Órdenes.

## BLOQUE C — Orden de Producción / Flujo (6 pasos)

- [ ] **C1. Paso 1 — crear/editar Blend desde el flujo.** En el Paso 1, además de elegir blend, poder **crear uno nuevo** (nombre, componentes = insumo + %, costo de envío) y **editar todo** (añadir/eliminar componentes) sin salir del flujo.
- [ ] **C2. Paso 2 — crear/editar Color desde el flujo.** Igual que C1 pero para colores (código, nombre, colorantes en gramos). Editar todo.
- [ ] **C3. Modificación de pasos.** Permitir personalizar los pasos de una orden (p. ej. marcar un paso como no aplica, o reordenar/renombrar). Mínimo: activar/desactivar "Rechupe" y pasos opcionales por orden.
- [ ] **C4. Modelo a producir personalizado.** En la creación de orden personalizada, permitir ajustar peso/receta para esa orden específica sin alterar el modelo del catálogo.

## BLOQUE D — Costeo x Modelo

- [ ] **D1. Editar todo.** Hacer editables los supuestos del costeo por corrida: costo de luz por lote, renta prorrateada, depreciación, % merma, tarifa de mano de obra — con override manual además del cálculo automático.

## BLOQUE E — Cotización de Modelo (PESTAÑA NUEVA)

- [ ] **E1. Nueva pestaña "Cotización".** Generar una cotización por modelo (o por pedido): cantidad, precio unitario, subtotal, IVA, total, con datos opcionales de cliente.
- [ ] **E2. Exportar cotización.** Botón para **descargar PDF** (imprimible, estilo ficha) **o CSV/Excel**.

## BLOQUE F — Reportes financieros (PESTAÑAS NUEVAS)

- [ ] **F1. Pestaña Gastos.** Registro de gastos del taller (fecha, concepto, categoría, monto). Editar todo. Exportable a Excel.
- [ ] **F2. Pestaña Ingresos.** Registro de ventas/ingresos (fecha, modelo, cantidad, precio, total). Editar todo. Exportable a Excel.
- [ ] **F3. Punto de Equilibrio — Dashboard.** Convertir la vista actual en un dashboard más visual: tarjetas de KPIs, gráfica de PE (ya existe) + comparativo ingresos vs. gastos reales de los bloques F1/F2.

## BLOQUE G — Capacidad Instalada y exportaciones

- [ ] **G1. Editar todo** en Capacidad Instalada (días, horas, mix — ya editable; revisar y completar).
- [ ] **G2. Exportar a Excel** desde: Costos Fijos, Ventas (Ingresos), Gastos y Capacidad. Preferir .xlsx (SheetJS).

## BLOQUE H — Negocio / infraestructura (investigación, no código)

- [ ] **H1. Investigar y costear un dominio propio** (ej. entrevelas.mx / .com). Comparar registradores (Namecheap, Google/Squarespace, GoDaddy, Cloudflare), costo anual, y cómo apuntarlo a GitHub Pages (CNAME). Entregar recomendación con precios. *No comprar — solo investigar y presentar opciones.*

---

## Orden sugerido de ejecución

1. Bloques rápidos y de alto valor: **A2, A3, B1, B3, D1, G2** (edición + stock + exports).
2. Flujo: **C1, C2, C3, C4** (los más grandes).
3. Nuevas pestañas: **E, F**.
4. **H1** (investigación) en paralelo o al final.

Al cerrar cada bloque: verificar en preview → `npm run build` → commit + push.
