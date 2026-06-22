// Gráficas ligeras en SVG (sin dependencias).
import { mxn, num } from '../lib/calc'

const PALETTE = ['#5C3D2E', '#C8763A', '#7A9E7E', '#C0392B', '#9b7e5a', '#d6a96f', '#a8bfa0']

export function Donut({ data, size = 180, valueFmt = mxn }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = size / 2 - 12
  const cx = size / 2
  const cy = size / 2
  let acc = 0
  const arcs = data.map((d, i) => {
    const frac = d.value / total
    const start = acc * 2 * Math.PI - Math.PI / 2
    acc += frac
    const end = acc * 2 * Math.PI - Math.PI / 2
    const large = frac > 0.5 ? 1 : 0
    const x1 = cx + r * Math.cos(start)
    const y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(end)
    const y2 = cy + r * Math.sin(end)
    return { d, color: d.color || PALETTE[i % PALETTE.length], path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, frac }
  })
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth={20} strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="font-display" fontSize="16" fill="#5C3D2E">Total</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fill="#2C2016">{valueFmt(total)}</text>
      </svg>
      <div className="space-y-1.5">
        {arcs.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-sm" style={{ background: a.color }} />
            <span className="text-ink/70 flex-1">{a.d.label}</span>
            <span className="font-medium text-ink tabular-nums">{valueFmt(a.d.value)}</span>
            <span className="text-ink/40 text-xs w-10 text-right">{num(a.frac * 100, 0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Gráfica de líneas para punto de equilibrio
export function BreakEvenChart({ precioUnit, costoVarUnit, costosFijos, maxUnidades }) {
  const w = 520, h = 280, padL = 56, padB = 36, padT = 16, padR = 16
  const plotW = w - padL - padR
  const plotH = h - padT - padB
  const maxIngreso = precioUnit * maxUnidades
  const maxCosto = costosFijos + costoVarUnit * maxUnidades
  const maxY = Math.max(maxIngreso, maxCosto) || 1
  const x = (u) => padL + (u / maxUnidades) * plotW
  const y = (v) => padT + plotH - (v / maxY) * plotH

  const peUnid = precioUnit - costoVarUnit > 0 ? costosFijos / (precioUnit - costoVarUnit) : null

  const lineIngreso = `M ${x(0)} ${y(0)} L ${x(maxUnidades)} ${y(maxIngreso)}`
  const lineCostoTotal = `M ${x(0)} ${y(costosFijos)} L ${x(maxUnidades)} ${y(maxCosto)}`
  const lineFijo = `M ${x(0)} ${y(costosFijos)} L ${x(maxUnidades)} ${y(costosFijos)}`

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="max-w-full">
      {/* ejes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#d8cabd" />
      <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#d8cabd" />
      {/* líneas */}
      <path d={lineFijo} stroke="#9b7e5a" strokeWidth="2" strokeDasharray="5 4" fill="none" />
      <path d={lineCostoTotal} stroke="#C0392B" strokeWidth="2.5" fill="none" />
      <path d={lineIngreso} stroke="#7A9E7E" strokeWidth="2.5" fill="none" />
      {/* punto de equilibrio */}
      {peUnid && peUnid <= maxUnidades && (
        <g>
          <circle cx={x(peUnid)} cy={y(precioUnit * peUnid)} r="5" fill="#C8763A" />
          <line x1={x(peUnid)} y1={y(precioUnit * peUnid)} x2={x(peUnid)} y2={padT + plotH} stroke="#C8763A" strokeDasharray="3 3" />
          <text x={x(peUnid)} y={padT + plotH + 22} textAnchor="middle" fontSize="11" fill="#C8763A" fontWeight="600">
            PE: {num(peUnid, 0)} u
          </text>
        </g>
      )}
      {/* labels ejes */}
      <text x={padL - 8} y={padT + 6} textAnchor="end" fontSize="10" fill="#2C2016">{mxn(maxY)}</text>
      <text x={padL - 8} y={padT + plotH} textAnchor="end" fontSize="10" fill="#2C2016">$0</text>
      <text x={padL + plotW} y={padT + plotH + 22} textAnchor="end" fontSize="10" fill="#2C2016">{num(maxUnidades, 0)} u</text>
      {/* leyenda */}
      <g fontSize="11">
        <rect x={padL + 8} y={padT + 4} width="10" height="3" fill="#7A9E7E" />
        <text x={padL + 22} y={padT + 8} fill="#2C2016">Ingresos</text>
        <rect x={padL + 90} y={padT + 4} width="10" height="3" fill="#C0392B" />
        <text x={padL + 104} y={padT + 8} fill="#2C2016">Costos totales</text>
        <rect x={padL + 196} y={padT + 4} width="10" height="3" fill="#9b7e5a" />
        <text x={padL + 210} y={padT + 8} fill="#2C2016">Costos fijos</text>
      </g>
    </svg>
  )
}
