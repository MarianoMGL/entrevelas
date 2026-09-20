import { useState } from 'react'
import { useStore } from '../lib/store'
import { ETAPAS } from '../lib/seed'
import { Card, SectionTitle, Button, Badge, Input, Select, Field, Toggle, Textarea, EmptyState } from '../components/ui'
import { num, minutosLote50, minutosPorPieza } from '../lib/calc'

const nuevoModelo = (categoria = 'Básicas') => ({
  nombre: '', categoria, peso_gr: 150, diametro_cm: 6, piezas_por_molde: 6, lote_base: 50,
  activo: true, notas_produccion: '',
  tiempos: ETAPAS.map((etapa) => ({ id: `mt-${etapa}`, etapa, minutos_estimados: 20 })),
})

export default function Catalogo() {
  const { db, addTo, updateIn, removeFrom, update, uid } = useStore()
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [draft, setDraft] = useState(nuevoModelo())
  const [expand, setExpand] = useState(null)
  const [gestionCat, setGestionCat] = useState(false)

  const modelos = db.modelos || []
  const categorias = db.categoriasModelos || []

  const normaliza = (m) => ({
    ...m,
    peso_gr: Number(m.peso_gr) || 0,
    diametro_cm: Number(m.diametro_cm) || 0,
    piezas_por_molde: Number(m.piezas_por_molde) || 1,
    lote_base: Number(m.lote_base) || 50,
    tiempos: m.tiempos.map((t) => ({ ...t, id: t.id?.startsWith('mt-') ? uid('mt') : t.id, minutos_estimados: Number(t.minutos_estimados) || 0 })),
  })

  const guardarNuevo = () => { addTo('modelos', normaliza(draft), 'mod'); setDraft(nuevoModelo()); setAdding(false) }
  const guardarEdit = () => { updateIn('modelos', editId, normaliza(draft)); setEditId(null); setDraft(nuevoModelo()) }
  const startEdit = (m) => { setEditId(m.id); setDraft({ ...m }); setAdding(false); setExpand(null) }

  return (
    <div>
      <SectionTitle
        sub="Modelos del catálogo con tiempos de producción por etapa"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setGestionCat((v) => !v)}>🏷️ Categorías</Button>
            <Button variant="amber" onClick={() => { setAdding((v) => !v); setEditId(null); setDraft(nuevoModelo(categorias[0])) }}>+ Nuevo modelo</Button>
          </div>
        }
      >
        Catálogo de Modelos
      </SectionTitle>

      {gestionCat && <GestorCategorias db={db} update={update} modelos={modelos} onClose={() => setGestionCat(false)} />}

      {adding && <ModeloForm draft={draft} setDraft={setDraft} categorias={categorias} onSave={guardarNuevo} onCancel={() => setAdding(false)} titulo="Nuevo modelo" />}
      {editId && <ModeloForm draft={draft} setDraft={setDraft} categorias={categorias} onSave={guardarEdit} onCancel={() => { setEditId(null); setDraft(nuevoModelo()) }} titulo={`Editar: ${draft.nombre}`} />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modelos.map((m) => {
          const lote = m.lote_base || 50
          return (
            <Card key={m.id} className={`p-5 ${!m.activo ? 'opacity-60' : ''} ${editId === m.id ? 'ring-2 ring-amber' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg text-coffee leading-tight">{m.nombre}</h3>
                  <Badge tone="coffee" className="mt-1">{m.categoria}</Badge>
                </div>
                <Toggle checked={m.activo} onChange={(v) => updateIn('modelos', m.id, { activo: v })} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <MiniStat label="Peso" value={`${num(m.peso_gr)} gr`} />
                <MiniStat label="Diámetro" value={`${num(m.diametro_cm, 1)} cm`} />
                <MiniStat label="Por molde" value={`${num(m.piezas_por_molde)} pz`} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-ink/55">⏱ {num(minutosLote50(m))} min / lote {lote}</span>
                <span className="text-amber font-semibold">{num(minutosPorPieza(m), 1)} min/pz</span>
              </div>
              {m.notas_produccion && <p className="text-xs text-ink/50 mt-2 italic">{m.notas_produccion}</p>}
              <div className="mt-3 flex gap-2 items-center">
                <Button size="sm" variant="amber" onClick={() => startEdit(m)}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => setExpand(expand === m.id ? null : m.id)}>
                  {expand === m.id ? 'Ocultar tiempos' : 'Ver tiempos'}
                </Button>
                <button
                  onClick={() => { if (confirm(`¿Eliminar "${m.nombre}"?`)) removeFrom('modelos', m.id) }}
                  className="text-alert text-xs hover:underline ml-auto"
                >Eliminar</button>
              </div>
              {expand === m.id && (
                <div className="mt-3 border-t border-[#efe7dd] pt-3 space-y-1.5">
                  {m.tiempos.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-ink/70 flex-1">{t.etapa}</span>
                      <Input
                        className="w-20 text-right"
                        type="number"
                        value={t.minutos_estimados}
                        onChange={(e) => {
                          const tiempos = m.tiempos.map((x) => x.id === t.id ? { ...x, minutos_estimados: Number(e.target.value) || 0 } : x)
                          updateIn('modelos', m.id, { tiempos })
                        }}
                      />
                      <span className="text-ink/40 text-xs w-8">min</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
      {modelos.length === 0 && <EmptyState title="Sin modelos en el catálogo" sub="Agrega tu primer modelo de vela" />}
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-cream/60 rounded-lg py-2">
      <div className="text-[10px] uppercase tracking-wide text-ink/40">{label}</div>
      <div className="font-semibold text-coffee text-sm">{value}</div>
    </div>
  )
}

function ModeloForm({ draft, setDraft, categorias, onSave, onCancel, titulo }) {
  return (
    <Card className="p-5 mb-5 border-2 border-amber/40">
      <h3 className="font-display text-lg text-coffee mb-3">{titulo}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Field label="Nombre" className="col-span-2 md:col-span-1"><Input value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} /></Field>
        <Field label="Categoría">
          <Select value={draft.categoria} onChange={(e) => setDraft({ ...draft, categoria: e.target.value })}>
            {categorias.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Tamaño de lote base" hint="Tamaño para el que se miden los tiempos"><Input type="number" value={draft.lote_base} onChange={(e) => setDraft({ ...draft, lote_base: e.target.value })} /></Field>
        <Field label="Peso total (gr)"><Input type="number" value={draft.peso_gr} onChange={(e) => setDraft({ ...draft, peso_gr: e.target.value })} /></Field>
        <Field label="Diámetro (cm)"><Input type="number" value={draft.diametro_cm} onChange={(e) => setDraft({ ...draft, diametro_cm: e.target.value })} /></Field>
        <Field label="Piezas por molde"><Input type="number" value={draft.piezas_por_molde} onChange={(e) => setDraft({ ...draft, piezas_por_molde: e.target.value })} /></Field>
        <Field label="Notas de producción" className="col-span-2 md:col-span-3"><Textarea value={draft.notas_produccion} onChange={(e) => setDraft({ ...draft, notas_produccion: e.target.value })} /></Field>
      </div>
      <details className="mt-3" open>
        <summary className="cursor-pointer text-sm text-amber font-medium">Tiempos por etapa (min / lote base)</summary>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
          {draft.tiempos.map((t, i) => (
            <Field key={t.etapa} label={t.etapa}>
              <Input type="number" value={t.minutos_estimados} onChange={(e) => {
                const tiempos = draft.tiempos.map((x, j) => j === i ? { ...x, minutos_estimados: e.target.value } : x)
                setDraft({ ...draft, tiempos })
              }} />
            </Field>
          ))}
        </div>
      </details>
      <div className="flex gap-2 mt-4">
        <Button variant="sage" onClick={onSave} disabled={!draft.nombre}>Guardar modelo</Button>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </Card>
  )
}

function GestorCategorias({ db, update, modelos, onClose }) {
  const categorias = db.categoriasModelos || []
  const [nueva, setNueva] = useState('')
  const [editando, setEditando] = useState(null)
  const [nombreEdit, setNombreEdit] = useState('')

  const enUso = (c) => modelos.filter((m) => m.categoria === c).length

  const agregar = () => {
    const n = nueva.trim()
    if (!n || categorias.includes(n)) return
    update((d) => { d.categoriasModelos = [...(d.categoriasModelos || []), n]; return d })
    setNueva('')
  }
  const renombrar = (viejo) => {
    const n = nombreEdit.trim()
    if (!n || (n !== viejo && categorias.includes(n))) { setEditando(null); return }
    update((d) => {
      d.categoriasModelos = (d.categoriasModelos || []).map((c) => c === viejo ? n : c)
      d.modelos = (d.modelos || []).map((m) => m.categoria === viejo ? { ...m, categoria: n } : m)
      return d
    })
    setEditando(null)
  }
  const eliminar = (c) => {
    const uso = enUso(c)
    if (uso > 0 && !confirm(`${uso} modelo(s) usan "${c}". Se quedarán sin categoría asignada. ¿Eliminar?`)) return
    update((d) => { d.categoriasModelos = (d.categoriasModelos || []).filter((x) => x !== c); return d })
  }

  return (
    <Card className="p-5 mb-5 border-2 border-coffee/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-coffee">Personalizar categorías</h3>
        <Button size="sm" variant="ghost" onClick={onClose}>Cerrar</Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {categorias.map((c) => (
          <div key={c} className="flex items-center gap-1 bg-cream/70 rounded-lg px-2 py-1.5">
            {editando === c ? (
              <>
                <Input className="w-32 !py-1" value={nombreEdit} onChange={(e) => setNombreEdit(e.target.value)} autoFocus />
                <Button size="sm" variant="sage" onClick={() => renombrar(c)}>✓</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditando(null)}>✕</Button>
              </>
            ) : (
              <>
                <span className="text-sm text-coffee font-medium">{c}</span>
                <span className="text-xs text-ink/40">({enUso(c)})</span>
                <button className="text-amber text-xs hover:underline ml-1" onClick={() => { setEditando(c); setNombreEdit(c) }}>editar</button>
                <button className="text-alert text-xs hover:underline" onClick={() => eliminar(c)}>×</button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <div className="w-56"><Field label="Nueva categoría"><Input value={nueva} onChange={(e) => setNueva(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && agregar()} placeholder="Ej. Aromaterapia" /></Field></div>
        <Button variant="amber" onClick={agregar} disabled={!nueva.trim()}>+ Agregar</Button>
      </div>
    </Card>
  )
}
