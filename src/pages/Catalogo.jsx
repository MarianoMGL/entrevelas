import { useState } from 'react'
import { useStore } from '../lib/store'
import { ETAPAS } from '../lib/seed'
import { Card, SectionTitle, Button, Badge, Input, Select, Field, Toggle, Textarea, EmptyState } from '../components/ui'
import { num, minutosLote50, minutosPorPieza } from '../lib/calc'

const CATEGORIAS = ['Florales', 'Navidad', 'Día de Muertos', 'Temporada', 'Básicas']

const nuevoModelo = () => ({
  nombre: '', categoria: 'Básicas', peso_gr: 150, diametro_cm: 6, piezas_por_molde: 6,
  activo: true, notas_produccion: '',
  tiempos: ETAPAS.map((etapa) => ({ id: `mt-${etapa}`, etapa, minutos_estimados: 20 })),
})

export default function Catalogo() {
  const { db, addTo, updateIn, removeFrom, uid } = useStore()
  const [expand, setExpand] = useState(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState(nuevoModelo())
  const modelos = db.modelos || []

  const save = () => {
    const tiempos = draft.tiempos.map((t) => ({ ...t, id: uid('mt'), minutos_estimados: Number(t.minutos_estimados) || 0 }))
    addTo('modelos', {
      ...draft, tiempos,
      peso_gr: Number(draft.peso_gr) || 0,
      diametro_cm: Number(draft.diametro_cm) || 0,
      piezas_por_molde: Number(draft.piezas_por_molde) || 1,
    }, 'mod')
    setDraft(nuevoModelo()); setAdding(false)
  }

  return (
    <div>
      <SectionTitle
        sub="Modelos del catálogo con tiempos de producción por etapa (lote de 50 piezas)"
        action={<Button variant="amber" onClick={() => setAdding((v) => !v)}>+ Nuevo modelo</Button>}
      >
        Catálogo de Modelos
      </SectionTitle>

      {adding && <ModeloForm draft={draft} setDraft={setDraft} onSave={save} onCancel={() => setAdding(false)} nuevo />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modelos.map((m) => {
          const minPieza = minutosPorPieza(m)
          return (
            <Card key={m.id} className={`p-5 ${!m.activo ? 'opacity-60' : ''}`}>
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
                <span className="text-ink/55">⏱ {num(minutosLote50(m))} min / lote 50</span>
                <span className="text-amber font-semibold">{num(minPieza, 1)} min/pz</span>
              </div>
              {m.notas_produccion && <p className="text-xs text-ink/50 mt-2 italic">{m.notas_produccion}</p>}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setExpand(expand === m.id ? null : m.id)}>
                  {expand === m.id ? 'Ocultar tiempos' : 'Ver tiempos'}
                </Button>
                <button
                  onClick={() => { if (confirm(`¿Eliminar "${m.nombre}"?`)) removeFrom('modelos', m.id) }}
                  className="text-alert text-xs hover:underline ml-auto self-center"
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

function ModeloForm({ draft, setDraft, onSave, onCancel }) {
  return (
    <Card className="p-5 mb-5 border-2 border-amber/40">
      <h3 className="font-display text-lg text-coffee mb-3">Nuevo modelo</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Field label="Nombre" className="col-span-2 md:col-span-1"><Input value={draft.nombre} onChange={(e) => setDraft({ ...draft, nombre: e.target.value })} /></Field>
        <Field label="Categoría">
          <Select value={draft.categoria} onChange={(e) => setDraft({ ...draft, categoria: e.target.value })}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Peso total (gr)"><Input type="number" value={draft.peso_gr} onChange={(e) => setDraft({ ...draft, peso_gr: e.target.value })} /></Field>
        <Field label="Diámetro (cm)"><Input type="number" value={draft.diametro_cm} onChange={(e) => setDraft({ ...draft, diametro_cm: e.target.value })} /></Field>
        <Field label="Piezas por molde"><Input type="number" value={draft.piezas_por_molde} onChange={(e) => setDraft({ ...draft, piezas_por_molde: e.target.value })} /></Field>
        <Field label="Notas de producción" className="col-span-2 md:col-span-3"><Textarea value={draft.notas_produccion} onChange={(e) => setDraft({ ...draft, notas_produccion: e.target.value })} /></Field>
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-amber font-medium">Tiempos por etapa (min / lote 50)</summary>
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
