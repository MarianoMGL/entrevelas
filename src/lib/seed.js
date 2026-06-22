// Datos precargados de Entrevelas.
// unidad_minima: 'gr' | 'ml' | 'pieza' | 'metro'
// precio_presentacion_sin_iva en MXN.

let _id = 0
const uid = (p) => `${p}-${(++_id).toString().padStart(3, '0')}`

// ----------------------------------------------------------------------------
// INSUMOS
// ----------------------------------------------------------------------------
export const insumosSeed = [
  // Ceras
  ins('Cera de soya Premium 444', 'Ceras', 'Golden Wax', 'bolsa 15.6 kg', 15600, 'gr', 2060, 18000, 5000),
  ins('Cera de palma GW 415', 'Ceras', 'Golden Wax', 'bolsa 15.6 kg', 15600, 'gr', 1960, 12000, 4000),
  ins('Aditivo Endurecedor Wax Plus 358', 'Ceras', 'Golden Wax', 'bolsa 1 kg', 1000, 'gr', 119, 3000, 800),
  ins('Cera Nieve Granulada', 'Ceras', 'Petrowax', 'bolsa 25 kg', 25000, 'gr', 1279, 9000, 3000), // $51.16/kg * 25
  ins('Parafina Malasia', 'Ceras', 'Petrowax', 'bolsa 1 kg', 1000, 'gr', 51.5, 4000, 1000),
  // Colorantes
  ins('Color líquido amarillo', 'Colorantes', 'Petrowax', 'frasco 100 gr', 100, 'gr', 133.62, 280, 50),
  ins('Color líquido rojo', 'Colorantes', 'Petrowax', 'frasco 100 gr', 100, 'gr', 124.57, 260, 50),
  ins('Color líquido azul', 'Colorantes', 'Petrowax', 'frasco 100 gr', 100, 'gr', 153.02, 220, 50),
  ins('Color líquido negro', 'Colorantes', 'Petrowax', 'frasco 100 gr', 100, 'gr', 124.57, 180, 40),
  ins('Color líquido morado', 'Colorantes', 'Petrowax', 'frasco 100 gr', 100, 'gr', 153.02, 150, 40),
  ins('Color líquido verde', 'Colorantes', 'Petrowax', 'frasco 250 gr', 250, 'gr', 392.25, 400, 80),
  ins('Color líquido café', 'Colorantes', 'Petrowax', 'frasco 100 gr', 100, 'gr', 130.0, 240, 50),
  // Fragancias
  ins('Galleta de Jengibre', 'Fragancias', 'Petrowax', 'frasco 250 gr', 250, 'gr', 185.35, 900, 250),
  ins('Pan de Muerto', 'Fragancias', 'Petrowax', 'frasco 250 gr', 250, 'gr', 183.19, 700, 250),
  ins('Chocolate', 'Fragancias', 'Petrowax', 'frasco 250 gr', 250, 'gr', 235.0, 600, 250),
  ins('Tarta de Novias', 'Fragancias', 'Petrowax', 'frasco 250 gr', 250, 'gr', 175.0, 500, 250),
  ins('Pay de Manzana', 'Fragancias', 'Petrowax', 'frasco 250 gr', 250, 'gr', 240.09, 480, 250),
  ins('Bergamota', 'Fragancias', 'Petrowax', 'frasco 250 gr', 250, 'gr', 175.0, 450, 250),
  ins('Sandalwood', 'Fragancias', 'Petrowax', 'frasco 250 gr', 250, 'gr', 205.18, 400, 250),
  ins('Sueño de Navidad', 'Fragancias', 'Petrowax', 'frasco 250 gr', 250, 'gr', 90.0, 800, 250),
  // Pabilos
  ins('Pabilos de madera con fichas', 'Pabilos', 'Temu', 'paquete 50 piezas', 50, 'pieza', 168.95, 300, 50),
  ins('Pabilos algodón', 'Pabilos', 'Temu', 'paquete 310 piezas', 310, 'pieza', 113.17, 900, 310),
  // Empaque
  ins('Etiqueta adhesiva', 'Empaque', 'Mercado Libre', 'rollo 500 piezas', 500, 'pieza', 450, 1200, 200),
  ins('Caja individual kraft', 'Empaque', 'Mercado Libre', 'paquete 50 piezas', 50, 'pieza', 320, 400, 100),
  ins('Papel china', 'Empaque', 'Mercado Libre', 'paquete 100 piezas', 100, 'pieza', 90, 600, 100),
  ins('Plástico burbuja', 'Empaque', 'Mercado Libre', 'rollo 50 m', 50, 'metro', 280, 40, 10),
  ins('Caja de envío', 'Empaque', 'Mercado Libre', 'paquete 25 piezas', 25, 'pieza', 375, 100, 25),
  // Moldes
  ins('Molde silicón pino', 'Moldes', 'Mercado Libre', 'set 6 cavidades', 6, 'pieza', 890, 6, 1),
  ins('Molde silicón oso', 'Moldes', 'Mercado Libre', 'set 6 cavidades', 6, 'pieza', 760, 6, 1),
  ins('Molde árbol', 'Moldes', 'Mercado Libre', 'pieza', 1, 'pieza', 220, 9, 2),
]

