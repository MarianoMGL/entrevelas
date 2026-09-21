# 🕯️ Entrevelas — Guía completa

Manual de uso de toda la aplicación, más un resumen de **todo lo que se cambió** y de **lo que no se pudo cambiar** (y por qué). Escrito en lenguaje sencillo.

- **Sitio en vivo:** https://marianomgl.github.io/entrevelas/
- **Código:** https://github.com/MarianoMGL/entrevelas

---

## PARTE 1 — Lo básico

### Cómo abrir la app
Entra a **https://marianomgl.github.io/entrevelas/**. Conviene guardarla:
- **Computadora:** dale a la estrellita de Favoritos.
- **Tablet/celular:** botón Compartir → "Agregar a pantalla de inicio". Queda como una app.

### Dónde se guardan tus datos (¡importante!)
La información (insumos, órdenes, ventas, etc.) se guarda **en el aparato que estás usando**, dentro del navegador. Esto significa:
- Si abres la app en otra tablet o computadora, **no verás los mismos datos**.
- Por eso conviene usar **siempre el mismo aparato** del taller.
- Tus cambios **no se pierden** al cerrar la app o apagar el equipo.
- Para tener un respaldo, usa los botones **Excel/CSV** (más abajo se explican).

---

## PARTE 2 — Cómo usar cada sección

El menú café de la izquierda tiene todas las secciones.

### 🏠 Dashboard
Pantalla de inicio. De un vistazo: lotes en producción, en reposo y listos; avisos de stock bajo; y números del mes. Solo se mira, no se captura nada.

### 📦 Inventario de Insumos
Lista de todos tus materiales.
- **Agregar:** botón naranja "+ Agregar insumo". Ahora puedes elegir la unidad en **gramos, kilos, ml, piezas o metros**.
- **Editar:** botón "Editar" en cada renglón → cambia → botón verde para guardar.
- **Stock mínimo y máximo:** cada insumo muestra `actual (mín–máx)`. Sale etiqueta **roja "bajo mínimo"** cuando hay que comprar, y **ámbar "sobre stock"** si tienes de más.
- **Ordenar:** da clic en los títulos de columna (Insumo, $/unidad, Stock) para ordenar.
- **Agrupar por categoría:** casilla arriba para ordenar la vista por tipo.
- **Exportar:** botones **CSV** y **Excel** para bajar la lista.
- La app calcula sola el **precio por gramo/pieza**.

### 🕯️ Catálogo de Modelos
Tus modelos de velas.
- **Editar completo:** botón "Editar" en cada modelo (nombre, categoría, peso, diámetro, piezas por molde, notas y tiempos).
- **Tamaño de lote base:** define para cuántas piezas están medidos los tiempos (default 50).
- **Categorías personalizables:** botón "🏷️ Categorías" para **crear, renombrar o eliminar** categorías. Muestra cuántos modelos usa cada una.
- **Nuevo modelo:** botón "+ Nuevo modelo".

### 🔬 Órdenes de Producción
El documento madre de cada lote.
- **Crear:** "+ Nueva orden" → eliges modelo, piezas, fechas, quién elabora, y si es personalizado. La app le pone folio solo (OP-001, OP-002…).
- La tabla muestra el estado (En proceso / En reposo / Listo / Entregado) y el paso actual.

### 🔥 Flujo de Producción (el corazón)
Al abrir una orden, la app te guía **paso por paso**. Arriba hay 6 velitas:
- 🕯️ apagada = falta llegar · 🔥 encendida = paso actual · ✅ = terminado · ➖ = omitido.

**Los 6 pasos:**
1. **Cera (blend):** la app te dice cuántos gramos pesar de cada cera; marca la palomita al pesar; cronómetro de derretido.
2. **Color:** eliges color; te avisa si el colorante pasa del 1% del peso de cera.
3. **Aroma:** eliges fragancia y % (6–12%); calcula los gramos.
4. **Mezcla:** temperaturas, humedad, moldes y pabilos, rechupe.
5. **Llenado:** contador de piezas con + / −, registro de problemas.
6. **Reposo y curado:** reloj que cuenta el tiempo (mín. 24 h); registras resultados y **apruebas el lote**.

**Novedades del flujo:**
- **Crear/editar blend y color sin salir:** junto a los selectores hay botones **✎ (editar)** y **+ (nuevo)** para armar una receta al momento (añadir/quitar componentes).
- **⚙ Personalizar este lote** (botón arriba a la derecha):
  - **Pasos que aplican:** puedes decir que este lote **no lleva color** o **no lleva aroma**; esos pasos se marcan "Omitido" y el flujo los salta.
  - **Modelo personalizado:** para un pedido especial puedes cambiarle el **nombre** y el **peso por pieza** solo a ese lote, sin tocar el catálogo.
- Al aprobar, se **descuentan solos los materiales** usados del inventario y se genera la **ficha**.
- Si cierras a media producción, **todo queda guardado**; al volver, sigues donde ibas.

### 📄 Ficha de Producción
Se crea al aprobar un lote (o desde Órdenes en lotes Listos). Botón **"🖨 Imprimir / Guardar PDF"** → usa el diálogo de impresión; elige impresora o "Guardar como PDF".

### 💰 Costeo por modelo
Calcula el costo real de una vela: materiales + mano de obra + gastos (luz, renta) + merma.
- Gráfica de dona con la participación de cada rubro.
- Barra de **Margen** → precio de venta sugerido (con y sin IVA, y tu utilidad).
- **Ajustes avanzados:** puedes **editar a mano** la merma, la mano de obra por minuto, y la luz/renta por pieza (deja en blanco para usar el cálculo automático).
- Botón "Guardar costeo" para tener historial.

