// Barra de progreso de producción: las 6 etapas como llamas.
// 🕯️ vacío (pendiente) → 🔥 activo → ✅ completado

export const PASOS = [
  { n: 1, nombre: 'Preparación de cera', corto: 'Cera (blend)' },
  { n: 2, nombre: 'Preparación del color', corto: 'Color' },
  { n: 3, nombre: 'Preparación del aroma', corto: 'Aroma' },
  { n: 4, nombre: 'Mezcla e implementación', corto: 'Mezcla' },
  { n: 5, nombre: 'Llenado de moldes', corto: 'Llenado' },
  { n: 6, nombre: 'Reposo y curado', corto: 'Reposo' },
]

export default function FlameProgress({ pasoActual, onSelect, compact = false }) {
  return (
    <div className="flex items-stretch gap-1 md:gap-2">
      {PASOS.map((p, idx) => {
        const completado = p.n < pasoActual
        const activo = p.n === pasoActual
        const icon = completado ? '✅' : activo ? '🔥' : '🕯️'
        const tone = completado
          ? 'bg-sage/15 border-sage/40 text-[#4d7152]'
          : activo
          ? 'bg-amber/15 border-amber text-[#a35a23] ring-2 ring-amber/30'
          : 'bg-[#f4ede4] border-[#e3d8cc] text-ink/40'
        return (
          <div key={p.n} className="flex items-center flex-1 min-w-0">
            <button
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect && onSelect(p.n)}
              className={`flex-1 min-w-0 rounded-xl border px-2 py-2 text-center transition ${tone} ${onSelect ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}`}
            >
              <div className={`text-lg leading-none ${activo ? 'flame-active' : ''}`}>{icon}</div>
              {!compact && (
                <div className="mt-1 text-[10px] md:text-xs font-semibold truncate">{p.corto}</div>
              )}
              <div className="text-[9px] text-ink/40">Paso {p.n}</div>
            </button>
            {idx < PASOS.length - 1 && (
              <div className={`h-0.5 w-1 md:w-3 ${completado ? 'bg-sage/50' : 'bg-[#e3d8cc]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