function ins(nombre, categoria, proveedor, presentacion, cant, unidad, precio, stock, stockMin) {
  return {
    id: uid('ins'),
    nombre,
    categoria,
    proveedor,
    presentacion,
    cantidad_presentacion: cant,
    unidad_minima: unidad,
    precio_presentacion_sin_iva: precio,
    stock_actual: stock,
    stock_minimo: stockMin,
    notas: '',
    activo: true,
  }
}

const byName = (n) => insumosSeed.find((i) => i.nombre === n)?.id

// ----------------------------------------------------------------------------
// BLENDS
// ----------------------------------------------------------------------------
export const blendsSeed = [
  {
    id: uid('blend'),
    nombre: 'Blend Clásico Soya-Palma',
    activo: true,
    costo_envio: 180,
    componentes: [
      { insumo_id: byName('Cera de soya Premium 444'), porcentaje: 60 },
      { insumo_id: byName('Cera de palma GW 415'), porcentaje: 30 },
      { insumo_id: byName('Aditivo Endurecedor Wax Plus 358'), porcentaje: 10 },
    ],
  },
  {
    id: uid('blend'),
    nombre: 'Blend Navidad Nieve',
    activo: true,
    costo_envio: 150,
    componentes: [
      { insumo_id: byName('Cera Nieve Granulada'), porcentaje: 70 },
      { insumo_id: byName('Parafina Malasia'), porcentaje: 20 },
      { insumo_id: byName('Aditivo Endurecedor Wax Plus 358'), porcentaje: 10 },
    ],
  },
]

// ----------------------------------------------------------------------------
// COLORES (biblioteca)
// ----------------------------------------------------------------------------
export const coloresSeed = [
  {
    id: uid('color'),
    codigo: 'B-003',
    nombre: 'Galleta',
    tipo_cera: 'Soya-Palma',
    temp_mezcla: 70,
    temp_vertido: 65,
    notas: 'Tono cálido tipo galleta horneada',
    componentes: [
      { insumo_id: byName('Color líquido café'), gramos: 8 },
      { insumo_id: byName('Color líquido amarillo'), gramos: 14 },
      { insumo_id: byName('Color líquido verde'), gramos: 1 },
    ],
  },
  {
    id: uid('color'),
    codigo: 'C-001',
    nombre: 'Cempasúchil',
    tipo_cera: 'Soya-Palma',
    temp_mezcla: 72,
    temp_vertido: 66,
    notas: 'Naranja vibrante Día de Muertos',
    componentes: [
      { insumo_id: byName('Color líquido amarillo'), gramos: 10 },
      { insumo_id: byName('Color líquido rojo'), gramos: 4 },
    ],
  },
  {
    id: uid('color'),
    codigo: 'V-002',
    nombre: 'Pino Navideño',
    tipo_cera: 'Soya-Palma',
    temp_mezcla: 70,
    temp_vertido: 64,
    notas: 'Verde profundo para árboles',
    componentes: [
      { insumo_id: byName('Color líquido verde'), gramos: 12 },
      { insumo_id: byName('Color líquido negro'), gramos: 1 },
    ],
  },
]

