import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Catalogo from './pages/Catalogo'
import Ordenes from './pages/Ordenes'
import Flujo from './pages/Flujo'
import Ficha from './pages/Ficha'
import Costeo from './pages/Costeo'
import Precios from './pages/Precios'
import PuntoEquilibrio from './pages/PuntoEquilibrio'
import Capacidad from './pages/Capacidad'
import CostosFijos from './pages/CostosFijos'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/ordenes" element={<Ordenes />} />
        <Route path="/ordenes/:id" element={<Flujo />} />
        <Route path="/ordenes/:id/ficha" element={<Ficha />} />
        <Route path="/costeo" element={<Costeo />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/punto-equilibrio" element={<PuntoEquilibrio />} />
        <Route path="/capacidad" element={<Capacidad />} />
        <Route path="/costos-fijos" element={<CostosFijos />} />
      </Routes>
    </Layout>
  )
}
