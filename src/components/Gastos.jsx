import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { clp } from '../data/initialData'

const CATEGORIAS = ['Insumos', 'Personal', 'Arriendo', 'Servicios', 'Otro']

const CAT_ICON = { Insumos: '🧂', Personal: '👤', Arriendo: '🏠', Servicios: '⚡', Otro: '📦' }
const CAT_COLOR = {
  Insumos:   'bg-amber-100 text-amber-700',
  Personal:  'bg-sky-100 text-sky-700',
  Arriendo:  'bg-violet-100 text-violet-700',
  Servicios: 'bg-orange-100 text-orange-700',
  Otro:      'bg-gray-100 text-gray-700',
}

function StatCard({ titulo, valor, sub, borderColor, bgColor, textColor, icon }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${borderColor} flex items-center gap-4`}>
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center text-2xl shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{titulo}</p>
        <p className={`text-2xl font-bold ${textColor} leading-tight mt-0.5`}>{valor}</p>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function Gastos() {
  const { gastos, addGasto, deleteGasto } = useApp()
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'admin'

  const [filtroFecha, setFiltroFecha] = useState('')
  const [form, setForm] = useState({ fecha: todayStr(), categoria: 'Insumos', descripcion: '', monto: '' })
  const [confirmDel, setConfirmDel] = useState(null)

  const hoyStr = new Date().toDateString()
  const mesActual = new Date().getMonth()
  const yearActual = new Date().getFullYear()

  const gastosHoy = gastos.filter(g => new Date(g.fecha).toDateString() === hoyStr)
  const gastosMes = gastos.filter(g => {
    const d = new Date(g.fecha)
    return d.getMonth() === mesActual && d.getFullYear() === yearActual
  })
  const totalHoy = gastosHoy.reduce((s, g) => s + g.monto, 0)
  const totalMes = gastosMes.reduce((s, g) => s + g.monto, 0)

  const porCat = {}
  gastosMes.forEach(g => { porCat[g.categoria] = (porCat[g.categoria] || 0) + g.monto })
  const catTop = Object.entries(porCat).sort((a, b) => b[1] - a[1])[0]

  const gastosOrdenados = [...gastos]
    .filter(g => filtroFecha ? g.fecha.slice(0, 10) === filtroFecha : true)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.descripcion.trim() || !form.monto) return
    addGasto({
      fecha: new Date(form.fecha + 'T12:00:00').toISOString(),
      categoria: form.categoria,
      descripcion: form.descripcion.trim(),
      monto: parseInt(form.monto),
    })
    setForm({ fecha: todayStr(), categoria: 'Insumos', descripcion: '', monto: '' })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">💸 Gastos</h2>
        <p className="text-gray-400 text-sm">Registro de gastos operacionales</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard titulo="Gastos hoy" valor={clp(totalHoy)} sub={`${gastosHoy.length} registro${gastosHoy.length !== 1 ? 's' : ''}`} borderColor="border-pink-400" bgColor="bg-pink-50" textColor="text-pink-600" icon="💸" />
        <StatCard titulo="Gastos del mes" valor={clp(totalMes)} sub={`${gastosMes.length} registros`} borderColor="border-sky-400" bgColor="bg-sky-50" textColor="text-sky-600" icon="📅" />
        <StatCard titulo="Mayor categoría" valor={catTop ? catTop[0] : '—'} sub={catTop ? clp(catTop[1]) + ' este mes' : 'Sin datos'} borderColor="border-amber-400" bgColor="bg-amber-50" textColor="text-amber-600" icon="📊" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {isAdmin && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4">Registrar gasto</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Ej: Compra de conos"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monto (CLP)</label>
                <input
                  type="number"
                  value={form.monto}
                  onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                  placeholder="Ej: 15000"
                  min="1"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-xl text-sm transition"
              >
                + Registrar gasto
              </button>
            </form>
          </div>
        )}

        <div className={`bg-white rounded-2xl p-6 shadow-sm ${isAdmin ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h3 className="font-semibold text-gray-700">Historial de gastos</h3>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filtroFecha}
                onChange={e => setFiltroFecha(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              {filtroFecha && (
                <button onClick={() => setFiltroFecha('')} className="text-xs text-gray-400 hover:text-gray-600 underline">
                  Limpiar
                </button>
              )}
            </div>
          </div>
          {gastosOrdenados.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay gastos para esta fecha.</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {gastosOrdenados.map(g => (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition group">
                  <span className="text-xl shrink-0">{CAT_ICON[g.categoria] || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{g.descripcion}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${CAT_COLOR[g.categoria] || 'bg-gray-100 text-gray-600'}`}>
                        {g.categoria}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(g.fecha).toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-pink-600 text-sm shrink-0">{clp(g.monto)}</span>
                  {isAdmin && (
                    <button
                      onClick={() => setConfirmDel(g)}
                      className="ml-1 text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100 text-lg leading-none"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar gasto?</h3>
            <p className="text-gray-500 text-sm mb-1">
              <span className="font-semibold text-gray-700">"{confirmDel.descripcion}"</span>
            </p>
            <p className="text-pink-600 font-bold text-lg mb-6">{clp(confirmDel.monto)}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => { deleteGasto(confirmDel.id); setConfirmDel(null) }}
                className="flex-1 bg-pink-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-pink-600 transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
