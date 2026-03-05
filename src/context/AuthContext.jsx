import { createContext, useContext, useState } from 'react'

const USUARIOS = [
  { usuario: 'admin',  clave: 'admin123',  rol: 'admin',  nombre: 'Administrador' },
  { usuario: 'lector', clave: 'lector123', rol: 'lector', nombre: 'Lector' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const saved = localStorage.getItem('heladeria_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (user, clave) => {
    const found = USUARIOS.find(u => u.usuario === user && u.clave === clave)
    if (!found) return false
    const data = { usuario: found.usuario, nombre: found.nombre, rol: found.rol }
    localStorage.setItem('heladeria_user', JSON.stringify(data))
    setUsuario(data)
    return true
  }

  const logout = () => {
    localStorage.removeItem('heladeria_user')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
