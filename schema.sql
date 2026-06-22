-- ============================================================================
-- ENTREVELAS — Schema de Supabase (PostgreSQL)
-- Ejecuta este archivo en el SQL Editor de tu proyecto Supabase.
-- Sin autenticación en esta versión (RLS deshabilitado o políticas abiertas).
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- INSUMOS
-- ----------------------------------------------------------------------------
create table if not exists insumos (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  categoria text not null,
  proveedor text,
  presentacion text,
  cantidad_presentacion numeric default 0,
  unidad_minima text default 'gr',          -- gr | ml | pieza | metro
  precio_presentacion_sin_iva numeric default 0,
  stock_actual numeric default 0,
  stock_minimo numeric default 0,
  notas text,
  activo boolean default true,
  creado_en timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- MODELOS DEL CATÁLOGO
-- ----------------------------------------------------------------------------
create table if not exists modelos (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  categoria text,
  peso_gr numeric default 0,
  diametro_cm numeric default 0,
  piezas_por_molde integer default 1,
  imagen_url text,
  activo boolean default true,
  notas_produccion text
);

create table if not exists modelo_tiempos (
  id uuid primary key default uuid_generate_v4(),
  modelo_id uuid references modelos(id) on delete cascade,
  etapa text not null,
  minutos_estimados numeric default 0
);

-- ----------------------------------------------------------------------------
-- BLENDS DE CERA
-- ----------------------------------------------------------------------------
create table if not exists blends (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  activo boolean default true,
  costo_envio numeric default 0
);

create table if not exists blend_componentes (
  id uuid primary key default uuid_generate_v4(),
  blend_id uuid references blends(id) on delete cascade,
  insumo_id uuid references insumos(id),
  porcentaje numeric default 0
);

-- ----------------------------------------------------------------------------
-- BIBLIOTECA DE COLORES
-- ----------------------------------------------------------------------------
create table if not exists colores (
  id uuid primary key default uuid_generate_v4(),
  codigo text,
  nombre text not null,
  tipo_cera text,
  temp_mezcla numeric,
  temp_vertido numeric,
  notas text
);

create table if not exists color_componentes (
  id uuid primary key default uuid_generate_v4(),
  color_id uuid references colores(id) on delete cascade,
  insumo_id uuid references insumos(id),
  gramos numeric default 0
);

-- ----------------------------------------------------------------------------
-- ÓRDENES DE PRODUCCIÓN
-- ----------------------------------------------------------------------------
create table if not exists ordenes (
  id uuid primary key default uuid_generate_v4(),
  numero_orden text unique not null,
  modelo_id uuid references modelos(id),
  piezas integer default 0,
  fecha_inicio date,
  fecha_entrega_estimada date,
  personalizado boolean default false,
  cargo_extra_personalizacion numeric default 0,
  elaboro text,
  observaciones text,
  estado text default 'En proceso',          -- En proceso | En reposo | Listo | Entregado
  paso_actual integer default 1,
  creado_en timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- REGISTRO POR PASO DEL FLUJO
-- ----------------------------------------------------------------------------
create table if not exists lote_paso1 (
  id uuid primary key default uuid_generate_v4(),
  orden_id uuid references ordenes(id) on delete cascade,
  blend_id uuid references blends(id),
  cera_total_gr numeric,
  merma_pct numeric,
  temp_derretido numeric,
  tiempo_min numeric,
  pesados jsonb,
  observaciones text
);

create table if not exists lote_paso2 (
  id uuid primary key default uuid_generate_v4(),
  orden_id uuid references ordenes(id) on delete cascade,
  color_id uuid references colores(id),
  temp_mezcla numeric,
  resultado_visual text,
  foto_url text,
  observaciones text
);

create table if not exists lote_paso3 (
  id uuid primary key default uuid_generate_v4(),
  orden_id uuid references ordenes(id) on delete cascade,
  insumo_id uuid references insumos(id),
  porcentaje_fragancia numeric,
  gramos_fragancia numeric,
  temp_mezcla numeric,
  intensidad integer,
  observaciones text
);

create table if not exists lote_paso4 (
  id uuid primary key default uuid_generate_v4(),
  orden_id uuid references ordenes(id) on delete cascade,
  temp_vertido numeric,
  temp_molde numeric,
  temp_ambiente numeric,
  humedad numeric,
  rechupe boolean default false,
  pabilo_id uuid references insumos(id),
  observaciones text
);

create table if not exists lote_paso5 (
  id uuid primary key default uuid_generate_v4(),
  orden_id uuid references ordenes(id) on delete cascade,
  piezas_llenadas integer default 0,
  problemas jsonb,
  merma_real_gr numeric,
  tiempo_min numeric,
  observaciones text
);

create table if not exists lote_paso6 (
  id uuid primary key default uuid_generate_v4(),
  orden_id uuid references ordenes(id) on delete cascade,
  inicio_reposo timestamptz,
  tiempo_curado_horas integer default 24,
  resultado_24h text,
  foto_24h text,
  rechupe_detectado boolean,
  resultado_48h text,
  foto_48h text,
  resultado_72h text,
  foto_72h text,
  prueba_quemado boolean,
  resultado_quemado text,
  aprobado text,
  piezas_aprobadas integer,
  merma_piezas integer
);

-- ----------------------------------------------------------------------------
-- MOVIMIENTOS DE INVENTARIO (trazabilidad)
-- ----------------------------------------------------------------------------
create table if not exists movimientos_inventario (
  id uuid primary key default uuid_generate_v4(),
  insumo_id uuid references insumos(id),
  orden_id uuid references ordenes(id),
  tipo text default 'salida',                -- entrada | salida | ajuste
  cantidad numeric,
  unidad text,
  fecha timestamptz default now(),
  notas text
);

-- ----------------------------------------------------------------------------
-- COSTEOS
-- ----------------------------------------------------------------------------
create table if not exists costeos (
  id uuid primary key default uuid_generate_v4(),
  modelo_id uuid references modelos(id),
  blend_id uuid references blends(id),
  color_id uuid references colores(id),
  pabilo_id uuid references insumos(id),
  lote_piezas integer,
  fecha timestamptz default now(),
  costo_mpd numeric,
  costo_mod numeric,
  costo_indirectos numeric,
  costo_merma numeric,
  costo_total numeric,
  margen_pct numeric,
  precio_venta_sin_iva numeric
);

create table if not exists costeo_empaque (
  id uuid primary key default uuid_generate_v4(),
  costeo_id uuid references costeos(id) on delete cascade,
  insumo_id uuid references insumos(id),
  cantidad numeric,
  costo numeric
);

-- ----------------------------------------------------------------------------
-- COSTOS FIJOS
-- ----------------------------------------------------------------------------
create table if not exists costos_fijos (
  id uuid primary key default uuid_generate_v4(),
  concepto text not null,
  monto_mensual numeric default 0,
  mes integer,
  anio integer
);

-- ----------------------------------------------------------------------------
-- CONFIGURACIÓN GLOBAL (clave/valor)
-- ----------------------------------------------------------------------------
create table if not exists configuracion (
  id uuid primary key default uuid_generate_v4(),
  clave text unique not null,
  valor text
);

-- Claves esperadas:
--   sueldo_mensual, horas_productivas_mes, produccion_mensual_estimada,
--   merma_default_pct, tarifa_kwh, vida_util_moldes_meses, inversion_moldes, iva_pct

-- ----------------------------------------------------------------------------
-- POLÍTICAS RLS (versión sin auth: acceso abierto)
-- Quita estas líneas y crea políticas reales cuando agregues autenticación.
-- ----------------------------------------------------------------------------
-- alter table insumos enable row level security;
-- create policy "open" on insumos for all using (true) with check (true);
