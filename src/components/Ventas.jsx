import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { PRECIOS_HELADO, clp } from '../data/initialData'

const TIPO_ICON = { cono: '🍦', vasito: '🥤', paleta: '🍭' }
const TIPO_LABEL = { cono: 'Cono', vasito: 'Vasito', paleta: 'Paleta' }

function DescVenta(v) {
  if (v.tipo === 'paleta') return `${v.paletaNombre} × ${v.cantidad}`
  return `${TIPO_LABEL[v.tipo]} ${v.bolas} bola${v.bolas > 1 ? 's' : ''} · ${v.saboresElegidos.join(', ')}`
}

export default function Ventas() {
  const { sabores, paletas, ventas, addVenta, deleteVenta } = useApp()
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'admin'

  // Form state
  const [tipo, setTipo] = useState('cono')
  const [bolas, setBolas] = useState(1)
  const [saboresElegidos, setSaboresElegidos] = useState([]) // array de nombres
  const [paletaId, setPaletaId] = useState('')
  const [cantidadPaleta, setCantidadPaleta] = useState(1)

  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0])
  const [error, setError]       = useState('')
  const [exito, setExito]       = useState('')
  const [confirmAnular, setConfirmAnular] = useState(null)

  // Sabores disponibles para vender
  const saboresDisp = sabores.filter(s => s.disponible && s.porcionesRestantes > 0)

  // Toggle sabor en la selección
  const toggleSabor = (nombre) => {
    setSaboresElegidos(prev => {
      if (prev.includes(nombre)) return prev.filter(s => s !== nombre)
      if (prev.length >= bolas) return [...prev.slice(0, bolas - 1), nombre]
      return [...prev, nombre]
    })
  }

  const handleBolasChange = (n) => {
    setBolas(n)
    setSaboresElegidos(prev => prev.slice(0, n))
  }

  const handleTipoChange = (t) => {
    setTipo(t)
    setSaboresElegidos([])
    setBolas(1)
    setPaletaId('')
    setCantidadPaleta(1)
    setError('')
    setExito('')
  }

  // Cálculo del total
  const paletaSel = paletas.find(p => p.id === Number(paletaId))
  const totalHelado = PRECIOS_HELADO[bolas] || 0
  const totalPaleta = paletaSel ? paletaSel.precio * cantidadPaleta : 0
  const total = tipo === 'paleta' ? totalPaleta : totalHelado

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setExito('')

    if (tipo === 'paleta') {
      if (!paletaId)              { setError('Selecciona una paleta.'); return }
      if (!paletaSel)             { setError('Paleta no encontrada.'); return }
      if (paletaSel.stock < cantidadPaleta) {
        setError(`Stock insuficiente. Disponible: ${paletaSel.stock} unidades.`); return
      }
      addVenta({
        tipo: 'paleta',
        bolas: 0,
        saboresElegidos: [],
        paletaId: paletaSel.id,
        paletaNombre: paletaSel.nombre,
        precio: paletaSel.precio,
        cantidad: cantidadPaleta,
        total: paletaSel.precio * cantidadPaleta,
      })
      setExito(`Venta registrada: ${cantidadPaleta}× ${paletaSel.nombre} — ${clp(total)}`)
      setPaletaId('')
      setCantidadPaleta(1)
    } else {
      if (saboresElegidos.length === 0) { setError('Selecciona al menos 1 sabor.'); return }
      if (saboresElegidos.length < bolas) {
        setError(`Debes elegir exactamente ${bolas} sabor${bolas > 1 ? 'es' : ''} (elegiste ${saboresElegidos.length}).`); return
      }
      addVenta({
        tipo,
        bolas,
        saboresElegidos,
        paletaId: null,
        paletaNombre: null,
        precio: totalHelado,
        cantidad: 1,
        total: totalHelado,
      })
      setExito(`Venta registrada: ${TIPO_LABEL[tipo]} ${bolas} bola${bolas > 1 ? 's' : ''} (${saboresElegidos.join(', ')}) — ${clp(total)}`)
      setSaboresElegidos([])
    }
  }

  // Historial filtrado
  const ventasDia    = ventas.filter(v => v.fecha.startsWith(fechaFiltro))
  const totalDia     = ventasDia.reduce((s, v) => s + v.total, 0)
  const porcionesDia = ventasDia.reduce((s, v) => s + (v.tipo !== 'paleta' ? v.bolas : 0), 0)
  const paletasDia   = ventasDia.filter(v => v.tipo === 'paleta').reduce((s, v) => s + v.cantidad, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Ventas</h2>
        <p className="text-gray-400 text-sm">
          {esAdmin ? 'Registra ventas y consulta el historial diario' : 'Consulta el historial diario de ventas'}
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-6 items-start ${esAdmin ? 'lg:grid-cols-5' : ''}`}>
        {/* ── Formulario (solo admin) ── */}
        {esAdmin && <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            🛒 Nueva Venta
          </h3>

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 rounded-xl p-3 text-sm">{error}</div>
          )}
          {exito && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm">{exito}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tipo */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Tipo</label>
              <div className="grid grid-cols-3 gap-2">
                {['cono', 'vasito', 'paleta'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => handleTipoChange(t)}
                    className={`py-3 rounded-xl flex flex-col items-center gap-1 text-sm font-semibold transition-all border-2
                      ${tipo === t
                        ? 'bg-sky-500 text-white border-sky-500 shadow'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300'}`}>
                    <span className="text-xl">{TIPO_ICON[t]}</span>
                    <span className="text-xs capitalize">{TIPO_LABEL[t]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── HELADO (cono / vasito) ── */}
            {tipo !== 'paleta' && (
              <>
                {/* Número de bolas */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Número de bolas
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(n => (
                      <button
                        key={n} type="button"
                        onClick={() => handleBolasChange(n)}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all border-2
                          ${bolas === n
                            ? 'bg-pink-100 text-pink-700 border-pink-300'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-200'}`}>
                        {n} bola{n > 1 ? 's' : ''}
                        <span className="block text-xs font-normal text-gray-400">{clp(PRECIOS_HELADO[n])}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sabores */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Elegir sabores ({saboresElegidos.length}/{bolas})
                  </label>
                  {saboresDisp.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                      {saboresDisp.map(s => {
                        const sel = saboresElegidos.includes(s.nombre)
                        return (
                          <button
                            key={s.id} type="button"
                            onClick={() => toggleSabor(s.nombre)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border-2
                              ${sel
                                ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-sky-200'}`}>
                            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                            {s.nombre}
                            {sel && <span className="text-sky-500">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-xl text-gray-400 text-sm">
                      <p className="text-2xl mb-1">😕</p>
                      <p>No hay sabores disponibles</p>
                    </div>
                  )}
                </div>

                {/* Total preview */}
                <div className="bg-sky-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total a cobrar:</span>
                  <span className="text-sky-600 text-2xl font-bold">{clp(totalHelado)}</span>
                </div>
              </>
            )}

            {/* ── PALETA ── */}
            {tipo === 'paleta' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Paleta</label>
                  <select
                    value={paletaId}
                    onChange={e => setPaletaId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white">
                    <option value="">Seleccionar paleta…</option>
                    {paletas.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock === 0}>
                        {p.nombre} — {clp(p.precio)}{p.stock === 0 ? ' (Sin stock)' : ` (${p.stock} und)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Cantidad</label>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setCantidadPaleta(c => Math.max(1, c - 1))}
                      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-pink-100 text-gray-700 flex items-center justify-center font-bold text-lg transition">
                      −
                    </button>
                    <span className="text-xl font-bold text-gray-800 w-8 text-center">{cantidadPaleta}</span>
                    <button type="button"
                      onClick={() => setCantidadPaleta(c => c + 1)}
                      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-sky-100 text-gray-700 flex items-center justify-center font-bold text-lg transition">
                      +
                    </button>
                  </div>
                </div>

                {paletaSel && (
                  <div className="bg-sky-50 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total a cobrar:</span>
                    <span className="text-sky-600 text-2xl font-bold">{clp(totalPaleta)}</span>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 active:scale-95 transition font-semibold text-sm shadow-sm shadow-sky-200">
              Registrar Venta
            </button>
          </form>
        </div>}

        {/* ── Historial ── */}
        <div className={`${esAdmin ? 'lg:col-span-3' : ''} bg-white rounded-2xl p-6 shadow-sm space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              📋 Historial del día
            </h3>
            <input
              type="date"
              value={fechaFiltro}
              onChange={e => setFechaFiltro(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
            />
          </div>

          {/* Resumen del día */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-sky-600">{ventasDia.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Transacciones</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-pink-500">{porcionesDia}</p>
              <p className="text-xs text-gray-400 mt-0.5">Bolas vendidas</p>
            </div>
            <div className="bg-sky-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-sky-600 leading-tight">{clp(totalDia)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Ingresos CLP</p>
            </div>
          </div>

          {/* Lista de ventas */}
          {ventasDia.length > 0 ? (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {ventasDia.map(v => (
                <div
                  key={v.id}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-sky-50/60 rounded-xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center text-lg shrink-0">
                      {TIPO_ICON[v.tipo]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate max-w-[180px]">
                        {DescVenta(v)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(v.fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">{clp(v.total)}</p>
                      {v.tipo !== 'paleta' && (
                        <p className="text-xs text-gray-400">{v.bolas} bola{v.bolas > 1 ? 's' : ''}</p>
                      )}
                      {v.tipo === 'paleta' && (
                        <p className="text-xs text-gray-400">{v.cantidad} × {clp(v.precio)}</p>
                      )}
                    </div>
                    {esAdmin && (
                      <button
                        onClick={() => setConfirmAnular(v)}
                        className="opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-400 text-xl leading-none"
                        title="Anular venta">
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-14 text-gray-400">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-sm">Sin ventas para esta fecha</p>
              <p className="text-xs mt-1 text-gray-300">
                {new Date(fechaFiltro + 'T12:00:00').toLocaleDateString('es-CL', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {confirmAnular && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <p className="text-4xl mb-3">🚫</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Anular esta venta?</h3>
            <p className="text-gray-500 text-sm mb-1">{DescVenta(confirmAnular)}</p>
            <p className="text-sky-600 font-bold text-lg mb-1">{clp(confirmAnular.total)}</p>
            <p className="text-xs text-gray-400 mb-6">
              Se restaurará el stock de {confirmAnular.tipo === 'paleta' ? 'la paleta' : 'los sabores'} automáticamente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAnular(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => { deleteVenta(confirmAnular); setConfirmAnular(null) }}
                className="flex-1 bg-pink-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-pink-600 transition">
                Anular venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
