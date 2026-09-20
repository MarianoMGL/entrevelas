import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Button, Input, Select, Field, Stat, EmptyState } from '../components/ui'
import { mxn, num, fmtFecha } from '../lib/calc'
import { exportXLSX, downloadCSV, rowsToCSV } from '../lib/exportar'

const hoy = () => new Date().toISOString().slice(0, 10)
const nuevo = (modeloId = '') => ({ fecha: hoy(), modelo_id: modeloId, cantidad: 1, precio_unitario: '', notas: '' })

export default function Ingresos() {
  const { db, addTo, updateIn, removeFrom, modelosById } = useStore()
  const ingresos = db.ingresos || []
  const modelos = db.modelos || []
  const [form, setForm] = useState(nuevo(modelos[0]?.id))
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState(null)

  const lista = useMemo(() => [...ingresos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)), [ingresos])
  const totalDe = (i) => (Number(i.cantidad) || 0) * (Number(i.precio_unitario) || 0)
  const total = lista.reduce((s, i) => s + totalDe(i), 0)
  const piezas = lista.reduce((s, i) => s + (Number(i.cantidad) || 0), 0)
  const ticket = lista.length ? total / piezas : 0

  const agregar = () => {
    if (!form.modelo_id) return
    addTo('ingresos', { ...form, fecha: new Date(form.fecha).toISOString(), cantidad: Number(form.cantidad) || 0, precio_unitario: Number(form.precio_unitario) || 0 }, 'ing')
    setForm(nuevo(form.modelo_id))
  }
  const startEdit = (i) => { setEditId(i.id); setDraft({ ...i, fecha: i.fecha.slice(0, 10) }) }
  const saveEdit = () => { updateIn('ingresos', editId, { ...draft, fecha: new Date(draft.fecha).toISOString(), cantidad: Number(draft.cantidad) || 0, precio_unitario: Number(draft.precio_unitario) || 0 }); setEditId(null); setDraft(null) }

  const dataRows = () => lista.map((i) => ({
    Fecha: fmtFecha(i.fecha), Modelo: modelosById[i.modelo_id]?.nombre || '—',
    Cantidad: Number(i.cantidad) || 0, 'Precio unitario': Number(i.precio_unitario) || 0, Total: totalDe(i), Notas: i.notas || '',
  }))

  return (
    <div>
      <SectionTitle
        sub="Registro de ventas / ingresos"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => downloadCSV(rowsToCSV(dataRows()), 'ingresos_entrevelas')}>⬇ CSV</Button>
            <Button variant="ghost" onClick={() => exportXLSX(dataRows(), 'ingresos_entrevelas', 'Ingresos')}>⬇ Excel</Button>
          </div>
        }
      >
        Ingresos
      </SectionTitle>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Stat label="Total vendido" value={mxn(total)} sub={`${lista.length} ventas`} tone="sage" icon="💵" />
        <Stat label="Piezas vendidas" value={num(piezas)} tone="coffee" icon="🕯️" />
        <Stat label="Ticket promedio" value={mxn(ticket)} sub="por pieza" tone="amber" />
      </div>

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <Field label="Fecha"><Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
          <Field label="Modelo" className="md:col-span-2">
            <Select value={form.modelo_id} onChange={(e) => setForm({ ...form, modelo_id: e.target.value })}>
              <option value="">Selecciona…</option>
              {modelos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Cantidad"><Input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} /></Field>
          <Field label="Precio unit. ($)"><Input type="number" value={form.precio_unitario} onChange={(e) => setForm({ ...form, precio_unitario: e.target.value })} /></Field>
          <Button variant="amber" onClick={agregar} disabled={!form.modelo_id}>+ Agregar</Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f4ede4] text-ink/60 text-left text-xs uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold">Fecha</th>
                <th className="px-4 py-2.5 font-semibold">Modelo</th>
                <th className="px-4 py-2.5 font-semibold text-right">Cantidad</th>
                <th className="px-4 py-2.5 font-semibold text-right">Precio unit.</th>
                <th className="px-4 py-2.5 font-semibold text-right">Total</th>
                <th className="px-4 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((i) => editId === i.id ? (
                <tr key={i.id} className="border-t border-[#efe7dd] bg-amber/5">
                  <td className="px-4 py-2"><Input type="date" value={draft.fecha} onChange={(e) => setDraft({ ...draft, fecha: e.target.value })} /></td>
                  <td className="px-4 py-2">
                    <Select value={draft.modelo_id} onChange={(e) => setDraft({ ...draft, modelo_id: e.target.value })}>
                      {modelos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </Select>
                  </td>
                  <td className="px-4 py-2"><Input type="number" className="text-right" value={draft.cantidad} onChange={(e) => setDraft({ ...draft, cantidad: e.target.value })} /></td>
                  <td className="px-4 py-2"><Input type="number" className="text-right" value={draft.precio_unitario} onChange={(e) => setDraft({ ...draft, precio_unitario: e.target.value })} /></td>
                  <td className="px-4 py-2 text-right tabular-nums">{mxn(totalDe(draft))}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Button size="sm" variant="sage" onClick={saveEdit}>✓</Button>{' '}
                    <Button size="sm" variant="ghost" onClick={() => { setEditId(null); setDraft(null) }}>✕</Button>
                  </td>
                </tr>
              ) : (
                <tr key={i.id} className="border-t border-[#efe7dd] hover:bg-cream/40">
                  <td className="px-4 py-2.5 text-ink/60">{fmtFecha(i.fecha)}</td>
                  <td className="px-4 py-2.5 font-medium text-ink">{modelosById[i.modelo_id]?.nombre || '—'}{i.notas && <span className="text-ink/40 text-xs block">{i.notas}</span>}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{num(i.cantidad)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{mxn(i.precio_unitario)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-[#4d7152]">{mxn(totalDe(i))}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(i)} className="text-amber hover:underline text-xs">Editar</button>
                    <button onClick={() => { if (confirm('¿Eliminar esta venta?')) removeFrom('ingresos', i.id) }} className="text-alert hover:underline text-xs ml-3">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-coffee bg-cream/50 font-semibold">
                <td className="px-4 py-3" colSpan={4}>Total</td>
                <td className="px-4 py-3 text-right font-display text-lg text-[#4d7152]">{mxn(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {lista.length === 0 && <EmptyState icon="💵" title="Sin ventas registradas" sub="Agrega tu primera venta arriba" />}
      </Card>
    </div>
  )
}
