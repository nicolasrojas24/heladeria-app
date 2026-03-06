import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario]         = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)

  // Cargar perfil desde la tabla perfiles
  const cargarPerfil = async (user) => {
    const { data } = await supabase
      .from('perfiles')
      .select('nombre, rol')
      .eq('id', user.id)
      .single()
    if (data) {
      setUsuario({ id: user.id, email: user.email, nombre: data.nombre, rol: data.rol })
    }
  }

  // Verificar sesión existente al montar
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await cargarPerfil(session.user)
      setCargandoAuth(false)
    })

    // Escuchar cambios de sesión (login / logout / refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await cargarPerfil(session.user)
      } else {
        setUsuario(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargandoAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
