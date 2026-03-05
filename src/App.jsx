import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Inventario from './components/Inventario'
import Sabores from './components/Sabores'
import Ventas from './components/Ventas'
import Gastos from './components/Gastos'
import Reportes from './components/Reportes'
import Login from './components/Login'

function AppInterna() {
  const { usuario } = useAuth()
  const [pagina, setPagina] = useState('dashboard')

  if (!usuario) return <Login />

  return (
    <AppProvider>
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
