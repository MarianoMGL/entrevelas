import { useState } from 'react'
import { useStore } from '../lib/store'
import { ETAPAS } from '../lib/seed'
import { Card, Button, Input, Select, Field, Textarea } from './ui'
import { BlendEditor, ColorEditor } from './RecetaEditors'

const UNIDADES = ['gr', 'kg', 'ml', 'pieza', 'metro']

// -------- Editor de Modelo (reutilizable) --------
export function ModeloEditor({ modelo, onDone, onCancel }) {
  const { db, addTo, updateIn, update, uid } = useStore()
  const categorias = db.categoriasModelos || []
  const base = modelo || {
    nombre: '', categoria: categorias[0] || 'Básicas', peso_gr: 150, diametro_cm: 6,
    piezas_por_molde: 6, lote_base: 50, notas_produccion: '',
    tiempos: ETAPAS.map((e) => ({ id: `mt-${e}`, etapa: e, minutos_estimados: 20 })),
  }
  const [f, setF] = useState({ ...base })
  const [nuevaCat, setNuevaCat] = useState('')

  const agregarCat = () => {
    const n = nuevaCat.trim()
    if (!n || categorias.includes(n)) return
    update((d) => { d.categoriasModelos = [...(d.categoriasModelos || []), n]; return d })
    setF({ ...f, categoria: n }); setNuevaCat('')
  }
  const guardar = () => {
    const payload = {
      ...f,
      peso_gr: Number(f.peso_gr) || 0, diametro_cm: Number(f.diametro_cm) || 0,
      piezas_por_molde: Number(f.piezas_por_molde) || 1, lote_base: Number(f.lote_base) || 50,
      activo: modelo ? f.activo : true,
      tiempos: f.tiempos.map((t) => ({ ...t, id: String(t.id).startsWith('mt-') ? uid('mt') : t.id, minutos_estimados: Number(t.minutos_estimados) || 0 })),
    }
    if (modelo) { updateIn('modelos', modelo.id, payload); onDone?.(modelo.id) }
    else { const id = addTo('modelos', payload, 'mod'); onDone?.(id) }
  }

  return (
    <Card className="p-4 border-2 border-amber/40 mb-4">
      <h4 className="font-display text-lg text-coffee mb-3">{modelo ? `Editar modelo: ${modelo.nombre}` : 'Nuevo modelo'}</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Field label="Nombre" className="col-span-2 md:col-span-1"><Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
        <Field label="Categoría">
          <div className="flex gap-1">
            <Select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} className="flex-1">
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
        </Field>
        <Field label="Tamaño de lote base"><Input type="number" value={f.lote_base} onChange={(e) => setF({ ...f, lote_base: e.target.value })} /></Field>
        <Field label="Peso (gr)"><Input type="number" value={f.peso_gr} onChange={(e) => setF({ ...f, peso_gr: e.target.value })} /></Field>
        <Field label="Diámetro (cm)"><Input type="number" value={f.diametro_cm} onChange={(e) => setF({ ...f, diametro_cm: e.target.value })} /></Field>
        <Field label="Piezas por molde"><Input type="number" value={f.piezas_por_molde} onChange={(e) => setF({ ...f, piezas_por_molde: e.target.value })} /></Field>
      </div>
      <div className="flex gap-1 items-end mt-2">
        <div className="w-56"><Field label="Agregar categoría nueva"><Input value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && agregarCat()} placeholder="Ej. Aromaterapia" /></Field></div>
        <Button size="sm" variant="subtle" onClick={agregarCat} disabled={!nuevaCat.trim()}>+ categoría</Button>
      </div>
      <Field label="Notas de producción" className="mt-2"><Textarea value={f.notas_produccion} onChange={(e) => setF({ ...f, notas_produccion: e.target.value })} /></Field>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-amber font-medium">Tiempos por etapa (min / lote base)</summary>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {f.tiempos.map((t, i) => (
            <Field key={t.etapa} label={t.etapa}>
              <Input type="number" value={t.minutos_estimados} onChange={(e) => { const tiempos = f.tiempos.map((x, j) => j === i ? { ...x, minutos_estimados: e.target.value } : x); setF({ ...f, tiempos }) }} />
            </Field>
          ))}
        </div>
      </details>
      <div className="flex gap-2 mt-4">
        <Button variant="sage" onClick={guardar} disabled={!f.nombre}>Guardar modelo</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </Card>
  )
}

