import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Field, Input, Stat } from '../components/ui'
import { BreakEvenChart } from '../components/charts'
import {
  mxn, num, totalCostosFijos, costearModelo,
} from '../lib/calc'

export default function PuntoEquilibrio() {
  const { db, insumosById } = useStore()
  const { modelos = [], blends = [], colores = [], insumos = [], config, costosFijos } = db

  // Precio y costo variable promedio del catálogo
  const blend = blends[0], color = colores[0]
  const frag = insumos.find((i) => i.categoria === 'Fragancias')
  const pabilo = insumos.find((i) => i.categoria === 'Pabilos')
  const activos = modelos.filter((m) => m.activo)

  const promedios = useMemo(() => {
    if (!activos.length) return { precio: 0, costoVar: 0 }
    let sumPrecio = 0, sumVar = 0
    activos.forEach((m) => {
      const { detalle, costoTotal } = costearModelo({
        modelo: m, blend, color, fragInsumo: frag, fragPct: 8, pabilo,
        empaqueInsumos: [{ insumo: insumos.find((i) => i.nombre === 'Etiqueta adhesiva'), cantidad: 1 }],
        lotePiezas: 50, config, costosFijos, insumosById,
      })
      const costoVar = detalle.subtotalMPD + detalle.costoMerma + detalle.costoMOD
      sumVar += costoVar
      sumPrecio += costoTotal * 1.8 // precio sugerido con margen 80%
    })
    return { precio: sumPrecio / activos.length, costoVar: sumVar / activos.length }
  }, [activos]) // eslint-disable-line

  const gastosFijosDefault = totalCostosFijos(costosFijos) + (config?.sueldo_mensual || 0)
  const [gastosFijos, setGastosFijos] = useState(Math.round(gastosFijosDefault))
  const [sueldo, setSueldo] = useState(config?.sueldo_mensual || 60000)
  const [prodMensual, setProdMensual] = useState(config?.produccion_mensual_estimada || 500)
  const [horas, setHoras] = useState(config?.horas_productivas_mes || 192)
  const [precio, setPrecio] = useState(Math.round(promedios.precio))
  const [costoVar, setCostoVar] = useState(Math.round(promedios.costoVar * 100) / 100)

  const margenContrib = precio - costoVar
  const peUnidades = margenContrib > 0 ? gastosFijos / margenContrib : null
  const pePesos = peUnidades != null ? peUnidades * precio : null

  return (
    <div>
      <SectionTitle sub="¿Cuántas velas necesitas vender al mes para cubrir todos tus costos?">
        Punto de equilibrio
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-display text-lg text-coffee mb-3">Variables</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gastos fijos mensuales" hint="incluye sueldo socias"><Input type="number" value={gastosFijos} onChange={(e) => setGastosFijos(Number(e.target.value))} /></Field>
            <Field label="Sueldo mensual socias"><Input type="number" value={sueldo} onChange={(e) => setSueldo(Number(e.target.value))} /></Field>
            <Field label="Producción mensual estimada"><Input type="number" value={prodMensual} onChange={(e) => setProdMensual(Number(e.target.value))} /></Field>
            <Field label="Horas productivas al mes"><Input type="number" value={horas} onChange={(e) => setHoras(Number(e.target.value))} /></Field>
            <Field label="Precio de venta promedio"><Input type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} /></Field>
            <Field label="Costo variable promedio"><Input type="number" value={costoVar} onChange={(e) => setCostoVar(Number(e.target.value))} /></Field>
          </div>
          <p className="text-xs text-ink/45 mt-3">Precio y costo variable se calcularon del catálogo activo (margen 80%); ajústalos según tu realidad.</p>
        </Card>

        <div className="grid grid-cols-2 gap-4 content-start">
          <Stat label="Margen de contribución" value={mxn(margenContrib)} sub="por unidad" tone="sage" />
          <Stat label="PE en unidades" value={peUnidades != null ? num(peUnidades, 0) : '—'} sub="velas / mes" tone="amber" />
          <Stat label="PE en pesos" value={pePesos != null ? mxn(pePesos) : '—'} sub="ingreso / mes" tone="coffee" />
          <Stat label="Margen vs. producción" value={prodMensual ? `${num((peUnidades / prodMensual) * 100, 0)}%` : '—'} sub="del objetivo mensual" tone={peUnidades && peUnidades <= prodMensual ? 'sage' : 'red'} />
        </div>
      </div>

      <Card className="p-5 mt-5">
        <h3 className="font-display text-lg text-coffee mb-4">Gráfica de punto de equilibrio</h3>
        <BreakEvenChart
          precioUnit={precio}
          costoVarUnit={costoVar}
          costosFijos={gastosFijos}
          maxUnidades={Math.max(prodMensual, peUnidades ? peUnidades * 1.4 : prodMensual)}
        />
      </Card>
    </div>
  )
}
