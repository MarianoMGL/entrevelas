import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Card, Button, Badge, Input, Select, Field, Toggle, Checkbox, Textarea } from '../components/ui'
import FlameProgress, { PASOS } from '../components/FlameProgress'
import {
  mxn, num, precioPorUnidad, costoBlendPorGr, blendGramos, ceraTotalLote,
  tiempoTranscurrido, horasRestantesCurado, fmtFecha,
} from '../lib/calc'

export default function Flujo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { db, updateIn, insumosById, consumirInsumo } = useStore()
  const orden = (db.ordenes || []).find((o) => o.id === id)
  const [paso, setPaso] = useState(orden?.paso_actual || 1)

  useEffect(() => { if (orden) setPaso(orden.paso_actual) }, [id]) // eslint-disable-line

  if (!orden) {
    return (
      <Card className="p-8 text-center">
        <p className="text-ink/60">Orden no encontrada.</p>
        <Link to="/ordenes" className="text-amber hover:underline">← Volver a órdenes</Link>
      </Card>
    )
  }

  const modelo = db.modelos.find((m) => m.id === orden.modelo_id)

  const savePaso = (key, patch) => {
    const pasos = { ...(orden.pasos || {}), [key]: { ...(orden.pasos?.[key] || {}), ...patch } }
    updateIn('ordenes', orden.id, { pasos })
  }

  const avanzar = (n) => {
    const nextPaso = Math.min(6, n + 1)
    const nuevoEstado = n === 5 ? 'En reposo' : orden.estado === 'Listo' ? 'Listo' : 'En proceso'
    updateIn('ordenes', orden.id, {
      paso_actual: Math.max(orden.paso_actual, nextPaso),
      estado: nuevoEstado,
    })
    setPaso(nextPaso)
  }

  const ctx = { orden, modelo, savePaso, avanzar, insumosById, consumirInsumo, db, updateIn, navigate }

  return (
    <div>
      <Link to="/ordenes" className="text-sm text-amber hover:underline">← Órdenes</Link>

      {/* Barra superior del flujo */}
      <Card className="p-5 mt-3 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl text-coffee">{orden.numero_orden}</span>
              <span className="text-ink/40">·</span>
              <span className="text-ink/80 font-medium">{modelo?.nombre}</span>
              <Badge tone="coffee">{orden.piezas} piezas</Badge>
              {orden.personalizado && <Badge tone="amber">★ personalizado</Badge>}
            </div>
            <div className="text-sm text-ink/55 mt-1">
              🔥 Paso {paso} de 6 — {PASOS[paso - 1]?.nombre} · Iniciado hace {tiempoTranscurrido(orden.fecha_inicio)}
            </div>
          </div>
          <div className="text-right text-sm text-ink/50">
            <div>Elabora: <span className="font-medium text-ink/70">{orden.elaboro}</span></div>
            <div>Entrega: {fmtFecha(orden.fecha_entrega_estimada)}</div>
          </div>
        </div>
        <FlameProgress pasoActual={paso} onSelect={(n) => n <= orden.paso_actual && setPaso(n)} />
      </Card>

      {paso === 1 && <Paso1 {...ctx} />}
      {paso === 2 && <Paso2 {...ctx} />}
      {paso === 3 && <Paso3 {...ctx} />}
      {paso === 4 && <Paso4 {...ctx} />}
      {paso === 5 && <Paso5 {...ctx} />}
      {paso === 6 && <Paso6 {...ctx} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cronómetro reutilizable (guarda segundos en el paso)
// ---------------------------------------------------------------------------
function Timer({ value = 0, onChange, label = 'Tiempo' }) {
  const [running, setRunning] = useState(false)
  const [secs, setSecs] = useState(value)
  const ref = useRef(null)
  useEffect(() => () => clearInterval(ref.current), [])
  const start = () => {
    if (running) return
    setRunning(true)
    ref.current = setInterval(() => setSecs((s) => { const n = s + 1; return n }), 1000)
  }
  const stop = () => {
    setRunning(false)
    clearInterval(ref.current)
    onChange?.(Math.round(secs / 60 * 10) / 10) // guarda minutos con 1 decimal
  }
  const reset = () => { setRunning(false); clearInterval(ref.current); setSecs(0); onChange?.(0) }
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  return (
    <div className="flex items-center gap-3">
      <div className="font-display text-3xl text-coffee tabular-nums w-28">{mm}:{ss}</div>
      {!running ? <Button size="sm" variant="sage" onClick={start}>▶ Iniciar</Button>
        : <Button size="sm" variant="amber" onClick={stop}>⏸ Detener</Button>}
      <Button size="sm" variant="ghost" onClick={reset}>↺</Button>
      <span className="text-xs text-ink/40">{label}: {num(value, 1)} min guardados</span>
    </div>
  )
}

function PasoCard({ titulo, paso, children, onComplete, completeLabel, canComplete = true }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">{['🕯️', '🎨', '🌸', '🔀', '🫗', '⏳'][paso - 1]}</span>
        <h2 className="font-display text-xl text-coffee">Paso {paso} — {titulo}</h2>
      </div>
      <div className="space-y-5">{children}</div>
      {onComplete && (
        <div className="mt-6 pt-4 border-t border-[#efe7dd] flex justify-end">
          <Button variant="amber" size="lg" onClick={onComplete} disabled={!canComplete}>{completeLabel} →</Button>
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// PASO 1 — Preparación de cera (blend)
// ---------------------------------------------------------------------------
function Paso1({ orden, modelo, savePaso, avanzar, insumosById, consumirInsumo, db }) {
  const d = orden.pasos?.paso1 || {}
  const [blendId, setBlendId] = useState(d.blend_id || db.blends?.[0]?.id || '')
  const [merma, setMerma] = useState(d.merma_pct ?? db.config?.merma_default_pct ?? 8)
  const [tempDerretido, setTempDerretido] = useState(d.temp_derretido ?? '')
  const [tiempo, setTiempo] = useState(d.tiempo_min ?? 0)
  const [obs, setObs] = useState(d.observaciones || '')
  const [pesados, setPesados] = useState(d.pesados || {})

  const blend = db.blends.find((b) => b.id === blendId)
  const ceraTotal = ceraTotalLote(modelo?.peso_gr || 0, orden.piezas, Number(merma) || 0)
  const filas = useMemo(() => {
    if (!blend) return []
    return blendGramos(blend, ceraTotal).map((c) => {
      const ins = insumosById[c.insumo_id]
      return { ...c, insumo: ins, costo: ins ? precioPorUnidad(ins) * c.gramos : 0 }
    })
  }, [blend, ceraTotal, insumosById])
  const costoTotal = filas.reduce((s, f) => s + f.costo, 0) + (blend?.costo_envio || 0)
  const costoPorGr = costoBlendPorGr(blend, insumosById, ceraTotal)

  const persist = (patch) => savePaso('paso1', {
    blend_id: blendId, cera_total_gr: ceraTotal, merma_pct: Number(merma), temp_derretido: tempDerretido,
    tiempo_min: tiempo, observaciones: obs, pesados, ...patch,
  })

  const completar = () => {
    if (!d._descontado) {
      filas.forEach((f) => { if (f.insumo) consumirInsumo(f.insumo.id, f.gramos, orden.id, `Blend ${blend?.nombre} · ${orden.numero_orden}`) })
    }
    persist({ _descontado: true })
    avanzar(1)
  }

  return (
    <PasoCard paso={1} titulo="Preparación de cera (blend)" onComplete={completar} completeLabel="Cera lista" canComplete={!!blend}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Blend a usar">
          <Select value={blendId} onChange={(e) => { setBlendId(e.target.value); }}>
            {db.blends.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Merma %" hint="Default 8%, editable">
          <Input type="number" value={merma} onChange={(e) => setMerma(e.target.value)} />
        </Field>
        <div className="bg-amber/10 rounded-xl p-3 flex flex-col justify-center">
          <span className="text-xs uppercase text-ink/50">Cera total a preparar</span>
          <span className="font-display text-2xl text-amber">{num(ceraTotal)} gr</span>
          <span className="text-xs text-ink/50">{modelo?.peso_gr} gr × {orden.piezas} pz × (1 + {merma}%)</span>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-coffee mb-2 text-sm">Insumos a pesar</h4>
        <div className="overflow-x-auto rounded-xl border border-[#efe7dd]">
          <table className="w-full text-sm">
            <thead className="bg-[#f4ede4] text-ink/60 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Insumo</th>
                <th className="px-3 py-2 text-right">% blend</th>
                <th className="px-3 py-2 text-right">Gramos a pesar</th>
                <th className="px-3 py-2 text-right">Costo parcial</th>
                <th className="px-3 py-2 text-center">✓ pesado</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-t border-[#efe7dd]">
                  <td className="px-3 py-2 font-medium">{f.insumo?.nombre || '—'}</td>
                  <td className="px-3 py-2 text-right">{f.porcentaje}%</td>
                  <td className="px-3 py-2 text-right font-semibold text-coffee">{num(f.gramos)} gr</td>
                  <td className="px-3 py-2 text-right tabular-nums">{mxn(f.costo)}</td>
                  <td className="px-3 py-2 text-center">
                    <Checkbox checked={pesados[i]} onChange={(v) => { const np = { ...pesados, [i]: v }; setPesados(np); persist({ pesados: np }) }} />
                  </td>
                </tr>
              ))}
              <tr className="border-t border-[#efe7dd] bg-cream/50 font-semibold">
                <td className="px-3 py-2">Envío del lote</td>
                <td></td><td></td>
                <td className="px-3 py-2 text-right">{mxn(blend?.costo_envio || 0)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-4 mt-2 text-sm">
          <span className="text-ink/60">Costo por gramo: <b className="text-coffee">{mxn(costoPorGr)}</b></span>
          <span className="text-ink/60">Costo del blend: <b className="text-amber">{mxn(costoTotal)}</b></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Temperatura de derretido (°C)">
          <Input type="number" value={tempDerretido} onChange={(e) => { setTempDerretido(e.target.value); }} onBlur={() => persist({})} placeholder="85" />
        </Field>
        <Field label="Tiempo de derretido (cronómetro)">
          <Timer value={tiempo} onChange={(min) => { setTiempo(min); persist({ tiempo_min: min }) }} label="Derretido" />
        </Field>
      </div>
      <Field label="Observaciones">
        <Textarea value={obs} onChange={(e) => setObs(e.target.value)} onBlur={() => persist({})} placeholder="Notas del blend…" />
      </Field>
      <p className="text-xs text-ink/45">Al completar, se descuentan automáticamente del inventario los gramos pesados de cada cera.</p>
    </PasoCard>
  )
}

// ---------------------------------------------------------------------------
// PASO 2 — Preparación del color
// ---------------------------------------------------------------------------
function Paso2({ orden, modelo, savePaso, avanzar, insumosById, consumirInsumo, db }) {
  const d = orden.pasos?.paso2 || {}
  const [colorId, setColorId] = useState(d.color_id || db.colores?.[0]?.id || '')
  const [tempMezcla, setTempMezcla] = useState(d.temp_mezcla ?? '')
  const [resultado, setResultado] = useState(d.resultado_visual || '')
  const [obs, setObs] = useState(d.observaciones || '')
  const [pesados, setPesados] = useState(d.pesados || {})

  const color = db.colores.find((c) => c.id === colorId)
  const ceraTotal = orden.pasos?.paso1?.cera_total_gr || ceraTotalLote(modelo?.peso_gr || 0, orden.piezas, 8)
  const filas = (color?.componentes || []).map((c) => {
    const ins = insumosById[c.insumo_id]
    return { ...c, insumo: ins, costo: ins ? precioPorUnidad(ins) * c.gramos : 0 }
  })
  const gramosColorante = filas.reduce((s, f) => s + f.gramos, 0)
  const limite = ceraTotal * 0.01
  const excede = gramosColorante > limite

  const persist = (patch) => savePaso('paso2', {
    color_id: colorId, temp_mezcla: tempMezcla, resultado_visual: resultado, observaciones: obs, pesados, ...patch,
  })
  const completar = () => {
    if (!d._descontado) filas.forEach((f) => { if (f.insumo) consumirInsumo(f.insumo.id, f.gramos, orden.id, `Color ${color?.codigo} · ${orden.numero_orden}`) })
    persist({ _descontado: true })
    avanzar(2)
  }

  return (
    <PasoCard paso={2} titulo="Preparación del color" onComplete={completar} completeLabel="Color listo" canComplete={!!color}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Color a usar (biblioteca)">
          <Select value={colorId} onChange={(e) => setColorId(e.target.value)}>
            {db.colores.map((c) => <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Temp. de mezcla con cera (°C)">
          <Input type="number" value={tempMezcla} onChange={(e) => setTempMezcla(e.target.value)} onBlur={() => persist({})} placeholder="70" />
        </Field>
      </div>

      {excede && (
        <div className="bg-alert/10 border border-alert/30 text-alert rounded-xl px-4 py-3 text-sm">
          ⚠ El colorante ({num(gramosColorante, 1)} gr) supera el 1% del peso de cera ({num(limite, 1)} gr). Puede afectar la vela — reduce la cantidad.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#efe7dd]">
        <table className="w-full text-sm">
          <thead className="bg-[#f4ede4] text-ink/60 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Colorante</th>
              <th className="px-3 py-2 text-right">Gramos</th>
              <th className="px-3 py-2 text-right">Costo parcial</th>
              <th className="px-3 py-2 text-center">✓</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i} className="border-t border-[#efe7dd]">
                <td className="px-3 py-2 font-medium">{f.insumo?.nombre || '—'}</td>
                <td className="px-3 py-2 text-right font-semibold text-coffee">{num(f.gramos, 1)} gr</td>
                <td className="px-3 py-2 text-right tabular-nums">{mxn(f.costo)}</td>
                <td className="px-3 py-2 text-center">
                  <Checkbox checked={pesados[i]} onChange={(v) => { const np = { ...pesados, [i]: v }; setPesados(np); persist({ pesados: np }) }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Field label="Resultado visual"><Textarea value={resultado} onChange={(e) => setResultado(e.target.value)} onBlur={() => persist({})} placeholder="Salió más oscuro que B-003, agregar menos café la próxima vez…" /></Field>
      <Field label="Observaciones"><Textarea value={obs} onChange={(e) => setObs(e.target.value)} onBlur={() => persist({})} /></Field>
    </PasoCard>
  )
}

// ---------------------------------------------------------------------------
// PASO 3 — Preparación del aroma
// ---------------------------------------------------------------------------
function Paso3({ orden, modelo, savePaso, avanzar, insumosById, consumirInsumo, db }) {
  const d = orden.pasos?.paso3 || {}
  const fragancias = db.insumos.filter((i) => i.categoria === 'Fragancias' && i.activo)
  const [insumoId, setInsumoId] = useState(d.insumo_id || fragancias[0]?.id || '')
  const [pct, setPct] = useState(d.porcentaje_fragancia ?? 8)
  const [tempMezcla, setTempMezcla] = useState(d.temp_mezcla ?? '')
  const [intensidad, setIntensidad] = useState(d.intensidad ?? 4)
  const [obs, setObs] = useState(d.observaciones || '')

  const frag = insumosById[insumoId]
  const ceraTotal = orden.pasos?.paso1?.cera_total_gr || ceraTotalLote(modelo?.peso_gr || 0, orden.piezas, 8)
  const gramosFrag = ceraTotal * (Number(pct) / 100)
  const costo = frag ? precioPorUnidad(frag) * gramosFrag : 0

  const persist = (patch) => savePaso('paso3', {
    insumo_id: insumoId, porcentaje_fragancia: Number(pct), gramos_fragancia: gramosFrag,
    temp_mezcla: tempMezcla, intensidad: Number(intensidad), observaciones: obs, ...patch,
  })
  const completar = () => {
    if (!d._descontado && frag) consumirInsumo(frag.id, gramosFrag, orden.id, `Fragancia ${frag.nombre} · ${orden.numero_orden}`)
    persist({ _descontado: true })
    avanzar(3)
  }

  return (
    <PasoCard paso={3} titulo="Preparación del aroma" onComplete={completar} completeLabel="Aroma listo" canComplete={!!frag}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Fragancia a usar">
          <Select value={insumoId} onChange={(e) => setInsumoId(e.target.value)}>
            {fragancias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
          </Select>
        </Field>
        <Field label={`% de fragancia: ${pct}%`} hint="Rango recomendado 6–12%">
          <input type="range" min="6" max="12" step="0.5" value={pct} onChange={(e) => { setPct(e.target.value) }} onMouseUp={() => persist({})} className="w-full accent-amber" />
        </Field>
      </div>

      <div className="bg-amber/10 rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-ink/70">Para <b>{num(ceraTotal)} gr</b> de cera → necesitas</span>
        <span className="font-display text-2xl text-amber">{num(gramosFrag)} gr</span>
        <span className="text-sm text-ink/60">≈ {mxn(costo)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Temp. de mezcla con fragancia (°C)" hint="Agregar la fragancia cuando la cera baje de 70°C para no quemarla">
          <Input type="number" value={tempMezcla} onChange={(e) => setTempMezcla(e.target.value)} onBlur={() => persist({})} placeholder="68" />
        </Field>
        <Field label={`Intensidad percibida: ${intensidad}/5`}>
          <input type="range" min="1" max="5" value={intensidad} onChange={(e) => setIntensidad(e.target.value)} onMouseUp={() => persist({})} className="w-full accent-coffee" />
        </Field>
      </div>
      <Field label="Observaciones"><Textarea value={obs} onChange={(e) => setObs(e.target.value)} onBlur={() => persist({})} /></Field>
    </PasoCard>
  )
}

// ---------------------------------------------------------------------------
// PASO 4 — Mezcla e implementación
// ---------------------------------------------------------------------------
function Paso4({ orden, savePaso, avanzar, db }) {
  const d = orden.pasos?.paso4 || {}
  const pabilos = db.insumos.filter((i) => i.categoria === 'Pabilos' && i.activo)
  const [f, setF] = useState({
    temp_vertido: d.temp_vertido ?? '', temp_molde: d.temp_molde ?? '', temp_ambiente: d.temp_ambiente ?? '',
    humedad: d.humedad ?? '', moldes_listos: d.moldes_listos || false, pabilo_id: d.pabilo_id || pabilos[0]?.id || '',
    pabilo_colocado: d.pabilo_colocado || false, rechupe: d.rechupe || false, observaciones: d.observaciones || '',
  })
  const upd = (patch) => { const n = { ...f, ...patch }; setF(n); savePaso('paso4', n) }

  return (
    <PasoCard paso={4} titulo="Mezcla e implementación" onComplete={() => { savePaso('paso4', f); avanzar(4) }} completeLabel="Mezcla lista" canComplete={f.moldes_listos && f.pabilo_colocado}>
      <p className="text-sm text-ink/55">Juntar cera + color + aroma, y preparar los moldes. Estos datos afectan el curado — regístralos antes de verter.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Temp. vertido (°C)"><Input type="number" value={f.temp_vertido} onChange={(e) => upd({ temp_vertido: e.target.value })} placeholder="65" /></Field>
        <Field label="Temp. molde (°C)"><Input type="number" value={f.temp_molde} onChange={(e) => upd({ temp_molde: e.target.value })} placeholder="22" /></Field>
        <Field label="Temp. ambiente (°C)"><Input type="number" value={f.temp_ambiente} onChange={(e) => upd({ temp_ambiente: e.target.value })} placeholder="21" /></Field>
        <Field label="Humedad (%)"><Input type="number" value={f.humedad} onChange={(e) => upd({ humedad: e.target.value })} placeholder="58" /></Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Pabilo a usar">
          <Select value={f.pabilo_id} onChange={(e) => upd({ pabilo_id: e.target.value })}>
            {pabilos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </Select>
        </Field>
        <div className="flex flex-col justify-end gap-3 pb-1">
          <Checkbox checked={f.moldes_listos} onChange={(v) => upd({ moldes_listos: v })} label="✓ Moldes limpios y listos" />
          <Checkbox checked={f.pabilo_colocado} onChange={(v) => upd({ pabilo_colocado: v })} label="✓ Pabilos colocados" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Toggle checked={f.rechupe} onChange={(v) => upd({ rechupe: v })} label="¿Aplica rechupe?" />
        {f.rechupe && <Badge tone="amber">Recordatorio: agregar segunda capa tras el primer curado</Badge>}
      </div>
      <Field label="Observaciones"><Textarea value={f.observaciones} onChange={(e) => upd({ observaciones: e.target.value })} /></Field>
      {(!f.moldes_listos || !f.pabilo_colocado) && <p className="text-xs text-amber">Confirma moldes y pabilos para continuar.</p>}
    </PasoCard>
  )
}

// ---------------------------------------------------------------------------
// PASO 5 — Llenado de moldes
// ---------------------------------------------------------------------------
const PROBLEMAS = ['Burbujas de aire', 'Temperatura de vertido incorrecta', 'Cera se solidificó antes de terminar', 'Derrame o desperdicio']
function Paso5({ orden, savePaso, avanzar }) {
  const d = orden.pasos?.paso5 || {}
  const [llenadas, setLlenadas] = useState(d.piezas_llenadas ?? 0)
  const [problemas, setProblemas] = useState(d.problemas || {})
  const [otro, setOtro] = useState(d.otro_problema || '')
  const [merma, setMerma] = useState(d.merma_real_gr ?? '')
  const [tiempo, setTiempo] = useState(d.tiempo_min ?? 0)
  const [inicio] = useState(d.inicio || new Date().toISOString())

  const persist = (patch) => savePaso('paso5', {
    piezas_llenadas: llenadas, problemas, otro_problema: otro, merma_real_gr: merma, tiempo_min: tiempo, inicio, ...patch,
  })
  const set = (n) => { const v = Math.max(0, Math.min(orden.piezas, n)); setLlenadas(v); persist({ piezas_llenadas: v }) }

  return (
    <PasoCard paso={5} titulo="Llenado de moldes" onComplete={() => { persist({}); avanzar(5) }} completeLabel="Llenado completo">
      <div className="text-xs text-ink/50">Inicio del llenado: {new Date(inicio).toLocaleTimeString('es-MX')}</div>

      <div className="bg-cream/60 rounded-2xl p-6 text-center">
        <div className="text-sm text-ink/55 mb-2">Piezas llenadas</div>
        <div className="flex items-center justify-center gap-6">
          <Button variant="ghost" size="lg" onClick={() => set(llenadas - 1)}>−</Button>
          <div className="font-display text-5xl text-coffee tabular-nums">{llenadas} <span className="text-2xl text-ink/40">de {orden.piezas}</span></div>
          <Button variant="amber" size="lg" onClick={() => set(llenadas + 1)}>+</Button>
        </div>
        <div className="mt-3 h-2 bg-[#e3d8cc] rounded-full overflow-hidden max-w-md mx-auto">
          <div className="h-full bg-amber transition-all" style={{ width: `${(llenadas / orden.piezas) * 100}%` }} />
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-coffee mb-2 text-sm">¿Hubo problemas?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PROBLEMAS.map((p) => (
            <Checkbox key={p} checked={problemas[p]} onChange={(v) => { const np = { ...problemas, [p]: v }; setProblemas(np); persist({ problemas: np }) }} label={p} />
          ))}
        </div>
        <div className="mt-2">
          <Input placeholder="Otro problema…" value={otro} onChange={(e) => setOtro(e.target.value)} onBlur={() => persist({})} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Merma real registrada (gr)"><Input type="number" value={merma} onChange={(e) => setMerma(e.target.value)} onBlur={() => persist({})} placeholder="0" /></Field>
        <Field label="Tiempo total de llenado">
          <Timer value={tiempo} onChange={(min) => { setTiempo(min); persist({ tiempo_min: min }) }} label="Llenado" />
        </Field>
      </div>
    </PasoCard>
  )
}

// ---------------------------------------------------------------------------
// PASO 6 — Reposo y curado
// ---------------------------------------------------------------------------
function Paso6({ orden, savePaso, db, updateIn, navigate }) {
  const d = orden.pasos?.paso6 || {}
  const [iniciado, setIniciado] = useState(!!d.inicio_reposo)
  const [horas, setHoras] = useState(d.tiempo_curado_horas || 24)
  const [, force] = useState(0)
  useEffect(() => { const t = setInterval(() => force((x) => x + 1), 30000); return () => clearInterval(t) }, [])

  const [f, setF] = useState({
    resultado_24h: d.resultado_24h || '', rechupe_detectado: d.rechupe_detectado || false,
    resultado_48h: d.resultado_48h || '', resultado_72h: d.resultado_72h || '',
    prueba_quemado: d.prueba_quemado || false, resultado_quemado: d.resultado_quemado || '',
    aprobado: d.aprobado || '', piezas_aprobadas: d.piezas_aprobadas ?? orden.piezas, merma_piezas: d.merma_piezas ?? 0,
  })
  const upd = (patch) => { const n = { ...f, ...patch }; setF(n); savePaso('paso6', { ...n, inicio_reposo: d.inicio_reposo, tiempo_curado_horas: horas }) }

  const iniciarReposo = () => {
    const inicio = new Date().toISOString()
    savePaso('paso6', { inicio_reposo: inicio, tiempo_curado_horas: Number(horas) })
    updateIn('ordenes', orden.id, { estado: 'En reposo' })
    setIniciado(true)
  }

  const hr = d.inicio_reposo ? horasRestantesCurado(d.inicio_reposo, d.tiempo_curado_horas || horas) : null
  const cumplido = hr != null && hr <= 0
  const horasTranscurridas = d.inicio_reposo ? ((Date.now() - new Date(d.inicio_reposo).getTime()) / 3600000) : 0

  const aprobar = () => {
    savePaso('paso6', { ...f, inicio_reposo: d.inicio_reposo, tiempo_curado_horas: d.tiempo_curado_horas || horas, _cerrado: true })
    updateIn('ordenes', orden.id, { estado: 'Listo' })
    navigate(`/ordenes/${orden.id}/ficha`)
  }

  if (!iniciado) {
    return (
      <PasoCard paso={6} titulo="Reposo y curado">
        <p className="text-sm text-ink/60">El lote entra en reposo. La app hará seguimiento del tiempo de curado (mínimo 24 horas antes de cualquier manipulación).</p>
        <Field label="Tiempo de curado estimado (horas)">
          <Select value={horas} onChange={(e) => setHoras(Number(e.target.value))}>
            <option value={24}>24 horas</option><option value={48}>48 horas</option><option value={72}>72 horas</option>
          </Select>
        </Field>
        <Button variant="amber" size="lg" onClick={iniciarReposo}>⏳ Iniciar reposo</Button>
      </PasoCard>
    )
  }

  return (
    <PasoCard paso={6} titulo="Reposo y curado">
      {/* Contador */}
      <div className={`rounded-2xl p-6 text-center ${cumplido ? 'bg-sage/15' : 'bg-amber/10'}`}>
        <div className="text-sm text-ink/55">{cumplido ? 'Curado cumplido ✓' : 'Tiempo restante de curado'}</div>
        <div className={`font-display text-5xl ${cumplido ? 'text-sage' : 'text-amber'}`}>
          {cumplido ? '✅ Listo' : `${num(hr, 1)} h`}
        </div>
        <div className="text-xs text-ink/50 mt-1">
          Inicio: {fmtFecha(d.inicio_reposo)} {new Date(d.inicio_reposo).toLocaleTimeString('es-MX')} · Curado {d.tiempo_curado_horas} h
        </div>
      </div>

      <RegistroHora label="Registros a las 24 horas" disponible={horasTranscurridas >= 24}>
        <Field label="Resultado visual"><Textarea value={f.resultado_24h} onChange={(e) => upd({ resultado_24h: e.target.value })} /></Field>
        <Toggle checked={f.rechupe_detectado} onChange={(v) => upd({ rechupe_detectado: v })} label="¿Rechupe detectado? (aplicar segunda capa)" />
      </RegistroHora>

      <RegistroHora label="Registros a las 48 horas" disponible={horasTranscurridas >= 48}>
        <Field label="Resultado visual"><Textarea value={f.resultado_48h} onChange={(e) => upd({ resultado_48h: e.target.value })} /></Field>
      </RegistroHora>

      <RegistroHora label="Registros a las 72 horas" disponible={horasTranscurridas >= 72}>
        <Field label="Resultado visual"><Textarea value={f.resultado_72h} onChange={(e) => upd({ resultado_72h: e.target.value })} /></Field>
        <div className="flex items-center gap-3">
          <Toggle checked={f.prueba_quemado} onChange={(v) => upd({ prueba_quemado: v })} label="¿Se realizó prueba de quemado?" />
        </div>
        {f.prueba_quemado && <Field label="Resultado de la prueba"><Input value={f.resultado_quemado} onChange={(e) => upd({ resultado_quemado: e.target.value })} /></Field>}
      </RegistroHora>

      {/* Aprobación */}
      <div className="border-t border-[#efe7dd] pt-4">
        <h4 className="font-semibold text-coffee mb-3">¿Lote aprobado para venta?</h4>
        {!cumplido && <p className="text-xs text-alert mb-3">⏳ El curado mínimo aún no se cumple. No se puede aprobar hasta completar {d.tiempo_curado_horas} h.</p>}
        <div className="flex flex-wrap gap-2 mb-4">
          {['Sí', 'No', 'Con ajustes'].map((op) => (
            <button key={op} onClick={() => upd({ aprobado: op })}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${f.aprobado === op ? 'bg-coffee text-cream border-coffee' : 'border-[#e3d8cc] text-coffee hover:bg-coffee/5'}`}>
              {op}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <Field label="Piezas aprobadas a venta"><Input type="number" value={f.piezas_aprobadas} onChange={(e) => upd({ piezas_aprobadas: Number(e.target.value) })} /></Field>
          <Field label="Merma (piezas)"><Input type="number" value={f.merma_piezas} onChange={(e) => upd({ merma_piezas: Number(e.target.value) })} /></Field>
        </div>
        <div className="mt-5">
          <Button variant="sage" size="lg" onClick={aprobar} disabled={!cumplido || f.aprobado === '' || f.aprobado === 'No'}>
            ✅ Aprobar lote y generar ficha →
          </Button>
        </div>
      </div>
    </PasoCard>
  )
}

function RegistroHora({ label, disponible, children }) {
  return (
    <div className={`rounded-xl border p-4 ${disponible ? 'border-[#efe7dd]' : 'border-dashed border-[#e3d8cc] opacity-60'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-coffee text-sm">{label}</h4>
        {!disponible && <Badge tone="neutral">Disponible al cumplir el tiempo</Badge>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
