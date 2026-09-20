import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Button, Badge, Input, Select, Field, Textarea, EmptyState } from '../components/ui'
import { mxn, num, IVA, conIva, ivaDe, fmtFecha, costearModelo, diasDesde } from '../lib/calc'
import { exportXLSX, downloadCSV, rowsToCSV } from '../lib/exportar'

export default function Cotizacion() {
  const { db, addTo, removeFrom, insumosById, modelosById } = useStore()
  const { modelos = [], blends = [], colores = [], insumos = [], config, costosFijos, costeos = [], cotizaciones = [] } = db

  // Precio sugerido por modelo (último costeo o cálculo con margen 80%)
  const precioSugerido = useMemo(() => {
    const blend = blends[0], color = colores[0]
    const frag = insumos.find((i) => i.categoria === 'Fragancias')
    const pabilo = insumos.find((i) => i.categoria === 'Pabilos')
    const map = {}
    modelos.forEach((m) => {
      const ult = costeos.filter((c) => c.modelo_id === m.id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
      if (ult && diasDesde(ult.fecha) <= 60) { map[m.id] = ult.precio_venta_sin_iva; return }
      const { costoTotal } = costearModelo({
        modelo: m, blend, color, fragInsumo: frag, fragPct: 8, pabilo,
        empaqueInsumos: [{ insumo: insumos.find((i) => i.nombre === 'Etiqueta adhesiva'), cantidad: 1 }],
        lotePiezas: 50, config, costosFijos, insumosById,
      })
      map[m.id] = Math.round(costoTotal * 1.8)
    })
    return map
  }, [modelos, costeos]) // eslint-disable-line

  const [cliente, setCliente] = useState('')
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState([{ modelo_id: modelos[0]?.id || '', cantidad: 1, precio_unitario: precioSugerido[modelos[0]?.id] || 0 }])
  const [guardadoId, setGuardadoId] = useState(null)

  const setItem = (i, patch) => setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)))
  const addItem = () => { const mid = modelos[0]?.id || ''; setItems([...items, { modelo_id: mid, cantidad: 1, precio_unitario: precioSugerido[mid] || 0 }]) }
  const delItem = (i) => setItems(items.filter((_, j) => j !== i))
  const onModelo = (i, mid) => setItem(i, { modelo_id: mid, precio_unitario: precioSugerido[mid] || 0 })

  const filas = items.map((it) => ({ ...it, total: (Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0) }))
  const subtotal = filas.reduce((s, f) => s + f.total, 0)
  const iva = subtotal * IVA
  const total = subtotal + iva

  const numeroCot = useMemo(() => {
    const nums = cotizaciones.map((c) => parseInt((c.numero || '').replace(/\D/g, ''), 10)).filter((n) => !Number.isNaN(n))
    return `COT-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`
  }, [cotizaciones])

  const guardar = () => {
    const id = addTo('cotizaciones', {
      numero: numeroCot, cliente, notas, fecha: new Date().toISOString(),
      items: filas.map((f) => ({ modelo_id: f.modelo_id, nombre: modelosById[f.modelo_id]?.nombre || '', cantidad: Number(f.cantidad) || 0, precio_unitario: Number(f.precio_unitario) || 0 })),
      subtotal, iva, total,
    }, 'cot')
    setGuardadoId(id)
    setTimeout(() => setGuardadoId(null), 3000)
  }

  const dataRows = () => filas.map((f) => ({
    Modelo: modelosById[f.modelo_id]?.nombre || '—', Cantidad: Number(f.cantidad) || 0,
    'Precio unitario': Number(f.precio_unitario) || 0, Total: f.total,
  }))

  return (
    <div>
      <SectionTitle
        sub="Arma una cotización por modelo o pedido — con IVA, imprimible y exportable"
        action={
          <div className="flex gap-2 no-print">
            <Button variant="ghost" onClick={() => downloadCSV(rowsToCSV(dataRows()), `${numeroCot}`)}>⬇ CSV</Button>
            <Button variant="ghost" onClick={() => exportXLSX(dataRows(), `${numeroCot}`, 'Cotización')}>⬇ Excel</Button>
            <Button variant="ghost" onClick={() => window.print()}>🖨 PDF</Button>
            <Button variant="amber" onClick={guardar} disabled={!filas.length}>💾 Guardar</Button>
          </div>
        }
      >
        Cotización
      </SectionTitle>

      {guardadoId && <div className="no-print mb-4"><Badge tone="green">✓ Cotización {numeroCot} guardada</Badge></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Constructor */}
        <Card className="lg:col-span-2 p-5 no-print">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Field label="Cliente (opcional)"><Input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre del cliente" /></Field>
            <Field label="Número"><Input value={numeroCot} disabled /></Field>
          </div>
          <div className="rounded-xl border border-[#efe7dd] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#f4ede4] text-ink/60 text-xs uppercase">
                <tr><th className="px-3 py-2 text-left">Modelo</th><th className="px-3 py-2 text-right w-20">Cant.</th><th className="px-3 py-2 text-right w-28">Precio</th><th className="px-3 py-2 text-right">Total</th><th className="w-8"></th></tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-[#efe7dd]">
                    <td className="px-3 py-2">
                      <Select value={it.modelo_id} onChange={(e) => onModelo(i, e.target.value)}>
                        {modelos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </Select>
                    </td>
                    <td className="px-3 py-2"><Input type="number" className="text-right" value={it.cantidad} onChange={(e) => setItem(i, { cantidad: e.target.value })} /></td>
                    <td className="px-3 py-2"><Input type="number" className="text-right" value={it.precio_unitario} onChange={(e) => setItem(i, { precio_unitario: e.target.value })} /></td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{mxn((Number(it.cantidad) || 0) * (Number(it.precio_unitario) || 0))}</td>
                    <td className="px-2 text-center">{items.length > 1 && <button onClick={() => delItem(i)} className="text-alert text-lg leading-none hover:underline">×</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Button size="sm" variant="subtle" onClick={addItem}>+ Agregar renglón</Button>
            <span className="text-xs text-ink/45">Precio sugerido automático (editable) según último costeo o margen 80%.</span>
          </div>
          <Field label="Notas / condiciones" className="mt-4"><Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Vigencia, tiempo de entrega, anticipo…" /></Field>
        </Card>

        {/* Vista imprimible */}
        <Card className="p-6 print-area lg:col-span-1">
          <div className="text-center border-b-2 border-coffee pb-3 mb-3">
            <div className="text-2xl">🕯️</div>
            <h2 className="font-display text-2xl text-coffee">ENTREVELAS</h2>
            <p className="text-ink/50 text-xs tracking-widest">COTIZACIÓN</p>
          </div>
          <div className="text-sm space-y-0.5 mb-3">
            <div className="flex justify-between"><span className="text-ink/50">Número:</span><span className="font-semibold text-coffee">{numeroCot}</span></div>
            <div className="flex justify-between"><span className="text-ink/50">Fecha:</span><span>{fmtFecha(new Date().toISOString())}</span></div>
            {cliente && <div className="flex justify-between"><span className="text-ink/50">Cliente:</span><span className="font-medium">{cliente}</span></div>}
          </div>
          <table className="w-full text-sm mb-3">
            <thead><tr className="text-ink/50 text-xs border-b border-[#efe7dd]"><th className="text-left py-1">Modelo</th><th className="text-right">Cant</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-b border-[#f2ebe1]">
                  <td className="py-1 text-ink/80">{modelosById[f.modelo_id]?.nombre || '—'}<span className="text-ink/40 text-xs block">{num(f.cantidad)} × {mxn(f.precio_unitario)}</span></td>
                  <td className="text-right align-top py-1">{num(f.cantidad)}</td>
                  <td className="text-right align-top py-1 tabular-nums">{mxn(f.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-sm space-y-1 border-t border-coffee pt-2">
            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span className="tabular-nums">{mxn(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-ink/60">IVA (16%)</span><span className="tabular-nums">{mxn(iva)}</span></div>
            <div className="flex justify-between font-display text-lg text-coffee"><span>Total</span><span className="text-amber">{mxn(total)}</span></div>
          </div>
          {notas && <p className="text-xs text-ink/55 mt-3 border-t border-[#efe7dd] pt-2">{notas}</p>}
          <p className="text-[10px] text-ink/35 text-center mt-4">Entrevelas · Velas 100% a mano · Precios en MXN</p>
        </Card>
      </div>

      {/* Guardadas */}
      {cotizaciones.length > 0 && (
        <div className="no-print mt-6">
          <h3 className="font-display text-lg text-coffee mb-3">Cotizaciones guardadas</h3>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f4ede4] text-ink/60 text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-2.5 font-semibold">Número</th>
                  <th className="px-4 py-2.5 font-semibold">Fecha</th>
                  <th className="px-4 py-2.5 font-semibold">Cliente</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Piezas</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Total</th>
                  <th className="px-4 py-2.5 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {[...cotizaciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((c) => (
                  <tr key={c.id} className="border-t border-[#efe7dd] hover:bg-cream/40">
                    <td className="px-4 py-2.5 font-semibold text-coffee">{c.numero}</td>
                    <td className="px-4 py-2.5 text-ink/60">{fmtFecha(c.fecha)}</td>
                    <td className="px-4 py-2.5 text-ink/70">{c.cliente || '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{num((c.items || []).reduce((s, it) => s + (it.cantidad || 0), 0))}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-amber">{mxn(c.total)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => {
                        setCliente(c.cliente || ''); setNotas(c.notas || '')
                        setItems((c.items || []).map((it) => ({ modelo_id: it.modelo_id, cantidad: it.cantidad, precio_unitario: it.precio_unitario })))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }} className="text-amber hover:underline text-xs">Reabrir</button>
                      <button onClick={() => { if (confirm(`¿Eliminar ${c.numero}?`)) removeFrom('cotizaciones', c.id) }} className="text-alert hover:underline text-xs ml-3">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  )
}
