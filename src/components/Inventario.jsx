import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { PORCIONES_POR_BACHA, clp } from '../data/initialData'

function BarPorciones({ restantes, total }) {
  const pct = total > 0 ? Math.min(100, (restantes / total) * 100) : 0
  const color =
    pct < 20 ? 'bg-pink-400' :
    pct < 50 ? 'bg-amber-400' :
    'bg-sky-400'
  return (
    <div className="w-full">
      <div className="bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{restantes} / {total} porciones</p>
    </div>
  )
}

// ── Modal Agregar Paleta ──
function ModalPaleta({ paleta, onClose, onSave }) {
  const [form, setForm] = useState(paleta
    ? { nombre: paleta.nombre, precio: paleta.precio, stock: paleta.stock }
    : { nombre: '', precio: 1500, stock: 0 }
  )

  const set = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'nombre' ? value : Number(value) }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-gray-800 mb-5">
          {paleta ? '✏️ Editar Paleta' : '🍭 Nueva Paleta'}
        </h3>
        <form onSubmit={e => { e.preventDefault(); if (form.nombre.trim()) onSave(form) }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</label>
            <input
              name="nombre" value={form.nombre} onChange={set} required
              placeholder="Ej. Paleta de Fresa"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio (CLP)</label>
              <input
                type="number" name="precio" value={form.precio} onChange={set} min="0" step="50"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock (unidades)</label>
              <input
                type="number" name="stock" value={form.stock} onChange={set} min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 bg-sky-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-sky-600 transition">
              {paleta ? 'Guardar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Inventario() {
  const { sabores, paletas, alertas, addBacha, removeBacha, addPaleta, updatePaleta, deletePaleta } = useApp()
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'admin'
  const [tab, setTab] = useState('bachas')
  const [modalPaleta, setModalPaleta] = useState(null) // null | { modo:'add' } | { modo:'edit', paleta }
  const [confirmDel, setConfirmDel] = useState(null)

  const totalPorciones = sabores.reduce((s, f) => s + f.porcionesRestantes, 0)
  const totalBachas    = sabores.reduce((s, f) => s + f.bachasTotal, 0)

  const handleSavePaleta = (form) => {
    if (modalPaleta.modo === 'add') addPaleta(form)
    else updatePaleta(modalPaleta.paleta.id, form)
    setModalPaleta(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
        <p className="text-gray-400 text-sm">
          {totalBachas} bachas activas · {totalPorciones} porciones disponibles
        </p>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && tab === 'bachas' && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4">
          <p className="text-pink-700 font-semibold text-sm flex items-center gap-2 mb-2">
            ⚠️ {alertas.length} sabor{alertas.length > 1 ? 'es' : ''} con porciones críticas
          </p>
          <div className="flex flex-wrap gap-2">
            {alertas.map(s => (
              <span key={s.id} className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full font-medium">
                {s.nombre}: {s.porcionesRestantes} porciones restantes
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm w-fit">
        {[
          { id: 'bachas', label: '🪣 Bachas de Helado' },
          { id: 'paletas', label: '🍭 Paletas' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === t.id ? 'bg-sky-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BACHAS ── */}
      {tab === 'bachas' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-sky-50 border-b border-sky-100">
                <tr>
                  {['Sabor', 'Categoría', 'Bachas', 'Porciones estimadas', 'Porciones restantes', 'Estado'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-sky-700 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sabores.map(s => {
                  const alerta = s.porcionesRestantes < 15
                  const estimadas = s.bachasTotal * PORCIONES_POR_BACHA
                  return (
                    <tr key={s.id} className={`hover:bg-sky-50/40 transition-colors ${alerta ? 'bg-pink-50/30' : ''}`}>
                      {/* Sabor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg shrink-0 border border-white shadow-sm"
                            style={{ backgroundColor: s.color }} />
                          <span className="font-semibold text-gray-800 text-sm">{s.nombre}</span>
                        </div>
                      </td>
                      {/* Categoría */}
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                          ${s.categoria === 'Clásico'  ? 'bg-sky-100 text-sky-700' :
                            s.categoria === 'Frutal'   ? 'bg-emerald-100 text-emerald-700' :
                                                         'bg-purple-100 text-purple-700'}`}>
                          {s.categoria}
                        </span>
                      </td>
                      {/* Bachas con +/- */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {esAdmin ? (
                            <>
                              <button
                                onClick={() => removeBacha(s.id)}
                                disabled={s.bachasTotal <= 0}
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 disabled:opacity-30 flex items-center justify-center font-bold text-lg transition">
                                −
                              </button>
                              <span className="w-8 text-center font-bold text-gray-800">{s.bachasTotal}</span>
                              <button
                                onClick={() => addBacha(s.id)}
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-sky-100 text-gray-600 hover:text-sky-600 flex items-center justify-center font-bold text-lg transition">
                                +
                              </button>
                            </>
                          ) : (
                            <span className="font-bold text-gray-800">{s.bachasTotal}</span>
                          )}
                        </div>
                      </td>
                      {/* Porciones estimadas */}
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {estimadas} <span className="text-xs text-gray-400">({PORCIONES_POR_BACHA}/bacha)</span>
                      </td>
                      {/* Porciones restantes + barra */}
                      <td className="px-5 py-4 min-w-[160px]">
                        <BarPorciones restantes={s.porcionesRestantes} total={estimadas || PORCIONES_POR_BACHA} />
                      </td>
                      {/* Estado */}
                      <td className="px-5 py-4">
                        {s.porcionesRestantes === 0 ? (
                          <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2.5 py-1 rounded-full">Agotado</span>
                        ) : alerta ? (
                          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">Stock bajo</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">OK</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {esAdmin && (
            <div className="px-5 py-3 bg-sky-50/50 border-t border-sky-100 text-xs text-sky-600">
              💡 Usa los botones <strong>+</strong> / <strong>−</strong> para agregar o retirar bachas. Cada bacha suma {PORCIONES_POR_BACHA} porciones.
            </div>
          )}
        </div>
      )}

      {/* ── PALETAS ── */}
      {tab === 'paletas' && (
        <div className="space-y-4">
          {esAdmin && (
            <div className="flex justify-end">
              <button
                onClick={() => setModalPaleta({ modo: 'add' })}
                className="bg-sky-500 text-white px-5 py-2.5 rounded-xl hover:bg-sky-600 transition font-semibold text-sm flex items-center gap-2">
                + Nueva Paleta
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paletas.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{p.nombre}</p>
                    <p className="text-sky-600 font-semibold text-lg mt-0.5">{clp(p.precio)}</p>
                  </div>
                  <span className="text-3xl">🍭</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Stock</span>
                    <span className={p.stock < 5 ? 'text-pink-500 font-semibold' : ''}>{p.stock} unidades</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${p.stock < 5 ? 'bg-pink-400' : p.stock < 10 ? 'bg-amber-400' : 'bg-sky-400'}`}
                      style={{ width: `${Math.min(100, (p.stock / 30) * 100)}%` }}
                    />
                  </div>
                </div>

                {esAdmin && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setModalPaleta({ modo: 'edit', paleta: p })}
                      className="flex-1 border border-sky-200 text-sky-600 rounded-xl py-2 text-xs font-semibold hover:bg-sky-50 transition">
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmDel(p)}
                      className="flex-1 border border-pink-200 text-pink-500 rounded-xl py-2 text-xs font-semibold hover:bg-pink-50 transition">
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {paletas.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-3">🍭</p>
              <p className="text-sm">No hay paletas registradas</p>
            </div>
          )}
        </div>
      )}

      {/* Modal paleta */}
      {modalPaleta && (
        <ModalPaleta
          paleta={modalPaleta.paleta}
          onClose={() => setModalPaleta(null)}
          onSave={handleSavePaleta}
        />
      )}

      {/* Confirm delete paleta */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar paleta?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Se eliminará <span className="font-semibold text-gray-700">"{confirmDel.nombre}"</span> permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => { deletePaleta(confirmDel.id); setConfirmDel(null) }}
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
