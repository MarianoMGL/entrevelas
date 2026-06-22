import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Button, Badge, Input } from '../components/ui'
import { downloadCSV } from './Inventario'
import { mxn, num, conIva, diasDesde, costearModelo } from '../lib/calc'

export default function Precios() {
  const { db, insumosById } = useStore()
  const { modelos = [], blends = [], colores = [], insumos = [], config, costosFijos, costeos = [] } = db
  const [margenes, setMargenes] = useState({})
  const [globalMargen, setGlobalMargen] = useState(80)

  const blend = blends[0]
  const color = colores[0]
  const frag = insumos.find((i) => i.categoria === 'Fragancias')
  const pabilo = insumos.find((i) => i.categoria === 'Pabilos')

  const rows = useMemo(() => modelos.filter((m) => m.activo).map((m) => {
    const ult = costeos.filter((c) => c.modelo_id === m.id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
    let costo, fecha, margen
    if (ult) {
      costo = ult.costo_total; fecha = ult.fecha; margen = margenes[m.id] ?? ult.margen_pct
    } else {
      const r = costearModelo({
        modelo: m, blend, color, fragInsumo: frag, fragPct: 8, pabilo,
        empaqueInsumos: [{ insumo: insumos.find((i) => i.nombre === 'Etiqueta adhesiva'), cantidad: 1 }, { insumo: insumos.find((i) => i.nombre === 'Caja individual kraft'), cantidad: 1 }],
        lotePiezas: 50, config, costosFijos, insumosById,
      })
      costo = r.costoTotal; fecha = null; margen = margenes[m.id] ?? globalMargen
    }
    const precioSin = costo * (1 + margen / 100)
    const dias = fecha ? diasDesde(fecha) : null
    return { m, costo, fecha, margen, precioSin, dias, alDia: dias != null && dias <= 30 }
  }), [modelos, costeos, margenes, globalMargen]) // eslint-disable-line

  const aplicarGlobal = () => {
    const next = {}
    rows.forEach((r) => { next[r.m.id] = globalMargen })
    setMargenes(next)
  }

  const exportCSV = () => {
    const head = ['Modelo', 'Costo unitario', 'Margen %', 'Precio sin IVA', 'Precio con IVA', 'Ultimo costeo', 'Estado']
    const data = rows.map((r) => [r.m.nombre, r.costo.toFixed(2), r.margen, r.precioSin.toFixed(2), conIva(r.precioSin).toFixed(2), r.fecha ? new Date(r.fecha).toLocaleDateString('es-MX') : 'estimado', r.alDia ? 'Al día' : 'Revisar'])
    const csv = [head, ...data].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCSV(csv, 'precios_entrevelas.csv')
  }

  return (
    <div>
      <SectionTitle
        sub="Precios de venta de todos los modelos activos. El precio se deriva del costo total + margen."
        action={
          <div className="flex gap-2 items-center">
            <span className="text-sm text-ink/60">Margen global:</span>
            <Input type="number" value={globalMargen} onChange={(e) => setGlobalMargen(Number(e.target.value))} className="w-20" />
            <Button variant="subtle" onClick={aplicarGlobal}>Aplicar a todos</Button>
            <Button variant="ghost" onClick={exportCSV}>⬇ CSV</Button>
          </div>
        }
      >
        Precios de venta
      </SectionTitle>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f4ede4] text-ink/60 text-left text-xs uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold">Modelo</th>
                <th className="px-4 py-2.5 font-semibold text-right">Costo unitario</th>
                <th className="px-4 py-2.5 font-semibold text-right">Margen %</th>
                <th className="px-4 py-2.5 font-semibold text-right">Precio sin IVA</th>
                <th className="px-4 py-2.5 font-semibold text-right">Precio con IVA</th>
                <th className="px-4 py-2.5 font-semibold">Último costeo</th>
                <th className="px-4 py-2.5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.m.id} className="border-t border-[#efe7dd] hover:bg-cream/40">
                  <td className="px-4 py-3 font-medium text-ink">{r.m.nombre}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{mxn(r.costo)}</td>
                  <td className="px-4 py-3 text-right">
                    <Input type="number" value={r.margen} onChange={(e) => setMargenes({ ...margenes, [r.m.id]: Number(e.target.value) })} className="w-16 text-right" />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-coffee">{mxn(r.precioSin)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-amber">{mxn(conIva(r.precioSin))}</td>
                  <td className="px-4 py-3 text-ink/55 text-xs">{r.fecha ? new Date(r.fecha).toLocaleDateString('es-MX') : 'estimado'}</td>
                  <td className="px-4 py-3">
                    {r.alDia ? <Badge tone="green">Al día</Badge> : <Badge tone="amber">{r.dias == null ? 'Sin costear' : '+30 días'}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