// ----------------------------------------------------------------------------
// MODELOS DEL CATÁLOGO
// ----------------------------------------------------------------------------
const ETAPAS = [
  'Sacar insumos', 'Pesar insumos', 'Derretir cera', 'Preparar moldes',
  'Poner pabilo', 'Calentar moldes', 'Vertir', 'Rechupe', 'Desmoldar',
  'Rasurar / limpieza', 'Pintura externa', 'Etiqueta y empaque',
]
// minutos por lote de 50 piezas (defaults razonables del spec)
const tiemposBase = {
  'Sacar insumos': 10, 'Pesar insumos': 15, 'Derretir cera': 40, 'Preparar moldes': 25,
  'Poner pabilo': 20, 'Calentar moldes': 30, 'Vertir': 20, 'Rechupe': 30, 'Desmoldar': 25,
  'Rasurar / limpieza': 30, 'Pintura externa': 25, 'Etiqueta y empaque': 65,
}
function tiempos(overrides = {}) {
  return ETAPAS.map((etapa) => ({
    id: uid('mt'),
    etapa,
    minutos_estimados: overrides[etapa] ?? tiemposBase[etapa],
  }))
}

function modelo(nombre, categoria, peso, diametro, piezasMolde, overrides = {}, notas = '') {
  return {
    id: uid('mod'),
    nombre,
    categoria,
    peso_gr: peso,
    diametro_cm: diametro,
    piezas_por_molde: piezasMolde,
    imagen_url: '',
    activo: true,
    notas_produccion: notas,
    tiempos: tiempos(overrides),
  }
}

export const modelosSeed = [
  modelo('Leche con galleta y pino', 'Navidad', 180, 7, 6, { 'Pintura externa': 35 }, 'Detalle de pino pintado a mano'),
  modelo('Leche con galleta y oso', 'Básicas', 180, 7, 6, { 'Pintura externa': 30 }),
  modelo('Leche con galleta y calaveras', 'Día de Muertos', 180, 7, 6, { 'Pintura externa': 40 }),
  modelo('Leche con galleta y calabaza', 'Día de Muertos', 180, 7, 6, { 'Pintura externa': 35 }),
  modelo('Pan de muerto', 'Día de Muertos', 220, 8, 4, { 'Pintura externa': 45, 'Etiqueta y empaque': 70 }),
  modelo('Brownie con calaveritas', 'Día de Muertos', 150, 6, 8, { 'Pintura externa': 30 }),
  modelo('Brownie con Cempasúchil', 'Día de Muertos', 150, 6, 8, { 'Pintura externa': 35 }),
  modelo('Brownie con calavera', 'Día de Muertos', 150, 6, 8, { 'Pintura externa': 30 }),
  modelo('Brownie con calabaza', 'Día de Muertos', 150, 6, 8, { 'Pintura externa': 30 }),
  modelo('Brownie con muñeco de nieve derretido', 'Navidad', 150, 6, 8, { 'Pintura externa': 40 }),
  modelo('Árbol CH (chico)', 'Navidad', 90, 5, 9, { 'Derretir cera': 25, 'Etiqueta y empaque': 50 }),
  modelo('Árbol M (mediano)', 'Navidad', 160, 7, 6, { 'Etiqueta y empaque': 60 }),
  modelo('Árbol G (grande)', 'Navidad', 280, 9, 4, { 'Derretir cera': 50, 'Etiqueta y empaque': 80 }),
]