### 🏷️ Precios de venta
Tabla de todos los modelos con su costo, margen editable, precio con y sin IVA. Botón para aplicar un **margen global** y export CSV.

### 📝 Cotización (nueva)
Arma una cotización por pedido:
- Agrega renglones (modelo + cantidad + precio). El **precio se sugiere solo** según el último costeo o margen.
- Calcula **subtotal, IVA 16% y total**.
- **Guardar** con folio (COT-001…), **Imprimir/PDF**, y export **CSV/Excel**.
- Abajo aparece la lista de cotizaciones guardadas (reabrir/eliminar).

### 💵 Ingresos (nueva)
Registra tus ventas (fecha, modelo, cantidad, precio). Muestra **total vendido, piezas y ticket promedio**. Edición rápida y export CSV/Excel.

### 🧾 Gastos (nueva)
Registra tus gastos (fecha, concepto, categoría, monto). Muestra total y desglose por categoría. Edición rápida y export CSV/Excel.

### 📊 Punto de equilibrio (ahora dashboard)
Arriba: **ingresos, gastos, utilidad y % de avance al equilibrio del mes** (con tus datos reales de Ingresos y Gastos), más una barra comparativa. Abajo: el calculador y la gráfica de siempre.

### ⚙️ Capacidad instalada
Cuántas piezas puedes producir al mes y un **simulador de mix** de pedidos. Export a **Excel**.

### 🧾 Costos fijos / Configuración
Tabla de gastos fijos mensuales (renta, luz, etc.) con depreciación automática, y la **configuración global** (sueldo, merma, tarifas, moldes). Export a **Excel**. Aquí también está el botón **"Restaurar datos de ejemplo"** (⚠️ borra lo capturado y regresa a lo de fábrica; úsalo solo si quieres reiniciar).

---

## PARTE 3 — Todo lo que se cambió (versión 2)

Partiendo de tus notas del cuaderno, esto es lo que se agregó/mejoró:

**Inventario**
- Alta con unidad en Kilo/bolsa/frasco, etc.
- Stock con **máximo y mínimo** + alertas.
- Vista ordenable, agrupar por categoría, y **export a Excel**.

**Catálogo**
- **Edición completa** de modelos.
- **Tamaño de lote base** configurable.
- **Categorías personalizables** (crear/renombrar/eliminar).

**Órdenes / Flujo de producción**
- **Crear y editar el Blend** desde el Paso 1.
- **Crear y editar el Color** desde el flujo.
- **Pasos opcionales por lote** (omitir color o aroma).
- **Modelo personalizado** por orden (nombre y peso).

**Costeo**
- **Editar a mano** los costos (merma, mano de obra, luz, renta).

**Cotización (pestaña nueva)**
- Cotización por modelo/pedido con IVA, imprimible en PDF y export CSV/Excel.

**Reportes (pestañas nuevas)**
- **Gastos** e **Ingresos** con export a Excel.
- **Punto de equilibrio** convertido en dashboard con datos reales.

**Capacidad y exportaciones**
- Export a **Excel** en Costos Fijos y Capacidad.

**Negocio**
- Investigación y costeo de un **dominio propio** + guía para conectarlo e instructivo de compra.

---

## PARTE 4 — Lo que NO se pudo cambiar (y por qué)

Estas cosas quedaron pendientes o fuera del alcance de esta versión. No son errores: son decisiones o requieren un siguiente paso.

1. **Los datos no se sincronizan entre dispositivos.**
   Hoy todo se guarda en el navegador del aparato que uses (almacenamiento local). Aún **no está conectado Supabase** (la base de datos en la nube), aunque **ya dejé todo listo** para conectarlo (el archivo `schema.sql` y el cliente). Cuando quieras, ese es el paso que hace que los datos se compartan entre tablet, celular y compu, y que haya respaldo en la nube.

2. **No hay usuarios ni contraseña.**
   Cualquiera con el enlace puede abrir la app. Como no hay login, tampoco hay permisos por persona. (Los datos siguen siendo locales de cada aparato.)

3. **No hay respaldo automático en la nube.**
   Mientras no se conecte Supabase, si se borra el historial del navegador o se cambia de equipo, se pierden los datos. **Recomendación:** usa los botones **Excel/CSV** como respaldo periódico.

4. **Las fotos de los pasos 2 y 6 no se guardan.**
   El plan original contemplaba subir fotos del color y del curado (irían a Supabase Storage). En la versión local solo se guarda el **texto** de los resultados, no las imágenes. Queda pendiente para cuando se conecte Supabase.

5. **El dominio propio no está comprado.**
   Lo investigué y te dejé el costeo y el instructivo, pero **la compra la haces tú con tu tarjeta** (yo no hago pagos). En cuanto lo compres, lo conecto.

6. **El código del sitio es público.**
   Es la condición para publicar gratis en GitHub Pages. La app solo trae datos de ejemplo; los datos reales viven en tu navegador, no en el código.

7. **El PDF de Ficha y Cotización usa el diálogo de impresión del navegador.**
   No genera un archivo por sí solo: abre "Imprimir" y desde ahí eliges "Guardar como PDF". Es intencional y funciona en cualquier equipo.

---

## PARTE 5 — Consejos rápidos

- **Respaldo:** exporta a Excel de vez en cuando (Inventario, Ingresos, Gastos).
- **Mismo aparato:** usa siempre la misma tablet/compu del taller.
- **Si algo se ve raro:** cierra y vuelve a abrir la página; casi siempre se arregla.
- **No borres** el historial/datos del navegador si no tienes respaldo.
- **Siguiente gran paso recomendado:** conectar Supabase para nube + respaldo + varios dispositivos.

---

*Entrevelas · Velas 100% a mano · Guía actualizada — versión 2.*
