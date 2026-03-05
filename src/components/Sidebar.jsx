import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',  icon: '📊' },
  { id: 'inventario', label: 'Inventario', icon: '🪣' },
  { id: 'sabores',    label: 'Sabores',    icon: '🍨' },
  { id: 'ventas',     label: 'Ventas',     icon: '🛒' },
  { id: 'gastos',     label: 'Gastos',     icon: '💸' },
  { id: 'reportes',   label: 'Reportes',   icon: '📈' },
]

export default function Sidebar({ pagina, setPagina }) {
  const { alertas } = useApp()
  const { usuario, logout } = useAuth()

  return (
    <aside className="w-64 shrink-0 bg-gradient-to-b from-sky-700 to-sky-900 text-white flex flex-col shadow-2xl z-10">
      {/* Logo */}
      <div className="p-6 border-b border-sky-600/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-300/20 rounded-xl flex items-center justify-center text-2xl">🍦</div>
          <div>
            <h1 className="font-bold text-base leading-tight">Heladería App</h1>
            <p className="text-sky-300 text-xs">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(item => {
          const active = pagina === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPagina(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150
                ${active
                  ? 'bg-white text-sky-800 font-semibold shadow-lg'
                  : 'text-sky-200 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="text-xl w-6 text-center">{item.icon}</span>
              <span className="flex-1 text-sm">{item.label}</span>
              {item.id === 'inventario' && alertas.length > 0 && (
                <span className="bg-pink-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {alertas.length}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer usuario */}
      <div className="p-4 border-t border-sky-600/50 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 bg-pink-300/20 rounded-xl flex items-center justify-center text-lg shrink-0">
            {usuario?.rol === 'admin' ? '👑' : '👁️'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{usuario?.nombre}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
              ${usuario?.rol === 'admin' ? 'bg-sky-400/30 text-sky-200' : 'bg-pink-400/30 text-pink-200'}`}>
              {usuario?.rol === 'admin' ? 'Administrador' : 'Solo lectura'}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sky-300 hover:bg-white/10 hover:text-white transition text-xs font-semibold">
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
