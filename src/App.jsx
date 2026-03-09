import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Inventario from './components/Inventario'
import Sabores from './components/Sabores'
import Ventas from './components/Ventas'
import Gastos from './components/Gastos'
import Reportes from './components/Reportes'
import Login from './components/Login'

function Cargando({ texto }) {
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-sky-200 animate-pulse">
        🍦
      </div>
      <p className="text-gray-400 text-sm">{texto}</p>
    </div>
  )
}

function AppContenido() {
  const { cargando } = useApp()
  const [pagina, setPagina] = useState('dashboard')
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  if (cargando) return <Cargando texto="Cargando datos..." />

  const irA = (p) => { setPagina(p); setSidebarAbierto(false) }

  return (
    <div className="flex h-screen bg-sky-50 overflow-hidden">
      {/* Overlay móvil */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      <Sidebar
        pagina={pagina}
        setPagina={irA}
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar móvil */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-sky-100 shadow-sm shrink-0">
          <button
            onClick={() => setSidebarAbierto(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-sky-50 transition text-sky-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍦</span>
            <span className="font-bold text-sky-800 text-sm">Heladería App</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {pagina === 'dashboard'  && <Dashboard />}
          {pagina === 'inventario' && <Inventario />}
          {pagina === 'sabores'    && <Sabores />}
          {pagina === 'ventas'     && <Ventas />}
          {pagina === 'gastos'     && <Gastos />}
          {pagina === 'reportes'   && <Reportes />}
        </main>
      </div>
    </div>
  )
}

function AppInterna() {
  const { usuario, cargandoAuth } = useAuth()

  if (cargandoAuth) return <Cargando texto="Verificando sesión..." />
  if (!usuario)     return <Login />

  return (
    <AppProvider>
      <AppContenido />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInterna />
    </AuthProvider>
  )
}
