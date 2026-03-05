import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const ok = login(usuario.trim(), clave)
      if (!ok) setError('Usuario o contraseña incorrectos.')
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-sky-600 rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-lg shadow-sky-200">
            🍦
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Heladería App</h1>
          <p className="text-gray-400 text-sm mt-1">Sistema de Gestión</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-sky-100 p-8">
          <h2 className="text-lg font-bold text-gray-700 mb-6 text-center">Iniciar sesión</h2>

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 rounded-xl p-3 text-sm mb-5 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contraseña</label>
              <input
                type="password"
                value={clave}
                onChange={e => setClave(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 active:scale-95 transition font-semibold text-sm shadow-sm shadow-sky-200 disabled:opacity-60 mt-2">
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          {/* Hint usuarios */}
          <div className="mt-6 space-y-2">
            <p className="text-xs text-gray-400 text-center font-medium uppercase tracking-wide">Usuarios disponibles</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-sky-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-sky-700">admin</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Acceso completo</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-pink-600">lector</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Solo lectura</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">© {new Date().getFullYear()} Heladería App</p>
      </div>
    </div>
  )
}
