import { useState } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Button, Input, Field, Badge } from '../components/ui'
import { mxn, num, totalCostosFijos } from '../lib/calc'

export default function CostosFijos() {
  const { db, updateIn, addTo, removeFrom, setConfig, resetDb } = useStore()
  const { costosFijos = [], config } = db
  const [nuevo, setNuevo] = useState({ concepto: '', monto_mensual: '' })

  const total = totalCostosFijos(costosFijos)
  // Depreciación mensual de moldes
  const depMensual = (config.inversion_moldes || 0) / (config.vida_util_moldes_meses || 24)
  const totalConDep = total + depMensual
  const indirectoPieza = config.produccion_mensual_estimada ? totalConDep / config.produccion_mensual_estimada : 0

  const agregar = () => {
    if (!nuevo.concepto) return
    const now = new Date()
    addTo('costosFijos', { concepto: nuevo.concepto, monto_mensual: Number(nuevo.monto_mensual) || 0, mes: now.getMonth() + 1, anio: now.getFullYear() }, 'cf')
    setNuevo({ concepto: '', monto_mensual: '' })
  }

  return (
    <div>
      <SectionTitle sub="Costos fijos e indirectos del taller, y configuración global de costeo">
        Costos fijos / Indirectos
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="px-5 py-3 border-b border-[#efe7dd]"><h3 className="font-display text-lg text-coffee">Tabla mensual</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-[#f4ede4] text-ink/60 text-xs uppercase">
              <tr><th className="px-5 py-2 text-left">Concepto</th><th className="px-5 py-2 text-right">Monto mensual</th><th className="px-5 py-2"></th></tr>
            </thead>
            <tbody>
              {costosFijos.map((c) => (
                <tr key={c.id} className="border-t border-[#efe7dd]">
                  <td className="px-5 py-2 font-medium text-ink">{c.concepto}</td>
                  <td className="px-5 py-2 text-right">
                    <Input type="number" value={c.monto_mensual} onChange={(e) => updateIn('costosFijos', c.id, { monto_mensual: Number(e.target.value) || 0 })} className="w-28 text-right" />
                  </td>
                  <td className="px-5 py-2 text-right">
                    <button onClick={() => removeFrom('costosFijos', c.id)} className="text-alert text-xs hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-[#efe7dd] bg-cream/40">
                <td className="px-5 py-2 italic text-ink/60">Depreciación de equipos (auto)</td>
                <td className="px-5 py-2 text-right tabular-nums text-ink/60">{mxn(depMensual)}</td>
                <td></td>
              </tr>
              <tr className="border-t border-[#efe7dd]">
                <td className="px-5 py-2">
                  <Input placeholder="Nuevo concepto…" value={nuevo.concepto} onChange={(e) => setNuevo({ ...nuevo, concepto: e.target.value })} />
                </td>
                <td className="px-5 py-2 text-right">
                  <Input type="number" placeholder="0" value={nuevo.monto_mensual} onChange={(e) => setNuevo({ ...nuevo, monto_mensual: e.target.value })} className="w-28 text-right" />
                </td>
                <td className="px-5 py-2 text-right"><Button size="sm" variant="sage" onClick={agregar}>+ Agregar</Button></td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-coffee bg-cream/60 font-semibold">
                <td className="px-5 py-3 font-display text-coffee">Total mensual</td>
                <td className="px-5 py-3 text-right font-display text-xl text-amber">{mxn(totalConDep)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div className="px-5 py-3 bg-amber/5 flex items-center justify-between">
            <span className="text-sm text-ink/70">Costo indirecto por pieza (÷ {num(config.produccion_mensual_estimada)} pz/mes)</span>
            <span className="font-display text-lg text-coffee">{mxn(indirectoPieza)}</span>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-lg text-coffee mb-3">Configuración global</h3>
          <div className="space-y-3">
            <Field label="Sueldo mensual socias"><Input type="number" value={config.sueldo_mensual} onChange={(e) => setConfig({ sueldo_mensual: Number(e.target.value) })} /></Field>
            <Field label="Horas productivas / mes"><Input type="number" value={config.horas_productivas_mes} onChange={(e) => setConfig({ horas_productivas_mes: Number(e.target.value) })} /></Field>
            <Field label="Producción mensual estimada (pz)"><Input type="number" value={config.produccion_mensual_estimada} onChange={(e) => setConfig({ produccion_mensual_estimada: Number(e.target.value) })} /></Field>
            <Field label="Merma default (%)"><Input type="number" value={config.merma_default_pct} onChange={(e) => setConfig({ merma_default_pct: Number(e.target.value) })} /></Field>
            <Field label="Tarifa kWh ($)"><Input type="number" value={config.tarifa_kwh} onChange={(e) => setConfig({ tarifa_kwh: Number(e.target.value) })} /></Field>
            <Field label="Inversión en moldes ($)"><Input type="number" value={config.inversion_moldes} onChange={(e) => setConfig({ inversion_moldes: Number(e.target.value) })} /></Field>
            <Field label="Vida útil moldes (meses)"><Input type="number" value={config.vida_util_moldes_meses} onChange={(e) => setConfig({ vida_util_moldes_meses: Number(e.target.value) })} /></Field>
          </div>
          <div className="mt-5 pt-4 border-t border-[#efe7dd]">
            <Button variant="ghost" onClick={() => { if (confirm('¿Restaurar todos los datos de ejemplo? Se perderán tus cambios locales.')) resetDb() }}>
              ↺ Restaurar datos de ejemplo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
