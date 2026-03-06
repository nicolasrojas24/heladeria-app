import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PORCIONES_POR_BACHA } from '../data/initialData'

const AppContext = createContext(null)

// ── Mappers DB (snake_case) → App (camelCase) ─────────────────────
const mapSabor = s => ({
  id:                 s.id,
  nombre:             s.nombre,
  categoria:          s.categoria,
  color:              s.color,
  bachasTotal:        s.bachas_total,
  porcionesRestantes: s.porciones_restantes,
  disponible:         s.disponible,
})

const mapVenta = v => ({
  id:              v.id,
  fecha:           v.fecha,
  tipo:            v.tipo,
  bolas:           v.bolas,
  saboresElegidos: v.sabores_elegidos || [],
  precio:          v.precio,
  cantidad:        v.cantidad,
  total:           v.total,
  paletaId:        v.paleta_id,
  paletaNombre:    v.paleta_nombre,
})

// ── Provider ──────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [sabores,  setSabores]  = useState([])
  const [paletas,  setPaletas]  = useState([])
  const [ventas,   setVentas]   = useState([])
  const [gastos,   setGastos]   = useState([])
  const [metas,    setMetas]    = useState({ diaria: 80000, semanal: 500000, mensual: 2000000 })
  const [cargando, setCargando] = useState(true)

  // Cargar todos los datos desde Supabase al montar
  useEffect(() => {
    async function cargar() {
      const [s, p, v, g, m] = await Promise.all([
        supabase.from('sabores').select('*').order('id'),
        supabase.from('paletas').select('*').order('id'),
        supabase.from('ventas').select('*').order('fecha', { ascending: false }),
        supabase.from('gastos').select('*').order('fecha', { ascending: false }),
        supabase.from('metas').select('*').eq('id', 1).single(),
      ])
      if (s.data) setSabores(s.data.map(mapSabor))
      if (p.data) setPaletas(p.data)
      if (v.data) setVentas(v.data.map(mapVenta))
      if (g.data) setGastos(g.data)
      if (m.data) setMetas({ diaria: m.data.diaria, semanal: m.data.semanal, mensual: m.data.mensual })
      setCargando(false)
    }
    cargar()
  }, [])

  const alertas = sabores.filter(s => s.porcionesRestantes < 15 && s.disponible)

  // ── Ventas ──
  const addVenta = useCallback(async (venta) => {
    const { data, error } = await supabase.from('ventas').insert({
      fecha:            new Date().toISOString(),
      tipo:             venta.tipo,
      bolas:            venta.bolas,
      sabores_elegidos: venta.saboresElegidos,
      precio:           venta.precio,
      cantidad:         venta.cantidad,
      total:            venta.total,
      paleta_id:        venta.paletaId,
      paleta_nombre:    venta.paletaNombre,
    }).select().single()

    if (error) { console.error('addVenta:', error); return }
    setVentas(prev => [mapVenta(data), ...prev])

    if (venta.tipo === 'paleta') {
      const paleta = paletas.find(p => p.id === venta.paletaId)
      if (!paleta) return
      const newStock = Math.max(0, paleta.stock - venta.cantidad)
      await supabase.from('paletas').update({ stock: newStock }).eq('id', venta.paletaId)
      setPaletas(prev => prev.map(p => p.id === venta.paletaId ? { ...p, stock: newStock } : p))
    } else {
      const conteo = {}
      venta.saboresElegidos.forEach(n => { conteo[n] = (conteo[n] || 0) + 1 })
      const nuevos = sabores.map(s => {
        const dec = conteo[s.nombre] || 0
        if (!dec) return s
        const p = Math.max(0, s.porcionesRestantes - dec)
        return { ...s, porcionesRestantes: p, disponible: p > 0 ? s.disponible : false }
      })
      setSabores(nuevos)
      for (const s of nuevos) {
        const orig = sabores.find(o => o.id === s.id)
        if (orig && (orig.porcionesRestantes !== s.porcionesRestantes || orig.disponible !== s.disponible)) {
          await supabase.from('sabores').update({
            porciones_restantes: s.porcionesRestantes,
            disponible: s.disponible,
          }).eq('id', s.id)
        }
      }
    }
  }, [paletas, sabores])

  // ── Sabores ──
  const addSabor = useCallback(async (datos) => {
    const { data, error } = await supabase.from('sabores').insert({
      nombre:              datos.nombre,
      categoria:           datos.categoria,
      color:               datos.color,
      bachas_total:        datos.bachasTotal,
      porciones_restantes: datos.bachasTotal * PORCIONES_POR_BACHA,
      disponible:          true,
    }).select().single()
    if (!error && data) setSabores(prev => [...prev, mapSabor(data)])
  }, [])

  const updateSabor = useCallback(async (id, datos) => {
    const db = {}
    if (datos.nombre             !== undefined) db.nombre              = datos.nombre
    if (datos.categoria          !== undefined) db.categoria           = datos.categoria
    if (datos.color              !== undefined) db.color               = datos.color
    if (datos.bachasTotal        !== undefined) db.bachas_total        = datos.bachasTotal
    if (datos.porcionesRestantes !== undefined) db.porciones_restantes = datos.porcionesRestantes
    if (datos.disponible         !== undefined) db.disponible          = datos.disponible
    const { error } = await supabase.from('sabores').update(db).eq('id', id)
    if (!error) setSabores(prev => prev.map(s => s.id === id ? { ...s, ...datos } : s))
  }, [])

  const deleteSabor = useCallback(async (id) => {
    const { error } = await supabase.from('sabores').delete().eq('id', id)
    if (!error) setSabores(prev => prev.filter(s => s.id !== id))
  }, [])

  const addBacha = useCallback(async (saborId) => {
    const s = sabores.find(x => x.id === saborId)
    if (!s) return
    const nb = s.bachasTotal + 1
    const np = s.porcionesRestantes + PORCIONES_POR_BACHA
    const { error } = await supabase.from('sabores').update({ bachas_total: nb, porciones_restantes: np, disponible: true }).eq('id', saborId)
    if (!error) setSabores(prev => prev.map(x => x.id === saborId ? { ...x, bachasTotal: nb, porcionesRestantes: np, disponible: true } : x))
  }, [sabores])

  const removeBacha = useCallback(async (saborId) => {
    const s = sabores.find(x => x.id === saborId)
    if (!s || s.bachasTotal <= 0) return
    const nb = Math.max(0, s.bachasTotal - 1)
    const np = Math.max(0, s.porcionesRestantes - PORCIONES_POR_BACHA)
    const disp = np > 0 ? s.disponible : false
    const { error } = await supabase.from('sabores').update({ bachas_total: nb, porciones_restantes: np, disponible: disp }).eq('id', saborId)
    if (!error) setSabores(prev => prev.map(x => x.id === saborId ? { ...x, bachasTotal: nb, porcionesRestantes: np, disponible: disp } : x))
  }, [sabores])

  // ── Gastos ──
  const addGasto = useCallback(async (datos) => {
    const { data, error } = await supabase.from('gastos').insert({
      fecha:       datos.fecha,
      categoria:   datos.categoria,
      descripcion: datos.descripcion,
      monto:       datos.monto,
    }).select().single()
    if (!error && data) setGastos(prev => [data, ...prev])
  }, [])

  const deleteGasto = useCallback(async (id) => {
    const { error } = await supabase.from('gastos').delete().eq('id', id)
    if (!error) setGastos(prev => prev.filter(g => g.id !== id))
  }, [])

  const updateMetas = useCallback(async (nuevasMetas) => {
    const { error } = await supabase.from('metas').update(nuevasMetas).eq('id', 1)
    if (!error) setMetas(prev => ({ ...prev, ...nuevasMetas }))
  }, [])

  // ── Paletas ──
  const addPaleta = useCallback(async (datos) => {
    const { data, error } = await supabase.from('paletas').insert(datos).select().single()
    if (!error && data) setPaletas(prev => [...prev, data])
  }, [])

  const updatePaleta = useCallback(async (id, datos) => {
    const { error } = await supabase.from('paletas').update(datos).eq('id', id)
    if (!error) setPaletas(prev => prev.map(p => p.id === id ? { ...p, ...datos } : p))
  }, [])

  const deletePaleta = useCallback(async (id) => {
    const { error } = await supabase.from('paletas').delete().eq('id', id)
    if (!error) setPaletas(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <AppContext.Provider value={{
      sabores, paletas, ventas, alertas, gastos, metas, cargando,
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
