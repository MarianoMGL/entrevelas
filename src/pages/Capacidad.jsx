import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Field, Input, Badge, Button } from '../components/ui'
import { num, minutosPorPieza } from '../lib/calc'

export default function Capacidad() {
  const { db } = useStore()
  const { modelos = [], config } = db
  const activos = modelos.filter((m) => m.activo)

  const [dias, setDias] = useState(24)
  const [horasDia, setHorasDia] = useState(8)
  const horasMes = dias * horasDia
  const minutosMes = horasMes * 60

  const [mix, setMix] = useState({}) // modelo_id -> piezas pedidas

  const tabla = activos.map((m) => {
    const minPz = minutosPorPieza(m)
    const capacidad = minPz > 0 ? Math.floor(minutosMes / minPz) : 0
    return { m, minPz, capacidad }
  })

  const mixRows = useMemo(() => {
    let acumMin = 0
    return activos.map((m) => {
      const pedido = Number(mix[m.id]) || 0
      const minPz = minutosPorPieza(m)
      const horasNec = (pedido * minPz) / 60
      acumMin += pedido * minPz
      return { m, pedido, horasNec, acumMin }
    })
  }, [mix, activos]) // eslint-disable-line

  const totalMinMix = mixRows.reduce((s, r) => s + r.pedido * r.minPz, 0)
  const totalHorasMix = totalMinMix / 60
  const cabe = totalMinMix <= minutosMes

  return (
    <div>
      <SectionTitle sub="¿Cuántas piezas puede producir el taller al mes? Simula tu mix de pedidos.">
        Capacidad instalada
      </SectionTitle>

      <Card className="p-5 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Field label="Días productivos / mes"><Input type="number" value={dias} onChange={(e) => setDias(Number(e.target.value))} /></Field>
          <Field label="Horas / día"><Input type="number" value={horasDia} onChange={(e) => setHorasDia(Number(e.target.value))} /></Field>
          <div className="bg-amber/10 rounded-xl p-3">
            <div className="text-xs uppercase text-ink/50">Horas disponibles</div>
            <div className="font-display text-2xl text-amber">{num(horasMes)} h</div>
          </div>
          <div className="bg-coffee/5 rounded-xl p-3">
            <div className="text-xs uppercase text-ink/50">Minutos disponibles</div>
            <div className="font-display text-2xl text-coffee">{num(minutosMes)}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-[#efe7dd]"><h3 className="font-display text-lg text-coffee">Capacidad por modelo (dedicación total)</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f4ede4] text-ink/60 text-xs uppercase">
                <tr><th className="px-4 py-2 text-left">Modelo</th><th className="px-4 py-2 text-right">Min/pieza</th><th className="px-4 py-2 text-right">Piezas/mes</th></tr>
              </thead>
              <tbody>
                {tabla.map((r) => (
                  <tr key={r.m.id} className="border-t border-[#efe7dd]">
                    <td className="px-4 py-2 font-medium">{r.m.nombre}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{num(r.minPz, 1)}</td>
                    <td className="px-4 py-2 text-right tabular-nums font-semibold text-coffee">{num(r.capacidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-[#efe7dd] flex items-center justify-between">
            <h3 className="font-display text-lg text-coffee">Simulador de mix</h3>
            <Button size="sm" variant="ghost" onClick={() => setMix({})}>Limpiar</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f4ede4] text-ink/60 text-xs uppercase">
                <tr><th className="px-4 py-2 text-left">Pedido (modelo)</th><th className="px-4 py-2 text-right">Piezas</th><th className="px-4 py-2 text-right">Horas necesarias</th><th className="px-4 py-2 text-center">¿Entra?</th></tr>
              </thead>
              <tbody>
                {mixRows.map((r) => (
                  <tr key={r.m.id} className="border-t border-[#efe7dd]">
                    <td className="px-4 py-2 font-medium">{r.m.nombre}</td>
                    <td className="px-4 py-2 text-right">
                      <Input type="number" value={mix[r.m.id] || ''} onChange={(e) => setMix({ ...mix, [r.m.id]: e.target.value })} className="w-20 text-right" placeholder="0" />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{num(r.horasNec, 1)} h</td>
                    <td className="px-4 py-2 text-center">{r.pedido > 0 ? (r.acumMin <= minutosMes ? <Badge tone="green">Sí</Badge> : <Badge tone="red">No</Badge>) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-coffee bg-cream/50 font-semibold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">{num(mixRows.reduce((s, r) => s + r.pedido, 0))} pz</td>
                  <td className="px-4 py-3 text-right">{num(totalHorasMix, 1)} / {num(horasMes)} h</td>
                  <td className="px-4 py-3 text-center">{cabe ? <Badge tone="green">Cabe ✓</Badge> : <Badge tone="red">Excede</Badge>}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