// ----------------------------------------------------------------------------
// COSTOS FIJOS (mes actual)
// ----------------------------------------------------------------------------
const now = new Date()
export const costosFijosSeed = [
  cf('Renta (18 m²)', 5400),
  cf('Luz', 2872),
  cf('Agua', 0),
  cf('Gasolina', 0),
  cf('Internet', 450),
  cf('Seguro', 0),
  cf('Contador', 1500),
  cf('Redes sociales', 0),
  cf('Dominio web', 200),
  cf('Publicidad', 800),
]
function cf(concepto, monto) {
  return { id: uid('cf'), concepto, monto_mensual: monto, mes: now.getMonth() + 1, anio: now.getFullYear() }
}

// ----------------------------------------------------------------------------
// CONFIGURACIÓN GLOBAL
// ----------------------------------------------------------------------------
export const configSeed = {
  sueldo_mensual: 60000,
  horas_productivas_mes: 192,
  produccion_mensual_estimada: 500,
  merma_default_pct: 8,
  tarifa_kwh: 1.05,
  vida_util_moldes_meses: 24,
  inversion_moldes: 12000,
  iva_pct: 16,
}

// ----------------------------------------------------------------------------
// ÓRDENES DE EJEMPLO (para ver el dashboard y el flujo con datos)
// ----------------------------------------------------------------------------
const modId = (n) => modelosSeed.find((m) => m.nombre === n)?.id
const daysAgo = (d) => { const x = new Date(); x.setDate(x.getDate() - d); return x.toISOString() }
const daysFromNow = (d) => { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString() }

export const ordenesSeed = [
  {
    id: uid('op'),
    numero_orden: 'OP-001',
    modelo_id: modId('Brownie con Cempasúchil'),
    piezas: 30,
    fecha_inicio: daysAgo(0),
    fecha_entrega_estimada: daysFromNow(5),
    personalizado: false,
    cargo_extra_personalizacion: 0,
    elaboro: 'Ambas',
    observaciones: 'Lote para tienda de regalos.',
    estado: 'En proceso',
    paso_actual: 3,
    creado_en: daysAgo(0),
    pasos: {},
  },
  {
    id: uid('op'),
    numero_orden: 'OP-002',
    modelo_id: modId('Árbol M (mediano)'),
    piezas: 24,
    fecha_inicio: daysAgo(2),
    fecha_entrega_estimada: daysFromNow(2),
    personalizado: false,
    cargo_extra_personalizacion: 0,
    elaboro: 'Socia 1',
    observaciones: '',
    estado: 'En reposo',
    paso_actual: 6,
    creado_en: daysAgo(2),
    pasos: {
      paso6: { inicio_reposo: daysAgo(1), tiempo_curado_horas: 48 },
    },
  },
  {
    id: uid('op'),
    numero_orden: 'OP-003',
    modelo_id: modId('Leche con galleta y oso'),
    piezas: 18,
    fecha_inicio: daysAgo(6),
    fecha_entrega_estimada: daysAgo(1),
    personalizado: true,
    cargo_extra_personalizacion: 250,
    elaboro: 'Socia 2',
    observaciones: 'Pedido personalizado con grabado.',
    estado: 'Listo',
    paso_actual: 6,
    creado_en: daysAgo(6),
    pasos: {
      paso6: { inicio_reposo: daysAgo(4), tiempo_curado_horas: 72, aprobado: 'Sí', piezas_aprobadas: 18, merma_piezas: 0 },
    },
  },
]

export const fullSeed = () => ({
  insumos: insumosSeed,
  blends: blendsSeed,
  colores: coloresSeed,
  modelos: modelosSeed,
  ordenes: ordenesSeed,
  costosFijos: costosFijosSeed,
  costeos: [],
  movimientos: [],
  config: configSeed,
})

export { ETAPAS }
