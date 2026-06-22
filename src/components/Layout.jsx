import { NavLink } from 'react-router-dom'
import { useStore } from '../lib/store'
import { diasDesde } from '../lib/calc'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/inventario', label: 'Inventario', icon: '📦' },
  { to: '/catalogo', label: 'Catálogo', icon: '🕯️' },
  { to: '/ordenes', label: 'Órdenes de Producción', icon: '🔬' },
  { divider: 'Costeo' },
  { to: '/costeo', label: 'Costeo por modelo', icon: '💰' },
  { to: '/precios', label: 'Precios de venta', icon: '🏷️' },
  { divider: 'Reportes' },
  { to: '/punto-equilibrio', label: 'Punto de equilibrio', icon: '📊' },
  { to: '/capacidad', label: 'Capacidad instalada', icon: '⚙️' },
  { to: '/costos-fijos', label: 'Costos fijos', icon: '🧾' },
]

export default function Layout({ children }) {
  const { db } = useStore()
  const bajoStock = (db.insumos || []).filter((i) => i.activo && i.stock_actual <= i.stock_minimo).length
  const enProceso = (db.ordenes || []).filter((o) => o.estado === 'En proceso' || o.estado === 'En reposo').length

  return (
    <div className="min-h-full flex bg-cream text-ink">
      <aside className="no-print w-64 shrink-0 bg-coffee text-cream flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕯️</span>
            <div>
              <div className="font-display text-2xl leading-none">Entrevelas</div>
              <div className="text-[11px] text-cream/60 tracking-wide mt-0.5">Velas 100% a mano</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map((item, i) =>
            item.divider ? (
              <div key={i} className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-widest text-cream/40">
                {item.divider}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
                    isActive ? 'bg-cream text-coffee font-semibold' : 'text-cream/85 hover:bg-white/10'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.to === '/inventario' && bajoStock > 0 && (
                  <span className="bg-alert text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{bajoStock}</span>
                )}
                {item.to === '/ordenes' && enProceso > 0 && (
                  <span className="bg-amber text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{enProceso}</span>
                )}
              </NavLink>
            )
          )}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 text-[11px] text-cream/50">
          Taller artesanal · MXN
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-8">{children}</div>
      </main>
    </div>
  )
}
