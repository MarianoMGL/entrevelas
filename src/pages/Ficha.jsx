import { useParams, Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Button } from '../components/ui'
import { num, fmtFecha } from '../lib/calc'

export default function Ficha() {
  const { id } = useParams()
  const { db, insumosById } = useStore()
  const orden = (db.ordenes || []).find((o) => o.id === id)
  if (!orden) return <p className="text-ink/60">Orden no encontrada. <Link to="/ordenes" className="text-amber">Volver</Link></p>

  const modelo = db.modelos.find((m) => m.id === orden.modelo_id)
  const p1 = orden.pasos?.paso1 || {}
  const p2 = orden.pasos?.paso2 || {}
  const p3 = orden.pasos?.paso3 || {}
  const p4 = orden.pasos?.paso4 || {}
  const p5 = orden.pasos?.paso5 || {}
  const p6 = orden.pasos?.paso6 || {}

  const blend = db.blends.find((b) => b.id === p1.blend_id)
  const blendFormula = blend ? blend.componentes.map((c) => `${c.porcentaje}% ${insumosById[c.insumo_id]?.nombre?.replace('Cera de ', '').replace('Aditivo ', '') || '?'}`).join(' · ') : '—'
  const color = db.colores.find((c) => c.id === p2.color_id)
  const colorantes = color ? color.componentes.map((c) => `${insumosById[c.insumo_id]?.nombre} ${num(c.gramos, 1)}gr`).join(' · ') : '—'
  const frag = insumosById[p3.insumo_id]

  const Sep = ({ children }) => (
    <div className="mt-5 mb-2 flex items-center gap-2">
      <span className="font-semibold text-coffee text-sm tracking-wider uppercase">{children}</span>
      <span className="flex-1 border-t border-dashed border-coffee/30" />
    </div>
  )
  const Row = ({ l, v }) => (
    <div className="flex text-sm py-0.5"><span className="w-40 text-ink/50">{l}</span><span className="text-ink font-medium">{v}</span></div>
  )

  return (
    <div>
      <div className="no-print flex items-center justify-between mb-4">
        <Link to="/ordenes" className="text-sm text-amber hover:underline">← Órdenes</Link>
        <Button variant="coffee" onClick={() => window.print()} className="bg-coffee text-cream">🖨 Imprimir / Guardar PDF</Button>
      </div>

      <div className="print-area bg-white rounded-2xl shadow-card border border-[#efe7dd] max-w-3xl mx-auto p-8 font-body">
        <div className="text-center border-b-2 border-coffee pb-4 mb-2">
          <div className="text-3xl">🕯️</div>
          <h1 className="font-display text-3xl text-coffee">ENTREVELAS</h1>
          <p className="text-ink/60 tracking-widest text-sm">FICHA DE PRODUCCIÓN</p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 mt-4">
          <Row l="Orden:" v={orden.numero_orden} />
          <Row l="Modelo:" v={modelo?.nombre} />
          <Row l="Piezas:" v={orden.piezas} />
          <Row l="Elaboró:" v={orden.elaboro} />
          <Row l="Fecha inicio:" v={fmtFecha(orden.fecha_inicio)} />
          <Row l="Fecha cierre:" v={fmtFecha(p6.inicio_reposo ? new Date(new Date(p6.inicio_reposo).getTime() + (p6.tiempo_curado_horas || 24) * 3600000).toISOString() : new Date().toISOString())} />
          {orden.personalizado && <Row l="Personalizado:" v={`Sí · cargo extra $${num(orden.cargo_extra_personalizacion)}`} />}
        </div>

        <Sep>Blend de cera</Sep>
        <Row l="Fórmula:" v={blendFormula} />
        <Row l="Total preparado:" v={`${num(p1.cera_total_gr)} gr`} />
        <Row l="Temp. derretido:" v={p1.temp_derretido ? `${p1.temp_derretido}°C` : '—'} />
        <Row l="Tiempo:" v={`${num(p1.tiempo_min, 1)} min`} />

        <Sep>Color</Sep>
        <Row l="Código:" v={color ? `${color.codigo} — ${color.nombre}` : '—'} />
        <Row l="Colorantes:" v={colorantes} />
        <Row l="Temp. mezcla:" v={p2.temp_mezcla ? `${p2.temp_mezcla}°C` : '—'} />
        {p2.resultado_visual && <Row l="Resultado:" v={p2.resultado_visual} />}

        <Sep>Aroma</Sep>
        <Row l="Fragancia:" v={frag?.nombre || '—'} />
        <Row l="Dosis:" v={`${num(p3.porcentaje_fragancia, 1)}% · ${num(p3.gramos_fragancia)} gr`} />
        <Row l="Temp. mezcla:" v={p3.temp_mezcla ? `${p3.temp_mezcla}°C` : '—'} />
        <Row l="Intensidad:" v={p3.intensidad ? `${p3.intensidad}/5` : '—'} />

        <Sep>Vertido</Sep>
        <Row l="Temp. vertido:" v={p4.temp_vertido ? `${p4.temp_vertido}°C` : '—'} />
        <Row l="Temp. molde:" v={p4.temp_molde ? `${p4.temp_molde}°C` : '—'} />
        <Row l="Temp. ambiente:" v={p4.temp_ambiente ? `${p4.temp_ambiente}°C` : '—'} />
        <Row l="Humedad:" v={p4.humedad ? `${p4.humedad}%` : '—'} />
        <Row l="Rechupe:" v={p4.rechupe ? 'Sí — segunda capa aplicada' : 'No'} />
        {p5.merma_real_gr ? <Row l="Merma vertido:" v={`${num(p5.merma_real_gr)} gr`} /> : null}

        <Sep>Curado</Sep>
        <Row l="24 hrs:" v={p6.resultado_24h || '—'} />
        <Row l="48 hrs:" v={p6.resultado_48h || '—'} />
        <Row l="72 hrs:" v={p6.resultado_72h || '—'} />
        <Row l="Prueba quemado:" v={p6.prueba_quemado ? (p6.resultado_quemado || 'Realizada') : 'No realizada'} />
        <div className="mt-2 bg-sage/15 rounded-lg px-3 py-2 text-sm font-semibold text-[#4d7152]">
          {p6.aprobado === 'Sí' ? '✅ Lote APROBADO' : p6.aprobado === 'Con ajustes' ? '⚠ Aprobado con ajustes' : '◻ Pendiente'} — {num(p6.piezas_aprobadas ?? orden.piezas)} piezas a venta / {num(p6.merma_piezas || 0)} merma
        </div>

        {orden.observaciones && (<><Sep>Notas</Sep><p className="text-sm text-ink/70">{orden.observaciones}</p></>)}

        <div className="border-t-2 border-coffee mt-6 pt-2 text-center text-xs text-ink/40">
          Documento interno de taller · Entrevelas · {fmtFecha(new Date().toISOString())}
        </div>
      </div>
    </div>
  )
}
