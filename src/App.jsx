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

  if (cargando) return <Cargando texto="Cargando datos..." />

  return (
    <div className="flex h-screen bg-sky-50 overflow-hidden">
      <Sidebar pagina={pagina} setPagina={setPagina} />
      <main className="flex-1 overflow-y-auto">
        {pagina === 'dashboard'  && <Dashboard />}
        {pagina === 'inventario' && <Inventario />}
        {pagina === 'sabores'    && <Sabores />}
        {pagina === 'ventas'     && <Ventas />}
        {pagina === 'gastos'     && <Gastos />}
        {pagina === 'reportes'   && <Reportes />}
      </main>
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
