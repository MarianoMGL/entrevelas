// Helpers de cálculo: costos por unidad mínima, blends, costeo, IVA.

export const IVA = 0.16

export const mxn = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    Number.isFinite(n) ? n : 0
  )

export const num = (n, d = 0) =>
  new Intl.NumberFormat('es-MX', { maximumFractionDigits: d }).format(
    Number.isFinite(n) ? n : 0
  )

export const conIva = (n) => n * (1 + IVA)
export const ivaDe = (n) => n * IVA

// Precio por unidad mínima ($/gr, $/pieza, etc.)
export function precioPorUnidad(insumo) {
  if (!insumo || !insumo.cantidad_presentacion) return 0
  return insumo.precio_presentacion_sin_iva / insumo.cantidad_presentacion
}

// Costo por gramo de un blend (suma ponderada de sus componentes + envío prorrateado)
export function costoBlendPorGr(blend, insumosById, gramosTotales = 1000) {
  if (!blend) return 0
  let costoPorGr = 0
  for (const c of blend.componentes || []) {
    const ins = insumosById[c.insumo_id]
    if (!ins) continue
    costoPorGr += precioPorUnidad(ins) * (c.porcentaje / 100)
  }
  // Prorratea el costo de envío sobre los gramos del lote
  const envioPorGr = gramosTotales > 0 ? (blend.costo_envio || 0) / gramosTotales : 0
  return costoPorGr + envioPorGr
}

// Gramos a pesar de cada componente del blend
export function blendGramos(blend, gramosTotales) {
  return (blend?.componentes || []).map((c) => ({
    ...c,
    gramos: gramosTotales * (c.porcentaje / 100),
  }))
}

// Costo total de un color (suma de colorantes) y gramos totales de colorante
export function costoColor(color, insumosById) {
  let costo = 0
  let gramos = 0
  for (const c of color?.componentes || []) {
    const ins = insumosById[c.insumo_id]
    if (!ins) continue
    costo += precioPorUnidad(ins) * c.gramos
    gramos += c.gramos
  }
  return { costo, gramos }
}

// Cera total a preparar para un lote
export function ceraTotalLote(pesoVela, piezas, mermaPct) {
  return pesoVela * piezas * (1 + mermaPct / 100)
}

// Minutos totales de producción de un modelo (suma de etapas, para lote de 50)
export function minutosLote50(modelo) {
  return (modelo?.tiempos || []).reduce((s, t) => s + (t.minutos_estimados || 0), 0)
}

// Minutos por pieza (asumiendo que los tiempos del catálogo son para lote de 50)
export function minutosPorPieza(modelo) {
  return minutosLote50(modelo) / 50
}

// Total mensual de costos fijos
export function totalCostosFijos(costosFijos) {
  return (costosFijos || []).reduce((s, c) => s + (c.monto_mensual || 0), 0)
}

// Costo indirecto por pieza
export function indirectoPorPieza(costosFijos, produccionMensual) {
  if (!produccionMensual) return 0
  return totalCostosFijos(costosFijos) / produccionMensual
}

// Costeo unitario completo de un modelo.
// opts: { modelo, blend, color, fragInsumo, fragPct, pabilo, empaqueInsumos:[{insumo, cantidad}], lotePiezas, config, costosFijos, insumosById, cargoExtra }
export function costearModelo(opts) {
  const {
    modelo, blend, color, fragInsumo, fragPct = 8, pabilo,
    empaqueInsumos = [], lotePiezas = 50, config, costosFijos,
    insumosById, cargoExtra = 0,
  } = opts

  const peso = modelo?.peso_gr || 0
  const merma = config?.merma_default_pct ?? 8
  const gramosLote = ceraTotalLote(peso, lotePiezas, merma)

  // MPD
  const ceraGr = peso
  const costoCera = ceraGr * costoBlendPorGr(blend, insumosById, gramosLote)

  const colorInfo = costoColor(color, insumosById)
  // costo de colorante prorrateado por pieza: el color se formula por lote
  const costoColorante = lotePiezas > 0 ? colorInfo.costo / lotePiezas : 0

  const fragGr = peso * (fragPct / 100)
  const costoFragancia = fragInsumo ? fragGr * precioPorUnidad(fragInsumo) : 0

  const costoPabilo = pabilo ? precioPorUnidad(pabilo) : 0

  const costoEmpaque = empaqueInsumos.reduce(
    (s, e) => s + (e.insumo ? precioPorUnidad(e.insumo) * (e.cantidad || 1) : 0),
    0
  )

  const subtotalMPD = costoCera + costoColorante + costoFragancia + costoPabilo + costoEmpaque

  // MOD
  const minutos = minutosPorPieza(modelo)
  const minutosMes = (config?.horas_productivas_mes || 192) * 60
  const costoMinuto = minutosMes > 0 ? (config?.sueldo_mensual || 0) / minutosMes : 0
  const costoMOD = minutos * costoMinuto

  // Indirectos
  const prodMes = config?.produccion_mensual_estimada || 500
  const rentaItem = (costosFijos || []).find((c) => /renta/i.test(c.concepto))
  const luzItem = (costosFijos || []).find((c) => /luz/i.test(c.concepto))
  const costoLuz = prodMes > 0 ? (luzItem?.monto_mensual || 0) / prodMes : 0
  const costoRenta = prodMes > 0 ? (rentaItem?.monto_mensual || 0) / prodMes : 0
  const vidaUtilPiezas =
    ((config?.vida_util_moldes_meses || 24) * prodMes) || 1
  const costoDeprec = (config?.inversion_moldes || 0) / vidaUtilPiezas
  // Resto de fijos (que no sean renta/luz) prorrateados también
  const otrosFijos = (costosFijos || [])
    .filter((c) => !/renta|luz/i.test(c.concepto))
    .reduce((s, c) => s + (c.monto_mensual || 0), 0)
  const costoOtrosFijos = prodMes > 0 ? otrosFijos / prodMes : 0
  const subtotalIndirectos = costoLuz + costoRenta + costoDeprec + costoOtrosFijos

  // Merma
  const costoMerma = subtotalMPD * (merma / 100)

  const costoTotal = subtotalMPD + costoMOD + subtotalIndirectos + costoMerma + (cargoExtra || 0)

  return {
    detalle: {
      costoCera, costoColorante, costoFragancia, costoPabilo, costoEmpaque,
      subtotalMPD,
      costoMOD,
      costoLuz, costoRenta, costoDeprec, costoOtrosFijos, subtotalIndirectos,
      costoMerma,
      cargoExtra: cargoExtra || 0,
      minutos, gramosLote, fragGr,
    },
    costoTotal,
  }
}

export function precioConMargen(costoTotal, margenPct) {
  const precio = costoTotal * (1 + margenPct / 100)
  return {
    sinIva: precio,
    conIva: conIva(precio),
    utilidad: precio - costoTotal,
    margen: margenPct,
  }
}

export function diasDesde(iso) {
  if (!iso) return Infinity
  const ms = Date.now() - new Date(iso).getTime()
  return Math.floor(ms / 86400000)
}

export function tiempoTranscurrido(iso) {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h <= 0) return `${m}min`
  return `${h}h ${m}min`
}

// Horas restantes de curado (negativo = ya cumplió)
export function horasRestantesCurado(inicioIso, horasCurado) {
  if (!inicioIso) return null
  const fin = new Date(inicioIso).getTime() + horasCurado * 3600000
  return (fin - Date.now()) / 3600000
}

export function fmtFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
