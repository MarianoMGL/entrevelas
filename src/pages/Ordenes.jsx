import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Button, Badge, Input, Select, Field, Toggle, Textarea, EmptyState } from '../components/ui'
import { fmtFecha, mxn } from '../lib/calc'
import { PASOS } from '../components/FlameProgress'

const ESTADOS = ['Todos', 'En proceso', 'En reposo', 'Listo', 'Entregado']
const estadoTone = { 'En proceso': 'amber', 'En reposo': 'coffee', 'Listo': 'green', 'Entregado': 'neutral' }

export default function Ordenes() {
  const { db, addTo, updateIn, nextOrderNumber, modelosById } = useStore()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [filtroModelo, setFiltroModelo] = useState('Todos')

  const today = new Date().toISOString().slice(0, 10)
  const fin = new Date(); fin.setDate(fin.getDate() + 7)
  const [form, setForm] = useState({
    modelo_id: '', piezas: 30, fecha_inicio: today,
    fecha_entrega_estimada: fin.toISOString().slice(0, 10),
    personalizado: false, cargo_extra_personalizacion: 0, elaboro: 'Ambas', observaciones: '',
  })

  const ordenes = db.ordenes || []
  const modelos = db.modelos || []

  const filtered = useMemo(() => {
    return [...ordenes]
      .filter((o) => filtroEstado === 'Todos' || o.estado === filtroEstado)
      .filter((o) => filtroModelo === 'Todos' || o.modelo_id === filtroModelo)
      .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
  }, [ordenes, filtroEstado, filtroModelo])

  const crear = () => {
    const numero = nextOrderNumber()
    const id = addTo('ordenes', {
      numero_orden: numero,
      modelo_id: form.modelo_id,
      piezas: Number(form.piezas) || 0,
      fecha_inicio: new Date(form.fecha_inicio).toISOString(),
      fecha_entrega_estimada: new Date(form.fecha_entrega_estimada).toISOString(),
      personalizado: form.personalizado,
      cargo_extra_personalizacion: Number(form.cargo_extra_personalizacion) || 0,
      elaboro: form.elaboro,
      observaciones: form.observaciones,
      estado: 'En proceso',
      paso_actual: 1,
      creado_en: new Date().toISOString(),
      pasos: {},
    }, 'op')
    setCreating(false)
    navigate(`/ordenes/${id}`)
  }

  return (
    <div>
      <SectionTitle
        sub="El documento madre que agrupa cada lote de producción"
        action={<Button variant="amber" onClick={() => setCreating((v) => !v)}>+ Nueva orden</Button>}
      >
        Órdenes de Producción
      </SectionTitle>

      {creating && (
        <Card className="p-5 mb-5 border-2 border-amber/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-coffee">Nueva orden · {nextOrderNumber()}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Modelo a producir" className="col-span-2 md:col-span-1">
              <Select value={form.modelo_id} onChange={(e) => setForm({ ...form, modelo_id: e.target.value })}>
                <option value="">Selecciona…</option>
                {modelos.filter((m) => m.activo).map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </Select>
            </Field>
            <Field label="Cantidad de piezas"><Input type="number" value={form.piezas} onChange={(e) => setForm({ ...form, piezas: e.target.value })} /></Field>
            <Field label="Quién elabora">
              <Select value={form.elaboro} onChange={(e) => setForm({ ...form, elaboro: e.target.value })}>
                <option>Socia 1</option><option>Socia 2</option><option>Ambas</option>
              </Select>
            </Field>
            <Field label="Fecha de inicio"><Input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} /></Field>
            <Field label="Entrega estimada"><Input type="date" value={form.fecha_entrega_estimada} onChange={(e) => setForm({ ...form, fecha_entrega_estimada: e.target.value })} /></Field>
            <div className="flex items-end pb-2">
              <Toggle checked={form.personalizado} onChange={(v) => setForm({ ...form, personalizado: v })} label="¿Pedido personalizado?" />
            </div>
            {form.personalizado && (
              <Field label="Cargo extra personalización ($)"><Input type="number" value={form.cargo_extra_personalizacion} onChange={(e) => setForm({ ...form, cargo_extra_personalizacion: e.target.value })} /></Field>
            )}
            <Field label="Observaciones" className="col-span-2 md:col-span-3"><Textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></Field>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="sage" onClick={crear} disabled={!form.modelo_id}>Crear orden e iniciar flujo →</Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="w-44">
          <Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            {ESTADOS.map((e) => <option key={e}>{e}</option>)}
          </Select>
        </div>
        <div className="w-56">
          <Select value={filtroModelo} onChange={(e) => setFiltroModelo(e.target.value)}>
            <option value="Todos">Todos los modelos</option>
            {modelos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f4ede4] text-ink/60 text-left text-xs uppercase tracking-wide">
                <th className="px-4 py-2.5 font-semibold">Orden</th>
                <th className="px-4 py-2.5 font-semibold">Modelo</th>
                <th className="px-4 py-2.5 font-semibold text-right">Piezas</th>
                <th className="px-4 py-2.5 font-semibold">Inicio</th>
                <th className="px-4 py-2.5 font-semibold">Entrega</th>
                <th className="px-4 py-2.5 font-semibold">Paso</th>
                <th className="px-4 py-2.5 font-semibold">Estado</th>
                <th className="px-4 py-2.5 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-[#efe7dd] hover:bg-cream/40">
                  <td className="px-4 py-3 font-semibold text-coffee">
                    {o.numero_orden}
                    {o.personalizado && <Badge tone="amber" className="ml-2">★ personalizado</Badge>}
                  </td>
                  <td className="px-4 py-3 text-ink/80">{modelosById[o.modelo_id]?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{o.piezas}</td>
                  <td className="px-4 py-3 text-ink/60">{fmtFecha(o.fecha_inicio)}</td>
                  <td className="px-4 py-3 text-ink/60">{fmtFecha(o.fecha_entrega_estimada)}</td>
                  <td className="px-4 py-3 text-ink/60 text-xs">{o.estado === 'Entregado' ? '—' : `${o.paso_actual}/6 · ${PASOS[o.paso_actual - 1]?.corto}`}</td>
                  <td className="px-4 py-3"><Badge tone={estadoTone[o.estado]}>{o.estado}</Badge></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link to={`/ordenes/${o.id}`} className="text-amber font-medium hover:underline text-xs">Abrir flujo →</Link>
                    {(o.estado === 'Listo' || o.estado === 'Entregado') && (
                      <Link to={`/ordenes/${o.id}/ficha`} className="text-coffee hover:underline text-xs ml-3">Ficha</Link>
                    )}
                    {o.estado === 'Listo' && (
                      <button onClick={() => updateIn('ordenes', o.id, { estado: 'Entregado' })} className="text-sage hover:underline text-xs ml-3">Entregar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState title="Sin órdenes" sub="Crea tu primera orden de producción" />}
      </Card>
    </div>
  )
}
