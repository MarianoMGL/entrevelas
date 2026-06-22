import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Button, Badge, Input, Select, Field } from '../components/ui'
import { mxn, num, precioPorUnidad } from '../lib/calc'

const CATEGORIAS = ['Ceras', 'Colorantes', 'Fragancias', 'Pabilos', 'Empaque', 'Moldes', 'Herramientas', 'Otros']
const UNIDADES = ['gr', 'ml', 'pieza', 'metro']

const nuevoInsumo = () => ({
  nombre: '', categoria: 'Ceras', proveedor: '', presentacion: '',
  cantidad_presentacion: 0, unidad_minima: 'gr', precio_presentacion_sin_iva: 0,
  stock_actual: 0, stock_minimo: 0, notas: '', activo: true,
})

export default function Inventario() {
  const { db, addTo, updateIn, removeFrom } = useStore()
  const [cat, setCat] = useState('Todas')
  const [q, setQ] = useState('')
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState(nuevoInsumo())

  const insumos = db.insumos || []
  const filtered = useMemo(() => {
    return insumos.filter((i) => {
      if (cat !== 'Todas' && i.categoria !== cat) return false
      if (q && !i.nombre.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [insumos, cat, q])

  const startEdit = (i) => { setEditId(i.id); setDraft({ ...i }) }
  const saveEdit = () => {
    updateIn('insumos', editId, {
      ...draft,
      cantidad_presentacion: Number(draft.cantidad_presentacion) || 0,
      precio_presentacion_sin_iva: Number(draft.precio_presentacion_sin_iva) || 0,
      stock_actual: Number(draft.stock_actual) || 0,
      stock_minimo: Number(draft.stock_minimo) || 0,
    })
    setEditId(null); setDraft(null)
  }
  const addRow = () => {
    addTo('insumos', {
      ...newRow,
      cantidad_presentacion: Number(newRow.cantidad_presentacion) || 0,
      precio_presentacion_sin_iva: Number(newRow.precio_presentacion_sin_iva) || 0,
      stock_actual: Number(newRow.stock_actual) || 0,
      stock_minimo: Number(newRow.stock_minimo) || 0,
    }, 'ins')
    setNewRow(nuevoInsumo()); setAdding(false)
  }

  const exportCSV = () => {
    const head = ['Nombre', 'Categoria', 'Proveedor', 'Presentacion', 'Cantidad', 'Unidad', 'Precio s/IVA', 'Precio/unidad', 'Stock', 'Stock min', 'Notas']
    const rows = filtered.map((i) => [
      i.nombre, i.categoria, i.proveedor, i.presentacion, i.cantidad_presentacion, i.unidad_minima,
      i.precio_presentacion_sin_iva, precioPorUnidad(i).toFixed(4), i.stock_actual, i.stock_minimo, i.notas,
    ])
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadCSV(csv, 'inventario_entrevelas.csv')
  }

  return (
    <div>
      <SectionTitle
        sub="Cada insumo con su precio por unidad mínima calculado automáticamente"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={exportCSV}>⬇ Exportar CSV</Button>
            <Button variant="amber" onClick={() => setAdding((v) => !v)}>+ Agregar insumo</Button>
          </div>
        }
      >
        Inventario de Insumos
      </SectionTitle>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="w-56">
          <Input placeholder="🔍 Buscar por nombre…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="w-48">
          <Select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option>Todas</option>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <div className="ml-auto text-sm text-ink/50 self-center">{filtered.length} insumos</div>
      </div>

      {adding && (
        <Card className="p-4 mb-4 border-2 border-amber/40">
          <h3 className="font-display text-lg text-coffee mb-3">Nuevo insumo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Nombre"><Input value={newRow.nombre} onChange={(e) => setNewRow({ ...newRow, nombre: e.target.value })} /></Field>
            <Field label="Categoría">
              <Select value={newRow.categoria} onChange={(e) => setNewRow({ ...newRow, categoria: e.target.value })}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Proveedor"><Input value={newRow.proveedor} onChange={(e) => setNewRow({ ...newRow, proveedor: e.target.value })} /></Field>
            <Field label="Presentación"><Input value={newRow.presentacion} onChange={(e) => setNewRow({ ...newRow, presentacion: e.target.value })} placeholder="bolsa 25 kg" /></Field>
            <Field label="Cantidad por presentación"><Input type="number" value={newRow.cantidad_presentacion} onChange={(e) => setNewRow({ ...newRow, cantidad_presentacion: e.target.value })} /></Field>
            <Field label="Unidad">
              <Select value={newRow.unidad_minima} onChange={(e) => setNewRow({ ...newRow, unidad_minima: e.target.value })}>
                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
              </Select>
            </Field>
            <Field label="Precio s/IVA"><Input type="number" value={newRow.precio_presentacion_sin_iva} onChange={(e) => setNewRow({ ...newRow, precio_presentacion_sin_iva: e.target.value })} /></Field>
            <Field label="Stock actual"><Input type="number" value={newRow.stock_actual} onChange={(e) => setNewRow({ ...newRow, stock_actual: e.target.value })} /></Field>
            <Field label="Stock mínimo"><Input type="number" value={newRow.stock_minimo} onChange={(e) => setNewRow({ ...newRow, stock_minimo: e.target.value })} /></Field>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="sage" onClick={addRow} disabled={!newRow.nombre}>Guardar insumo</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f4ede4] text-ink/60 text-left text-xs uppercase tracking-wide">
                <th className="px-3 py-2 font-semibold">Insumo</th>
                <th className="px-3 py-2 font-semibold">Categoría</th>
                <th className="px-3 py-2 font-semibold">Proveedor</th>
                <th className="px-3 py-2 font-semibold">Presentación</th>
                <th className="px-3 py-2 font-semibold text-right">Precio s/IVA</th>
                <th className="px-3 py-2 font-semibold text-right">$ / unidad</th>
                <th className="px-3 py-2 font-semibold text-right">Stock</th>
                <th className="px-3 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const bajo = i.stock_actual <= i.stock_minimo
                const isEdit = editId === i.id
                if (isEdit) {
                  return (
                    <tr key={i.id} className="border-t border-[#efe7dd] bg-amber/5">
                      <td className="px-3 py-2"><Input value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} /></td>
                      <td className="px-3 py-2">
                        <Select value={draft.categoria} onChange={(e) => setDraft({ ...draft, categoria: e.target.value })}>
                          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                        </Select>
                      </td>
                      <td className="px-3 py-2"><Input value={draft.proveedor} onChange={(e) => setDraft({ ...draft, proveedor: e.target.value })} /></td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Input className="w-20" value={draft.presentacion} onChange={(e) => setDraft({ ...draft, presentacion: e.target.value })} />
                          <Input className="w-16" type="number" value={draft.cantidad_presentacion} onChange={(e) => setDraft({ ...draft, cantidad_presentacion: e.target.value })} />
                        </div>
                      </td>
                      <td className="px-3 py-2"><Input className="w-24 text-right" type="number" value={draft.precio_presentacion_sin_iva} onChange={(e) => setDraft({ ...draft, precio_presentacion_sin_iva: e.target.value })} /></td>
                      <td className="px-3 py-2 text-right text-ink/50">{mxn(precioPorUnidad({ ...draft, cantidad_presentacion: Number(draft.cantidad_presentacion), precio_presentacion_sin_iva: Number(draft.precio_presentacion_sin_iva) }))}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Input className="w-16 text-right" type="number" value={draft.stock_actual} onChange={(e) => setDraft({ ...draft, stock_actual: e.target.value })} />
                          <Input className="w-16 text-right" type="number" value={draft.stock_minimo} onChange={(e) => setDraft({ ...draft, stock_minimo: e.target.value })} />
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Button size="sm" variant="sage" onClick={saveEdit}>✓</Button>{' '}
                        <Button size="sm" variant="ghost" onClick={() => { setEditId(null); setDraft(null) }}>✕</Button>
                      </td>
                    </tr>
                  )
                }
                return (
                  <tr key={i.id} className="border-t border-[#efe7dd] hover:bg-cream/40">
                    <td className="px-3 py-2 font-medium text-ink">
                      {i.nombre}
                      {bajo && <Badge tone="red" className="ml-2">bajo mínimo</Badge>}
                    </td>
                    <td className="px-3 py-2 text-ink/60">{i.categoria}</td>
                    <td className="px-3 py-2 text-ink/60">{i.proveedor}</td>
                    <td className="px-3 py-2 text-ink/60">{i.presentacion}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{mxn(i.precio_presentacion_sin_iva)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-coffee font-semibold">{mxn(precioPorUnidad(i))}<span className="text-ink/40 text-xs">/{i.unidad_minima}</span></td>
                    <td className={`px-3 py-2 text-right tabular-nums ${bajo ? 'text-alert font-semibold' : ''}`}>{num(i.stock_actual)} <span className="text-ink/40 text-xs">/ {num(i.stock_minimo)}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <button onClick={() => startEdit(i)} className="text-amber hover:underline text-xs">Editar</button>
                      <button
                        onClick={() => { if (confirm(`¿Eliminar "${i.nombre}"?`)) removeFrom('insumos', i.id) }}
                        className="text-alert hover:underline text-xs ml-3"
                      >Eliminar</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export function downloadCSV(csv, filename) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
