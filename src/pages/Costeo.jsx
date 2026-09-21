import { useState, useMemo } from 'react'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Button, Badge, Input, Select, Field, Checkbox } from '../components/ui'
import CatalogField from '../components/CatalogField'
import { Donut } from '../components/charts'
import { mxn, num, conIva, costearModelo, precioConMargen } from '../lib/calc'

const EMPAQUE_OPCIONES = [
  { key: 'Etiqueta adhesiva', cant: 1 },
  { key: 'Caja individual kraft', cant: 1 },
  { key: 'Plástico burbuja', cant: 0.5 },
  { key: 'Papel china', cant: 1 },
  { key: 'Caja de envío', cant: 0.2 },
]

export default function Costeo() {
  const { db, insumosById, addTo } = useStore()
  const { modelos = [], blends = [], colores = [], insumos = [], config, costosFijos } = db

  const [modeloId, setModeloId] = useState(modelos[0]?.id || '')
  const [lote, setLote] = useState(50)
  const [blendId, setBlendId] = useState(blends[0]?.id || '')
  const [colorId, setColorId] = useState(colores[0]?.id || '')
  const fragancias = insumos.filter((i) => i.categoria === 'Fragancias')
  const pabilosList = insumos.filter((i) => i.categoria === 'Pabilos')
  const [fragId, setFragId] = useState(fragancias[0]?.id || '')
  const [fragPct, setFragPct] = useState(8)
  const [pabiloId, setPabiloId] = useState(pabilosList[0]?.id || '')
  const [empaque, setEmpaque] = useState({ 'Etiqueta adhesiva': true, 'Caja individual kraft': true })
  const [margen, setMargen] = useState(80)
  const [cargoExtra, setCargoExtra] = useState(0)
  const [guardado, setGuardado] = useState(false)
  // D1 — overrides manuales (vacío = usar cálculo automático)
  const [ovOpen, setOvOpen] = useState(false)
  const [ov, setOv] = useState({ mermaPct: '', costoMinuto: '', costoLuz: '', costoRenta: '' })

  const modelo = modelos.find((m) => m.id === modeloId)
  const empaqueInsumos = EMPAQUE_OPCIONES.filter((o) => empaque[o.key]).map((o) => ({
    insumo: insumos.find((i) => i.nombre === o.key), cantidad: o.cant,
  }))

  const { detalle, costoTotal } = useMemo(() => costearModelo({
    modelo,
    blend: blends.find((b) => b.id === blendId),
    color: colores.find((c) => c.id === colorId),
    fragInsumo: insumosById[fragId],
    fragPct: Number(fragPct),
    pabilo: insumosById[pabiloId],
    empaqueInsumos,
    lotePiezas: Number(lote) || 1,
    config, costosFijos, insumosById,
    cargoExtra: Number(cargoExtra) || 0,
    overrides: ov,
  }), [modelo, blendId, colorId, fragId, fragPct, pabiloId, empaque, lote, cargoExtra, ov]) // eslint-disable-line

  const precio = precioConMargen(costoTotal, Number(margen))

  const donutData = [
    { label: 'Materia prima', value: detalle.subtotalMPD },
    { label: 'Mano de obra', value: detalle.costoMOD },
    { label: 'Indirectos', value: detalle.subtotalIndirectos },
    { label: 'Merma', value: detalle.costoMerma },
    ...(detalle.cargoExtra ? [{ label: 'Personalización', value: detalle.cargoExtra }] : []),
  ]

  const guardar = () => {
    addTo('costeos', {
      modelo_id: modeloId, blend_id: blendId, color_id: colorId, pabilo_id: pabiloId,
      lote_piezas: Number(lote), fecha: new Date().toISOString(),
      costo_mpd: detalle.subtotalMPD, costo_mod: detalle.costoMOD,
      costo_indirectos: detalle.subtotalIndirectos, costo_merma: detalle.costoMerma,
      costo_total: costoTotal, margen_pct: Number(margen), precio_venta_sin_iva: precio.sinIva,
    }, 'cost')
    setGuardado(true); setTimeout(() => setGuardado(false), 2500)
  }

  if (!modelo) return <SectionTitle>Costeo por modelo</SectionTitle>

  const Linea = ({ label, value, indent, total, pct }) => (
    <div className={`flex items-center justify-between py-1 text-sm ${total ? 'font-semibold text-coffee border-t border-[#efe7dd] mt-1 pt-2' : ''} ${indent ? 'pl-4 text-ink/70' : ''}`}>
      <span>{indent ? '├── ' : ''}{label}</span>
      <span className="flex items-center gap-3">
        {pct != null && <span className="text-ink/35 text-xs w-10 text-right">{num(pct, 0)}%</span>}
        <span className="tabular-nums">{mxn(value)}</span>
      </span>
    </div>
  )

  return (
    <div>
      <SectionTitle sub="Calculadora de costo unitario completo: materia prima + mano de obra + indirectos + merma">
        Costeo por modelo
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inputs */}
        <Card className="p-5">
          <h3 className="font-display text-lg text-coffee mb-3">Configuración del costeo</h3>
          <div className="grid grid-cols-2 gap-3">
            <CatalogField kind="modelo" label="Modelo" value={modeloId} onChange={setModeloId} />
            <Field label="Tamaño del lote (piezas)"><Input type="number" value={lote} onChange={(e) => setLote(e.target.value)} /></Field>
            <CatalogField kind="blend" label="Blend" value={blendId} onChange={setBlendId} />
            <CatalogField kind="color" label="Color" value={colorId} onChange={setColorId} />
            <CatalogField kind="fragancia" label="Fragancia" value={fragId} onChange={setFragId} />
            <Field label={`% Fragancia: ${fragPct}%`}>
              <input type="range" min="6" max="12" step="0.5" value={fragPct} onChange={(e) => setFragPct(e.target.value)} className="w-full accent-amber" />
            </Field>
            <CatalogField kind="pabilo" label="Pabilo" value={pabiloId} onChange={setPabiloId} className="col-span-2" />
          </div>
          <div className="mt-3">
            <span className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wide">Empaque</span>
            <div className="grid grid-cols-2 gap-2">
              {EMPAQUE_OPCIONES.map((o) => (
                <Checkbox key={o.key} checked={empaque[o.key]} onChange={(v) => setEmpaque({ ...empaque, [o.key]: v })} label={o.key} />
              ))}
            </div>
          </div>
          <div className="mt-3">
            <Field label="Cargo extra personalización ($)"><Input type="number" value={cargoExtra} onChange={(e) => setCargoExtra(e.target.value)} /></Field>
          </div>

          <div className="mt-4 border-t border-[#efe7dd] pt-3">
            <button onClick={() => setOvOpen((v) => !v)} className="text-sm text-amber font-medium hover:underline">
              {ovOpen ? '▾' : '▸'} Ajustes avanzados (editar costos manualmente)
            </button>
            {ovOpen && (
              <>
                <p className="text-xs text-ink/45 mt-2 mb-2">Deja en blanco para usar el cálculo automático. Lo que escribas reemplaza el valor calculado para este costeo.</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Merma % (override)"><Input type="number" placeholder={`auto: ${num(config?.merma_default_pct ?? 8)}%`} value={ov.mermaPct} onChange={(e) => setOv({ ...ov, mermaPct: e.target.value })} /></Field>
                  <Field label="Mano de obra $/min (override)"><Input type="number" placeholder={`auto: ${mxn((config?.sueldo_mensual || 0) / ((config?.horas_productivas_mes || 192) * 60))}`} value={ov.costoMinuto} onChange={(e) => setOv({ ...ov, costoMinuto: e.target.value })} /></Field>
                  <Field label="Luz $/pieza (override)"><Input type="number" placeholder={`auto: ${mxn(detalle.costoLuz)}`} value={ov.costoLuz} onChange={(e) => setOv({ ...ov, costoLuz: e.target.value })} /></Field>
                  <Field label="Renta $/pieza (override)"><Input type="number" placeholder={`auto: ${mxn(detalle.costoRenta)}`} value={ov.costoRenta} onChange={(e) => setOv({ ...ov, costoRenta: e.target.value })} /></Field>
                </div>
                {(ov.mermaPct || ov.costoMinuto || ov.costoLuz || ov.costoRenta) !== '' && (ov.mermaPct || ov.costoMinuto || ov.costoLuz || ov.costoRenta) && (
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => setOv({ mermaPct: '', costoMinuto: '', costoLuz: '', costoRenta: '' })}>Limpiar overrides</Button>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Desglose */}
        <Card className="p-5">
          <h3 className="font-display text-lg text-coffee mb-3">Desglose de costo unitario</h3>
          <div className="text-xs uppercase tracking-wide text-ink/40 mt-2">Materia prima directa (MPD)</div>
          <Linea indent label="Cera (blend)" value={detalle.costoCera} />
          <Linea indent label="Colorante" value={detalle.costoColorante} />
          <Linea indent label="Fragancia" value={detalle.costoFragancia} />
          <Linea indent label="Pabilo" value={detalle.costoPabilo} />
          <Linea indent label="Empaque" value={detalle.costoEmpaque} />
          <Linea label="Subtotal MPD" value={detalle.subtotalMPD} total />

          <div className="text-xs uppercase tracking-wide text-ink/40 mt-3">Mano de obra directa</div>
          <Linea indent label={`${num(detalle.minutos, 1)} min × tarifa`} value={detalle.costoMOD} />

          <div className="text-xs uppercase tracking-wide text-ink/40 mt-3">Costos indirectos (prorrateo)</div>
          <Linea indent label="Luz" value={detalle.costoLuz} />
          <Linea indent label="Renta" value={detalle.costoRenta} />
          <Linea indent label="Depreciación moldes" value={detalle.costoDeprec} />
          <Linea indent label="Otros fijos" value={detalle.costoOtrosFijos} />
          <Linea label="Subtotal indirectos" value={detalle.subtotalIndirectos} total />

          <Linea label="Merma" value={detalle.costoMerma} />
          {detalle.cargoExtra > 0 && <Linea label="Personalización" value={detalle.cargoExtra} />}

          <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-coffee">
            <span className="font-display text-lg text-coffee">Costo total unitario</span>
            <span className="font-display text-2xl text-amber">{mxn(costoTotal)}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <Card className="p-5">
          <h3 className="font-display text-lg text-coffee mb-4">Participación por rubro</h3>
          <Donut data={donutData} />
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-lg text-coffee mb-3">Precio de venta sugerido</h3>
          <Field label={`Margen: ${margen}%`}>
            <input type="range" min="0" max="200" value={margen} onChange={(e) => setMargen(e.target.value)} className="w-full accent-sage" />
          </Field>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <PriceBox label="Precio sin IVA" value={mxn(precio.sinIva)} tone="coffee" />
            <PriceBox label="Precio con IVA (16%)" value={mxn(precio.conIva)} tone="amber" />
            <PriceBox label="Utilidad por pieza" value={mxn(precio.utilidad)} tone="sage" />
            <PriceBox label="Margen" value={`${num(margen)}%`} tone="sage" />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Button variant="sage" onClick={guardar}>💾 Guardar costeo</Button>
            {guardado && <Badge tone="green">✓ Costeo guardado</Badge>}
          </div>
        </Card>
      </div>
    </div>
  )
}

function PriceBox({ label, value, tone }) {
  const t = { coffee: 'text-coffee', amber: 'text-amber', sage: 'text-[#4d7152]' }[tone]
  return (
    <div className="bg-cream/60 rounded-xl p-3">
      <div className="text-xs uppercase tracking-wide text-ink/45">{label}</div>
      <div className={`font-display text-xl ${t}`}>{value}</div>
    </div>
  )
}
