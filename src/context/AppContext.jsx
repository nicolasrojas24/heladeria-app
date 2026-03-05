import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { saboresIniciales, paletasIniciales, ventasIniciales, gastosIniciales, metasIniciales, PORCIONES_POR_BACHA } from '../data/initialData'

const AppContext = createContext(null)

// ── localStorage helpers ──────────────────────────────────────────────────────
const load = (key, fallback) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [sabores, setSabores] = useState(() => load('heladeria_sabores', saboresIniciales))
  const [paletas, setPaletas] = useState(() => load('heladeria_paletas', paletasIniciales))
  const [ventas,  setVentas]  = useState(() => load('heladeria_ventas',  ventasIniciales))
  const [gastos,  setGastos]  = useState(() => load('heladeria_gastos',  gastosIniciales))
  const [metas,   setMetas]   = useState(() => load('heladeria_metas',   metasIniciales))

  // Persistir en localStorage cada vez que cambia el estado
  useEffect(() => { save('heladeria_sabores', sabores) }, [sabores])
  useEffect(() => { save('heladeria_paletas', paletas) }, [paletas])
  useEffect(() => { save('heladeria_ventas',  ventas)  }, [ventas])
  useEffect(() => { save('heladeria_gastos',  gastos)  }, [gastos])
  useEffect(() => { save('heladeria_metas',   metas)   }, [metas])

  // Alertas: sabores con menos de 15 porciones restantes y aún disponibles
  const alertas = sabores.filter(s => s.porcionesRestantes < 15 && s.disponible)

  // ── Ventas ──
  const addVenta = useCallback((venta) => {
    const nueva = { ...venta, id: Date.now(), fecha: new Date().toISOString() }
    setVentas(prev => [nueva, ...prev])

    if (venta.tipo === 'paleta') {
      setPaletas(prev => prev.map(p =>
        p.id === venta.paletaId
          ? { ...p, stock: Math.max(0, p.stock - venta.cantidad) }
          : p
      ))
    } else {
      const conteo = {}
      venta.saboresElegidos.forEach(nombre => {
        conteo[nombre] = (conteo[nombre] || 0) + 1
      })
      setSabores(prev => prev.map(s => {
        const deduccion = conteo[s.nombre] || 0
        if (!deduccion) return s
        const nuevasPorciones = Math.max(0, s.porcionesRestantes - deduccion)
        return {
          ...s,
          porcionesRestantes: nuevasPorciones,
          disponible: nuevasPorciones > 0 ? s.disponible : false,
        }
      }))
    }
  }, [])

  // ── Sabores ──
  const addSabor = useCallback((datos) => {
    setSabores(prev => [...prev, {
      ...datos,
      id: Date.now(),
      porcionesRestantes: datos.bachasTotal * PORCIONES_POR_BACHA,
      disponible: true,
    }])
  }, [])

  const updateSabor = useCallback((id, datos) => {
    setSabores(prev => prev.map(s => (s.id === id ? { ...s, ...datos } : s)))
  }, [])

  const deleteSabor = useCallback((id) => {
    setSabores(prev => prev.filter(s => s.id !== id))
  }, [])

  const addBacha = useCallback((saborId) => {
    setSabores(prev => prev.map(s =>
      s.id === saborId
        ? { ...s, bachasTotal: s.bachasTotal + 1, porcionesRestantes: s.porcionesRestantes + PORCIONES_POR_BACHA, disponible: true }
        : s
    ))
  }, [])

  const removeBacha = useCallback((saborId) => {
    setSabores(prev => prev.map(s => {
      if (s.id !== saborId || s.bachasTotal <= 0) return s
      const nuevasPorciones = Math.max(0, s.porcionesRestantes - PORCIONES_POR_BACHA)
      return {
        ...s,
        bachasTotal: Math.max(0, s.bachasTotal - 1),
        porcionesRestantes: nuevasPorciones,
        disponible: nuevasPorciones > 0 ? s.disponible : false,
      }
    }))
  }, [])

  // ── Gastos ──
  const addGasto = useCallback((datos) => {
    setGastos(prev => [{ ...datos, id: Date.now() }, ...prev])
  }, [])

  const deleteGasto = useCallback((id) => {
    setGastos(prev => prev.filter(g => g.id !== id))
  }, [])

  const updateMetas = useCallback((nuevasMetas) => {
    setMetas(prev => ({ ...prev, ...nuevasMetas }))
  }, [])

  // ── Paletas ──
  const addPaleta = useCallback((datos) => {
    setPaletas(prev => [...prev, { ...datos, id: Date.now() }])
  }, [])

  const updatePaleta = useCallback((id, datos) => {
    setPaletas(prev => prev.map(p => (p.id === id ? { ...p, ...datos } : p)))
  }, [])

  const deletePaleta = useCallback((id) => {
    setPaletas(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      sabores, paletas, ventas, alertas, gastos, metas,
      addVenta,
      addSabor, updateSabor, deleteSabor, addBacha, removeBacha,
      addPaleta, updatePaleta, deletePaleta,
      addGasto, deleteGasto, updateMetas,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
