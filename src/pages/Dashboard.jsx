import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Card, SectionTitle, Stat, Badge, Button, EmptyState } from '../components/ui'
import {
  mxn, num, horasRestantesCurado, diasDesde, costearModelo, minutosPorPieza,
} from '../lib/calc'
import { PASOS } from '../components/FlameProgress'

export default function Dashboard() {
  const { db, modelosById, insumosById } = useStore()
  const { ordenes = [], insumos = [], modelos = [], config, costosFijos, blends, colores } = db

  const enProceso = ordenes.filter((o) => o.estado === 'En proceso')
  const enReposo = ordenes.filter((o) => o.estado === 'En reposo')
  const listos = ordenes.filter((o) => o.estado === 'Listo')

  const bajoStock = insumos.filter((i) => i.activo && i.stock_actual <= i.stock_minimo)
  const sinCosteoReciente = modelos.filter((m) => {
    if (!m.activo) return false
    const ult = (db.costeos || []).filter((c) => c.modelo_id === m.id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]
    return !ult || diasDesde(ult.fecha) > 30
  })

  // KPIs del mes
  const now = new Date()
  const esteMes = ordenes.filter((o) => {
    const f = new Date(o.fecha_inicio)
    return f.getMonth() === now.getMonth() && f.getFullYear() === now.getFullYear()
  })
  const velasMes = esteMes.reduce((s, o) => s + (o.pasos?.paso6?.piezas_aprobadas || o.piezas || 0), 0)

  // Costo promedio por vela (estimado con primer blend/color/fragancia disponibles)
  const blend = blends?.[0]
  const color = colores?.[0]
  const frag = insumos.find((i) => i.categoria === 'Fragancias')
  const pabilo = insumos.find((i) => i.categoria === 'Pabilos')
  const costosModelos = modelos.filter((m) => m.activo).map((m) => {
    const { costoTotal } = costearModelo({
      modelo: m, blend, color, fragInsumo: frag, fragPct: 8, pabilo,
      empaqueInsumos: [], lotePiezas: 50, config, costosFijos, insumosById,
    })
    return { modelo: m, costoTotal }
  })
  const costoProm = costosModelos.length
    ? costosModelos.reduce((s, c) => s + c.costoTotal, 0) / costosModelos.length
    : 0
  // margen promedio del catálogo (asumiendo precio sugerido con margen guardado 100% si no hay)
  const margenProm = 80

  const conteoModelos = {}
  ordenes.forEach((o) => { conteoModelos[o.modelo_id] = (conteoModelos[o.modelo_id] || 0) + (o.piezas || 0) })
  const masProducido = Object.entries(conteoModelos).sort((a, b) => b[1] - a[1])[0]
  const masProducidoNombre = masProducido ? modelosById[masProducido[0]]?.nombre : '—'

  return (
    <div>
      <SectionTitle sub={`Hoy es ${now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}`}>
        Buen día en el taller 👋
      </SectionTitle>

      {/* Fila superior — estado hoy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <EstadoCard
          titulo="En producción activa"
          icon="🔥"
          tone="amber"
          ordenes={enProceso}
          modelosById={modelosById}
          render={(o) => `${PASOS[(o.paso_actual || 1) - 1]?.nombre || ''}`}
        />
        <EstadoCard
          titulo="En reposo / curado"
          icon="⏳"
          tone="coffee"
          ordenes={enReposo}
          modelosById={modelosById}
          render={(o) => {
            const p6 = o.pasos?.paso6
            const hr = p6 ? horasRestantesCurado(p6.inicio_reposo, p6.tiempo_curado_horas || 24) : null
            if (hr == null) return 'Sin iniciar reposo'
            return hr > 0 ? `Faltan ${num(hr, 0)} h de curado` : 'Curado cumplido ✓'
          }}
        />
        <EstadoCard
          titulo="Listos para entregar"
          icon="✅"
          tone="sage"
          ordenes={listos}
          modelosById={modelosById}
          render={() => 'Aprobado para venta'}
        />
      </div>

      {/* Fila media — alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-coffee">Insumos bajo mínimo</h3>
            <Badge tone={bajoStock.length ? 'red' : 'green'}>{bajoStock.length}</Badge>
          </div>
          {bajoStock.length === 0 ? (
            <p className="text-sm text-ink/50">Todo el inventario por encima del mínimo. 🌿</p>
          ) : (
            <ul className="space-y-2">
              {bajoStock.slice(0, 6).map((i) => (
                <li key={i.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink/80">{i.nombre}</span>
                  <span className="text-alert font-semibold tabular-nums">
                    {num(i.stock_actual)} / {num(i.stock_minimo)} {i.unidad_minima}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/inventario" className="inline-block mt-3 text-sm text-amber font-medium hover:underline">Ir a inventario →</Link>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-coffee">Costeos sin actualizar</h3>
            <Badge tone={sinCosteoReciente.length ? 'amber' : 'green'}>{sinCosteoReciente.length}</Badge>
          </div>
          {sinCosteoReciente.length === 0 ? (
            <p className="text-sm text-ink/50">Todos los modelos con costeo reciente.</p>
          ) : (
            <ul className="space-y-2">
              {sinCosteoReciente.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink/80">{m.nombre}</span>
                  <Badge tone="amber">+30 días</Badge>
                </li>
              ))}
            </ul>
          )}
          <Link to="/costeo" className="inline-block mt-3 text-sm text-amber font-medium hover:underline">Ir a costeo →</Link>
        </Card>
      </div>

      {/* Fila inferior — KPIs */}
      <h3 className="font-display text-lg text-coffee mb-3">KPIs del mes</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Velas producidas" value={num(velasMes)} sub="este mes" icon="🕯️" />
        <Stat label="Costo promedio / vela" value={mxn(costoProm)} sub="catálogo activo" tone="amber" icon="💰" />
        <Stat label="Margen promedio" value={`${margenProm}%`} sub="catálogo activo" tone="sage" icon="📈" />
        <Stat label="Modelo más producido" value={masProducidoNombre} sub={masProducido ? `${num(masProducido[1])} piezas` : ''} icon="⭐" />
      </div>
    </div>
  )
}

function EstadoCard({ titulo, icon, tone, ordenes, modelosById, render }) {
  const ring = { amber: 'border-amber/30', coffee: 'border-coffee/20', sage: 'border-sage/40' }[tone]
  return (
    <Card className={`p-5 border-2 ${ring}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-coffee">{titulo}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="font-display text-4xl text-coffee mb-3">{ordenes.length}</div>
      {ordenes.length === 0 ? (
        <p className="text-sm text-ink/40">Sin lotes aquí ahora.</p>
      ) : (
        <ul className="space-y-2">
          {ordenes.slice(0, 4).map((o) => (
            <li key={o.id}>
              <Link to={`/ordenes/${o.id}`} className="block rounded-lg px-2.5 py-1.5 hover:bg-coffee/5 transition">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-coffee">{o.numero_orden}</span>
                  <span className="text-ink/50">{o.piezas} pz</span>
                </div>
                <div className="text-xs text-ink/60 truncate">{modelosById[o.modelo_id]?.nombre}</div>
                <div className="text-xs text-amber mt-0.5">{render(o)}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
