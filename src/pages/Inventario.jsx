import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Button, Badge, Input, Select, Field } from '../components/ui'
import { mxn, num, precioPorUnidad } from '../lib/calc'
import { exportXLSX, downloadCSV, rowsToCSV } from '../lib/exportar'

const CATEGORIAS = ['Ceras', 'Colorantes', 'Fragancias', 'Pabilos', 'Empaque', 'Moldes', 'Herramientas', 'Otros']
const UNIDADES = ['gr', 'kg', 'ml', 'pieza', 'metro']

const nuevoInsumo = () => ({
  nombre: '', categoria: 'Ceras', proveedor: '', presentacion: '',
  cantidad_presentacion: 0, unidad_minima: 'gr', precio_presentacion_sin_iva: 0,
  stock_actual: 0, stock_minimo: 0, stock_maximo: 0, notas: '', activo: true,
})

// Estado de stock: 'bajo' | 'sobre' | 'ok'
function estadoStock(i) {
  if (i.stock_actual <= i.stock_minimo) return 'bajo'
  if (i.stock_maximo > 0 && i.stock_actual >= i.stock_maximo) return 'sobre'
  return 'ok'
}

export default function Inventario() {
  const { db, addTo, updateIn, removeFrom } = useStore()
  const [cat, setCat] = useState('Todas')
  const [q, setQ] = useState('')
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newRow, setNewRow] = useState(nuevoInsumo())
  const [sortKey, setSortKey] = useState('nombre')
  const [sortDir, setSortDir] = useState('asc')
  const [agrupar, setAgrupar] = useState(false)

  const insumos = db.insumos || []

  const toNum = (o) => ({
    ...o,
    cantidad_presentacion: Number(o.cantidad_presentacion) || 0,
    precio_presentacion_sin_iva: Number(o.precio_presentacion_sin_iva) || 0,
    stock_actual: Number(o.stock_actual) || 0,
    stock_minimo: Number(o.stock_minimo) || 0,
    stock_maximo: Number(o.stock_maximo) || 0,
  })

  const filtered = useMemo(() => {
    let list = insumos.filter((i) => {
      if (cat !== 'Todas' && i.categoria !== cat) return false
      if (q && !i.nombre.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
    const dir = sortDir === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      let va, vb
      if (sortKey === 'precioUnidad') { va = precioPorUnidad(a); vb = precioPorUnidad(b) }
      else if (sortKey === 'stock_actual') { va = a.stock_actual; vb = b.stock_actual }
      else { va = a[sortKey]; vb = b[sortKey] }
      if (typeof va === 'string') return va.localeCompare(vb) * dir
      return ((va || 0) - (vb || 0)) * dir
    })
    if (agrupar) list = [...list].sort((a, b) => a.categoria.localeCompare(b.categoria))
    return list
  }, [insumos, cat, q, sortKey, sortDir, agrupar])

  const startEdit = (i) => { setEditId(i.id); setDraft({ ...i }) }
  const saveEdit = () => { updateIn('insumos', editId, toNum(draft)); setEditId(null); setDraft(null) }
  const addRow = () => { addTo('insumos', toNum(newRow), 'ins'); setNewRow(nuevoInsumo()); setAdding(false) }

  const setSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const dataRows = () => filtered.map((i) => ({
    Nombre: i.nombre, Categoría: i.categoria, Proveedor: i.proveedor, Presentación: i.presentacion,
    Cantidad: i.cantidad_presentacion, Unidad: i.unidad_minima,
    'Precio s/IVA': i.precio_presentacion_sin_iva, 'Precio/unidad': Number(precioPorUnidad(i).toFixed(4)),
    'Stock actual': i.stock_actual, 'Stock mínimo': i.stock_minimo, 'Stock máximo': i.stock_maximo,
    Estado: estadoStock(i) === 'bajo' ? 'BAJO MÍNIMO' : estadoStock(i) === 'sobre' ? 'SOBRE STOCK' : 'OK',
    Notas: i.notas,
  }))
  const exportExcel = () => exportXLSX(dataRows(), 'inventario_entrevelas', 'Inventario')
  const exportCSV = () => downloadCSV(rowsToCSV(dataRows()), 'inventario_entrevelas')

  const SortTh = ({ k, children, align = 'left' }) => (
    <th className={`px-3 py-2 font-semibold cursor-pointer select-none hover:text-coffee text-${align}`} onClick={() => setSort(k)}>
      {children}{sortKey === k && <span className="text-amber ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
    </th>
  )

  const bajos = insumos.filter((i) => estadoStock(i) === 'bajo').length
  const sobres = insumos.filter((i) => estadoStock(i) === 'sobre').length

  return (
    <div>
      <SectionTitle
        sub="Cada insumo con su precio por unidad mínima calculado automáticamente"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={exportCSV}>⬇ CSV</Button>
            <Button variant="ghost" onClick={exportExcel}>⬇ Excel</Button>
            <Button variant="amber" onClick={() => setAdding((v) => !v)}>+ Agregar insumo</Button>
          </div>
        }
      >
        Inventario de Insumos
      </SectionTitle>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="w-56"><Input placeholder="🔍 Buscar por nombre…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="w-48">
          <Select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option>Todas</option>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer">
          <input type="checkbox" checked={agrupar} onChange={(e) => setAgrupar(e.target.checked)} className="accent-amber" />
          Agrupar por categoría
        </label>
        <div className="ml-auto flex items-center gap-2 text-sm">
          {bajos > 0 && <Badge tone="red">{bajos} bajo mínimo</Badge>}
          {sobres > 0 && <Badge tone="amber">{sobres} sobre stock</Badge>}
          <span className="text-ink/50">{filtered.length} insumos</span>
        </div>
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
            <Field label="Presentación"><Input value={newRow.presentacion} onChange={(e) => setNewRow({ ...newRow, presentacion: e.target.value })} placeholder="bolsa 25 kg / frasco 250 gr" /></Field>
            <Field label="Cantidad por presentación"><Input type="number" value={newRow.cantidad_presentacion} onChange={(e) => setNewRow({ ...newRow, cantidad_presentacion: e.target.value })} /></Field>
            <Field label="Unidad">
              <Select value={newRow.unidad_minima} onChange={(e) => setNewRow({ ...newRow, unidad_minima: e.target.value })}>
                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
              </Select>
            </Field>
            <Field label="Precio s/IVA"><Input type="number" value={newRow.precio_presentacion_sin_iva} onChange={(e) => setNewRow({ ...newRow, precio_presentacion_sin_iva: e.target.value })} /></Field>
            <Field label="Stock actual"><Input type="number" value={newRow.stock_actual} onChange={(e) => setNewRow({ ...newRow, stock_actual: e.target.value })} /></Field>
            <Field label="Stock mínimo"><Input type="number" value={newRow.stock_minimo} onChange={(e) => setNewRow({ ...newRow, stock_minimo: e.target.value })} /></Field>
            <Field label="Stock máximo"><Input type="number" value={newRow.stock_maximo} onChange={(e) => setNewRow({ ...newRow, stock_maximo: e.target.value })} /></Field>
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
                <SortTh k="nombre">Insumo</SortTh>
                <SortTh k="categoria">Categoría</SortTh>
                <th className="px-3 py-2 font-semibold">Proveedor</th>
                <th className="px-3 py-2 font-semibold">Presentación</th>
                <SortTh k="precioUnidad" align="right">$ / unidad</SortTh>
                <SortTh k="stock_actual" align="right">Stock (mín–máx)</SortTh>
                <th className="px-3 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const est = estadoStock(i)
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
                          <Select className="w-16" value={draft.unidad_minima} onChange={(e) => setDraft({ ...draft, unidad_minima: e.target.value })}>
                            {UNIDADES.map((u) => <option key={u}>{u}</option>)}
                          </Select>
                        </div>
                      </td>
                      <td className="px-3 py-2"><Input className="w-24 text-right" type="number" value={draft.precio_presentacion_sin_iva} onChange={(e) => setDraft({ ...draft, precio_presentacion_sin_iva: e.target.value })} /></td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Input className="w-16 text-right" type="number" value={draft.stock_actual} onChange={(e) => setDraft({ ...draft, stock_actual: e.target.value })} title="actual" />
                          <Input className="w-14 text-right" type="number" value={draft.stock_minimo} onChange={(e) => setDraft({ ...draft, stock_minimo: e.target.value })} title="mínimo" />
                          <Input className="w-14 text-right" type="number" value={draft.stock_maximo} onChange={(e) => setDraft({ ...draft, stock_maximo: e.target.value })} title="máximo" />
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
                      {est === 'bajo' && <Badge tone="red" className="ml-2">bajo mínimo</Badge>}
                      {est === 'sobre' && <Badge tone="amber" className="ml-2">sobre stock</Badge>}
                    </td>
                    <td className="px-3 py-2 text-ink/60">{i.categoria}</td>
                    <td className="px-3 py-2 text-ink/60">{i.proveedor}</td>
                    <td className="px-3 py-2 text-ink/60">{i.presentacion}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-coffee font-semibold">{mxn(precioPorUnidad(i))}<span className="text-ink/40 text-xs">/{i.unidad_minima}</span></td>
                    <td className={`px-3 py-2 text-right tabular-nums ${est === 'bajo' ? 'text-alert font-semibold' : est === 'sobre' ? 'text-amber font-semibold' : ''}`}>
                      {num(i.stock_actual)} <span className="text-ink/40 text-xs">({num(i.stock_minimo)}–{num(i.stock_maximo)})</span>
                    </td>
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

// Compatibilidad: Precios.jsx importa downloadCSV desde aquí.
export { downloadCSV }