// -------- Editor de Insumo (para fragancias, pabilos y cualquier insumo) --------
export function InsumoEditor({ insumo, categoria = 'Otros', onDone, onCancel }) {
  const { db, addTo, updateIn } = useStore()
  const base = insumo || {
    nombre: '', categoria, proveedor: '', presentacion: '', cantidad_presentacion: 0,
    unidad_minima: categoria === 'Pabilos' ? 'pieza' : 'gr', precio_presentacion_sin_iva: 0,
    stock_actual: 0, stock_minimo: 0, stock_maximo: 0, notas: '', activo: true,
  }
  const [f, setF] = useState({ ...base })
  const guardar = () => {
    const payload = {
      ...f, cantidad_presentacion: Number(f.cantidad_presentacion) || 0,
      precio_presentacion_sin_iva: Number(f.precio_presentacion_sin_iva) || 0,
      stock_actual: Number(f.stock_actual) || 0, stock_minimo: Number(f.stock_minimo) || 0,
      stock_maximo: Number(f.stock_maximo) || 0, activo: true,
    }
    if (insumo) { updateIn('insumos', insumo.id, payload); onDone?.(insumo.id) }
    else { const id = addTo('insumos', payload, 'ins'); onDone?.(id) }
  }
  return (
    <Card className="p-4 border-2 border-amber/40 mb-4">
      <h4 className="font-display text-lg text-coffee mb-3">{insumo ? `Editar: ${insumo.nombre}` : `Nuevo insumo (${categoria})`}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Nombre" className="col-span-2"><Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
        <Field label="Proveedor"><Input value={f.proveedor} onChange={(e) => setF({ ...f, proveedor: e.target.value })} /></Field>
        <Field label="Presentación"><Input value={f.presentacion} onChange={(e) => setF({ ...f, presentacion: e.target.value })} placeholder="frasco 250 gr" /></Field>
        <Field label="Cantidad"><Input type="number" value={f.cantidad_presentacion} onChange={(e) => setF({ ...f, cantidad_presentacion: e.target.value })} /></Field>
        <Field label="Unidad">
          <Select value={f.unidad_minima} onChange={(e) => setF({ ...f, unidad_minima: e.target.value })}>
            {UNIDADES.map((u) => <option key={u}>{u}</option>)}
          </Select>
        </Field>
        <Field label="Precio s/IVA"><Input type="number" value={f.precio_presentacion_sin_iva} onChange={(e) => setF({ ...f, precio_presentacion_sin_iva: e.target.value })} /></Field>
        <Field label="Stock actual"><Input type="number" value={f.stock_actual} onChange={(e) => setF({ ...f, stock_actual: e.target.value })} /></Field>
        <Field label="Stock mínimo"><Input type="number" value={f.stock_minimo} onChange={(e) => setF({ ...f, stock_minimo: e.target.value })} /></Field>
        <Field label="Stock máximo"><Input type="number" value={f.stock_maximo} onChange={(e) => setF({ ...f, stock_maximo: e.target.value })} /></Field>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="sage" onClick={guardar} disabled={!f.nombre}>Guardar</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </Card>
  )
}

// -------- Configuración por tipo de catálogo --------
function useConfig(kind) {
  const store = useStore()
  const { db } = store
  const insumos = db.insumos || []
  switch (kind) {
    case 'modelo':
      return { options: db.modelos || [], label: (m) => m.nombre, coll: 'modelos',
        Editor: ({ item, onDone, onCancel }) => <ModeloEditor modelo={item} onDone={onDone} onCancel={onCancel} /> }
    case 'blend':
      return { options: db.blends || [], label: (b) => b.nombre, coll: 'blends',
        Editor: ({ item, onDone, onCancel }) => <BlendEditor db={db} addTo={store.addTo} updateIn={store.updateIn} blend={item} onDone={onDone} onCancel={onCancel} /> }
    case 'color':
      return { options: db.colores || [], label: (c) => `${c.codigo} — ${c.nombre}`, coll: 'colores',
        Editor: ({ item, onDone, onCancel }) => <ColorEditor db={db} addTo={store.addTo} updateIn={store.updateIn} color={item} onDone={onDone} onCancel={onCancel} /> }
    case 'fragancia':
      return { options: insumos.filter((i) => i.categoria === 'Fragancias' && i.activo), label: (i) => i.nombre, coll: 'insumos',
        Editor: ({ item, onDone, onCancel }) => <InsumoEditor insumo={item} categoria="Fragancias" onDone={onDone} onCancel={onCancel} /> }
    case 'pabilo':
      return { options: insumos.filter((i) => i.categoria === 'Pabilos' && i.activo), label: (i) => i.nombre, coll: 'insumos',
        Editor: ({ item, onDone, onCancel }) => <InsumoEditor insumo={item} categoria="Pabilos" onDone={onDone} onCancel={onCancel} /> }
    default:
      return { options: [], label: () => '', Editor: () => null }
  }
}

// -------- Componente principal: select + editar + nuevo --------
export default function CatalogField({ label, hint, kind, value, onChange, className = '', placeholder }) {
  const cfg = useConfig(kind)
  const [editor, setEditor] = useState(null) // 'new' | 'edit'
  const selected = cfg.options.find((o) => o.id === value)

  return (
    <Field label={label} hint={hint} className={className}>
      {editor && (
        <cfg.Editor
          item={editor === 'edit' ? selected : null}
          onDone={(id) => { onChange(id); setEditor(null) }}
          onCancel={() => setEditor(null)}
        />
      )}
      <div className="flex gap-1">
        <Select value={value} onChange={(e) => onChange(e.target.value)} className="flex-1">
          {placeholder && <option value="">{placeholder}</option>}
          {cfg.options.map((o) => <option key={o.id} value={o.id}>{cfg.label(o)}</option>)}
        </Select>
        <Button size="sm" variant="ghost" onClick={() => setEditor('edit')} disabled={!selected} title="Editar opción">✎</Button>
        <Button size="sm" variant="subtle" onClick={() => setEditor('new')} title="Nueva opción">+</Button>
      </div>
    </Field>
  )
}
