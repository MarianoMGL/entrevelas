import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Button, Badge, Input, Select, Field, Stat, EmptyState } from '../components/ui'
import { mxn, num, fmtFecha } from '../lib/calc'
import { exportXLSX, downloadCSV, rowsToCSV } from '../lib/exportar'

const CATEGORIAS = ['Insumos', 'Servicios', 'Empaque', 'Renta', 'Sueldos', 'Marketing', 'Transporte', 'Otros']
const hoy = () => new Date().toISOString().slice(0, 10)
const nuevo = () => ({ fecha: hoy(), concepto: '', categoria: 'Insumos', monto: '', notas: '' })

export default function Gastos() {
  const { db, addTo, updateIn, removeFrom } = useStore()
  const gastos = db.gastos || []
  const [form, setForm] = useState(nuevo())
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [filtroCat, setFiltroCat] = useState('Todas')

  const lista = useMemo(() => {
    return [...gastos]
      .filter((g) => filtroCat === 'Todas' || g.categoria === filtroCat)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [gastos, filtroCat])

  const total = lista.reduce((s, g) => s + (Number(g.monto) || 0), 0)
  const porCategoria = useMemo(() => {
    const m = {}
    gastos.forEach((g) => { m[g.categoria] = (m[g.categoria] || 0) + (Number(g.monto) || 0) })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [gastos])

  const agregar = () => {
    if (!form.concepto) return
    addTo('gastos', { ...form, fecha: new Date(form.fecha).toISOString(), monto: Number(form.monto) || 0 }, 'gas')
    setForm(nuevo())
  }
  const startEdit = (g) => { setEditId(g.id); setDraft({ ...g, fecha: g.fecha.slice(0, 10) }) }
  const saveEdit = () => { updateIn('gastos', editId, { ...draft, fecha: new Date(draft.fecha).toISOString(), monto: Number(draft.monto) || 0 }); setEditId(null); setDraft(null) }

  const dataRows = () => lista.map((g) => ({
    Fecha: fmtFecha(g.fecha), Concepto: g.concepto, Categoría: g.categoria, Monto: Number(g.monto) || 0, Notas: g.notas || '',
  }))

  return (
    <div>
      <SectionTitle
        sub="Registro de gastos del taller"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => downloadCSV(rowsToCSV(dataRows()), 'gastos_entrevelas')}>⬇ CSV</Button>
            <Button variant="ghost" onClick={() => exportXLSX(dataRows(), 'gastos_entrevelas', 'Gastos')}>⬇ Excel</Button>
          </div>
        }
      >
        Gastos
      </SectionTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Stat label="Total registrado" value={mxn(total)} sub={`${lista.length} gastos`} tone="red" icon="🧾" />
        {porCategoria.slice(0, 3).map(([cat, monto]) => (
          <Stat key={cat} label={cat} value={mxn(monto)} tone="coffee" />
        ))}
      </div>

      {/* Alta rápida */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <Field label="Fecha"><Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
          <Field label="Concepto" className="md:col-span-2"><Input value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="Ej. Compra de cera" /></Field>
          <Field label="Categoría">
            <Select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Monto ($)"><Input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} /></Field>
          <Button variant="amber" onClick={agregar} disabled={!form.concepto}>+ Agregar</Button>
        </div>
      </Card>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-48">
          <Select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
            <option>Todas</option>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f4ede4] text-ink/60 text-left text-xs uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold">Fecha</th>
                <th className="px-4 py-2.5 font-semibold">Concepto</th>
                <th className="px-4 py-2.5 font-semibold">Categoría</th>
                <th className="px-4 py-2.5 font-semibold text-right">Monto</th>
                <th className="px-4 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((g) => editId === g.id ? (
                <tr key={g.id} className="border-t border-[#efe7dd] bg-amber/5">
                  <td className="px-4 py-2"><Input type="date" value={draft.fecha} onChange={(e) => setDraft({ ...draft, fecha: e.target.value })} /></td>
                  <td className="px-4 py-2"><Input value={draft.concepto} onChange={(e) => setDraft({ ...draft, concepto: e.target.value })} /></td>
                  <td className="px-4 py-2">
                    <Select value={draft.categoria} onChange={(e) => setDraft({ ...draft, categoria: e.target.value })}>
                      {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                    </Select>
                  </td>
                  <td className="px-4 py-2"><Input type="number" className="text-right" value={draft.monto} onChange={(e) => setDraft({ ...draft, monto: e.target.value })} /></td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Button size="sm" variant="sage" onClick={saveEdit}>✓</Button>{' '}
                    <Button size="sm" variant="ghost" onClick={() => { setEditId(null); setDraft(null) }}>✕</Button>
                  </td>
                </tr>
              ) : (
                <tr key={g.id} className="border-t border-[#efe7dd] hover:bg-cream/40">
                  <td className="px-4 py-2.5 text-ink/60">{fmtFecha(g.fecha)}</td>
                  <td className="px-4 py-2.5 font-medium text-ink">{g.concepto}{g.notas && <span className="text-ink/40 text-xs block">{g.notas}</span>}</td>
                  <td className="px-4 py-2.5"><Badge tone="neutral">{g.categoria}</Badge></td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-alert">{mxn(g.monto)}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(g)} className="text-amber hover:underline text-xs">Editar</button>
                    <button onClick={() => { if (confirm('¿Eliminar este gasto?')) removeFrom('gastos', g.id) }} className="text-alert hover:underline text-xs ml-3">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-coffee bg-cream/50 font-semibold">
                <td className="px-4 py-3" colSpan={3}>Total</td>
                <td className="px-4 py-3 text-right font-display text-lg text-alert">{mxn(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {lista.length === 0 && <EmptyState icon="🧾" title="Sin gastos registrados" sub="Agrega tu primer gasto arriba" />}
      </Card>
    </div>
  )
}
