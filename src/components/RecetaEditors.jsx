import { useState } from 'react'
import { Card, Button, Input, Select, Field, Badge } from './ui'
import { num, precioPorUnidad } from '../lib/calc'

// Editor de Blend de cera. blend=null → crear nuevo.
export function BlendEditor({ db, addTo, updateIn, blend, onDone, onCancel }) {
  const ceras = (db.insumos || []).filter((i) => i.categoria === 'Ceras' && i.activo)
  const [nombre, setNombre] = useState(blend?.nombre || '')
  const [envio, setEnvio] = useState(blend?.costo_envio ?? 0)
  const [comps, setComps] = useState(
    blend?.componentes?.length ? blend.componentes.map((c) => ({ ...c })) : [{ insumo_id: ceras[0]?.id || '', porcentaje: 100 }]
  )

  const totalPct = comps.reduce((s, c) => s + (Number(c.porcentaje) || 0), 0)
  const setComp = (i, patch) => setComps(comps.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const addComp = () => setComps([...comps, { insumo_id: ceras[0]?.id || '', porcentaje: 0 }])
  const delComp = (i) => setComps(comps.filter((_, j) => j !== i))

  const guardar = () => {
    const payload = {
      nombre: nombre.trim(),
      costo_envio: Number(envio) || 0,
      activo: true,
      componentes: comps.map((c) => ({ insumo_id: c.insumo_id, porcentaje: Number(c.porcentaje) || 0 })),
    }
    if (blend) { updateIn('blends', blend.id, payload); onDone?.(blend.id) }
    else { const id = addTo('blends', payload, 'blend'); onDone?.(id) }
  }

  return (
    <Card className="p-4 border-2 border-amber/40 mb-4">
      <h4 className="font-display text-lg text-coffee mb-3">{blend ? `Editar blend: ${blend.nombre}` : 'Nuevo blend'}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <Field label="Nombre del blend" className="md:col-span-2"><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Blend Soya-Palma" /></Field>
        <Field label="Costo de envío del lote ($)"><Input type="number" value={envio} onChange={(e) => setEnvio(e.target.value)} /></Field>
      </div>
      <div className="rounded-xl border border-[#efe7dd] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f4ede4] text-ink/60 text-xs uppercase">
            <tr><th className="px-3 py-2 text-left">Cera</th><th className="px-3 py-2 text-right w-28">% en blend</th><th className="px-3 py-2 text-right">$ / gr</th><th className="w-10"></th></tr>
          </thead>
          <tbody>
            {comps.map((c, i) => {
              const ins = db.insumos.find((x) => x.id === c.insumo_id)
              return (
                <tr key={i} className="border-t border-[#efe7dd]">
                  <td className="px-3 py-2">
                    <Select value={c.insumo_id} onChange={(e) => setComp(i, { insumo_id: e.target.value })}>
                      {ceras.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                    </Select>
                  </td>
                  <td className="px-3 py-2"><Input type="number" className="text-right" value={c.porcentaje} onChange={(e) => setComp(i, { porcentaje: e.target.value })} /></td>
                  <td className="px-3 py-2 text-right text-ink/50">{ins ? `$${num(precioPorUnidad(ins), 3)}` : '—'}</td>
                  <td className="px-2 text-center">
                    {comps.length > 1 && <button onClick={() => delComp(i)} className="text-alert hover:underline text-lg leading-none">×</button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-2">
        <Button size="sm" variant="subtle" onClick={addComp}>+ Agregar cera</Button>
        <Badge tone={totalPct === 100 ? 'green' : 'amber'}>Total: {num(totalPct)}%{totalPct !== 100 ? ' (debe sumar 100%)' : ''}</Badge>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="sage" onClick={guardar} disabled={!nombre.trim() || !comps.every((c) => c.insumo_id)}>Guardar blend</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </Card>
  )
}

// Editor de Color. color=null → crear nuevo.
export function ColorEditor({ db, addTo, updateIn, color, onDone, onCancel }) {
  const colorantes = (db.insumos || []).filter((i) => i.categoria === 'Colorantes' && i.activo)
  const [codigo, setCodigo] = useState(color?.codigo || '')
  const [nombre, setNombre] = useState(color?.nombre || '')
  const [tempMezcla, setTempMezcla] = useState(color?.temp_mezcla ?? '')
  const [notas, setNotas] = useState(color?.notas || '')
  const [comps, setComps] = useState(
    color?.componentes?.length ? color.componentes.map((c) => ({ ...c })) : [{ insumo_id: colorantes[0]?.id || '', gramos: 1 }]
  )

  const setComp = (i, patch) => setComps(comps.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const addComp = () => setComps([...comps, { insumo_id: colorantes[0]?.id || '', gramos: 0 }])
  const delComp = (i) => setComps(comps.filter((_, j) => j !== i))
  const totalGr = comps.reduce((s, c) => s + (Number(c.gramos) || 0), 0)

  const guardar = () => {
    const payload = {
      codigo: codigo.trim(), nombre: nombre.trim(),
      tipo_cera: color?.tipo_cera || '', temp_mezcla: Number(tempMezcla) || null,
      temp_vertido: color?.temp_vertido || null, notas,
      componentes: comps.map((c) => ({ insumo_id: c.insumo_id, gramos: Number(c.gramos) || 0 })),
    }
    if (color) { updateIn('colores', color.id, payload); onDone?.(color.id) }
    else { const id = addTo('colores', payload, 'color'); onDone?.(id) }
  }

  return (
    <Card className="p-4 border-2 border-amber/40 mb-4">
      <h4 className="font-display text-lg text-coffee mb-3">{color ? `Editar color: ${color.codigo} — ${color.nombre}` : 'Nuevo color'}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <Field label="Código"><Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="B-004" /></Field>
        <Field label="Nombre" className="md:col-span-2"><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Galleta" /></Field>
        <Field label="Temp. mezcla (°C)"><Input type="number" value={tempMezcla} onChange={(e) => setTempMezcla(e.target.value)} /></Field>
      </div>
      <div className="rounded-xl border border-[#efe7dd] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#f4ede4] text-ink/60 text-xs uppercase">
            <tr><th className="px-3 py-2 text-left">Colorante</th><th className="px-3 py-2 text-right w-28">Gramos</th><th className="px-3 py-2 text-right">$ / gr</th><th className="w-10"></th></tr>
          </thead>
          <tbody>
            {comps.map((c, i) => {
              const ins = db.insumos.find((x) => x.id === c.insumo_id)
              return (
                <tr key={i} className="border-t border-[#efe7dd]">
                  <td className="px-3 py-2">
                    <Select value={c.insumo_id} onChange={(e) => setComp(i, { insumo_id: e.target.value })}>
                      {colorantes.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                    </Select>
                  </td>
                  <td className="px-3 py-2"><Input type="number" className="text-right" value={c.gramos} onChange={(e) => setComp(i, { gramos: e.target.value })} /></td>
                  <td className="px-3 py-2 text-right text-ink/50">{ins ? `$${num(precioPorUnidad(ins), 3)}` : '—'}</td>
                  <td className="px-2 text-center">
                    {comps.length > 1 && <button onClick={() => delComp(i)} className="text-alert hover:underline text-lg leading-none">×</button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-2">
        <Button size="sm" variant="subtle" onClick={addComp}>+ Agregar colorante</Button>
        <span className="text-xs text-ink/50">Total: {num(totalGr, 1)} gr de colorante</span>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="sage" onClick={guardar} disabled={!nombre.trim() || !comps.every((c) => c.insumo_id)}>Guardar color</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </Card>
  )
}
