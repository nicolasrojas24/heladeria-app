import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { PORCIONES_POR_BACHA } from '../data/initialData'

const CATEGORIAS = ['Clásico', 'Frutal', 'Especial']

const COLORES_PRESET = [
  '#FDE68A', '#FCA5A5', '#FCD34D', '#6EE7B7', '#D97706',
  '#CBD5E1', '#D9F99D', '#C4B5FD', '#86EFAC', '#92400E',
  '#FBCFE8', '#BAE6FD', '#FED7AA', '#A7F3D0', '#DDD6FE',
]

function ModalSabor({ sabor, onClose, onSave }) {
  const [form, setForm] = useState(sabor
    ? { nombre: sabor.nombre, categoria: sabor.categoria, color: sabor.color, bachasTotal: sabor.bachasTotal }
    : { nombre: '', categoria: 'Clásico', color: '#FDE68A', bachasTotal: 1 }
  )

  const set = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'bachasTotal' ? Number(value) : value }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-gray-800 mb-5">
          {sabor ? '✏️ Editar Sabor' : '🍦 Nuevo Sabor'}
        </h3>
        <form onSubmit={e => { e.preventDefault(); if (form.nombre.trim()) onSave(form) }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre del sabor</label>
            <input
              name="nombre" value={form.nombre} onChange={set} required
              placeholder="Ej. Vainilla Francesa"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</label>
              <select name="categoria" value={form.categoria} onChange={set}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bachas iniciales</label>
              <input
                type="number" name="bachasTotal" value={form.bachasTotal} onChange={set} min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <p className="text-xs text-gray-400 mt-1">{form.bachasTotal * PORCIONES_POR_BACHA} porciones</p>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Color del sabor</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLORES_PRESET.map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === c ? 'border-sky-500 scale-110 shadow' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color" value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                title="Color personalizado"
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
              {sabor ? 'Guardar cambios' : 'Agregar sabor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Sabores() {
  const { sabores, updateSabor, addSabor, deleteSabor } = useApp()
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'admin'
  const [modal, setModal] = useState(null) // null | { modo:'add' } | { modo:'edit', sabor }
  const [confirmDel, setConfirmDel] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [catFiltro, setCatFiltro] = useState('Todas')

  const filtrados = sabores.filter(s => {
    const matchNombre = s.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchCat    = catFiltro === 'Todas' || s.categoria === catFiltro
    return matchNombre && matchCat
  })

  const handleSave = (form) => {
    if (modal.modo === 'add') addSabor(form)
    else updateSabor(modal.sabor.id, form)
    setModal(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sabores</h2>
          <p className="text-gray-400 text-sm">
            {sabores.filter(s => s.disponible && s.porcionesRestantes > 0).length} disponibles · {sabores.length} sabores totales
          </p>
        </div>
        {esAdmin && (
          <button
            onClick={() => setModal({ modo: 'add' })}
            className="bg-sky-500 text-white px-5 py-2.5 rounded-xl hover:bg-sky-600 transition font-semibold text-sm flex items-center gap-2 self-start sm:self-auto">
            + Nuevo Sabor
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍  Buscar sabor..."
          className="border border-gray-200 rounded-xl px-4 py-2.5 flex-1 min-w-48 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
        />
        <select
          value={catFiltro}
          onChange={e => setCatFiltro(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white">
          <option>Todas</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid de sabores */}
      {filtrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtrados.map(s => {
            const agotado = s.porcionesRestantes === 0
            const stockBajo = s.porcionesRestantes < 15 && !agotado
            return (
              <div key={s.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md ${!s.disponible || agotado ? 'opacity-70' : ''}`}>
                {/* Color banner */}
                <div className="h-16 w-full relative" style={{ backgroundColor: s.color }}>
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">🍦</div>
                  {/* Estado badge */}
                  <div className="absolute top-2 right-2">
                    {agotado ? (
                      <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">AGOTADO</span>
                    ) : stockBajo ? (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">STOCK BAJO</span>
                    ) : s.disponible ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">DISPONIBLE</span>
                    ) : (
                      <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PAUSADO</span>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-bold text-gray-800">{s.nombre}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${s.categoria === 'Clásico'  ? 'bg-sky-100 text-sky-700' :
                        s.categoria === 'Frutal'   ? 'bg-emerald-100 text-emerald-700' :
                                                     'bg-purple-100 text-purple-700'}`}>
                      {s.categoria}
                    </span>
                  </div>

                  {/* Porciones */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{s.bachasTotal} bachas</span>
                      <span className={agotado ? 'text-pink-500 font-semibold' : stockBajo ? 'text-amber-600 font-semibold' : ''}>
                        {s.porcionesRestantes} porciones
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all
                          ${agotado ? 'bg-pink-400' : stockBajo ? 'bg-amber-400' : 'bg-sky-400'}`}
                        style={{ width: `${Math.min(100, (s.porcionesRestantes / Math.max(s.bachasTotal * PORCIONES_POR_BACHA, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Toggle disponible */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-500">Disponible para venta</span>
                    <button
                      onClick={() => esAdmin && updateSabor(s.id, { disponible: !s.disponible })}
                      disabled={agotado || !esAdmin}
                      className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-40
                        ${s.disponible && !agotado ? 'bg-sky-400' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all
                        ${s.disponible && !agotado ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {/* Acciones (solo admin) */}
                  {esAdmin && (
                    <div className="flex gap-2 pt-1 border-t border-gray-100">
                      <button
                        onClick={() => setModal({ modo: 'edit', sabor: s })}
                        className="flex-1 border border-sky-200 text-sky-600 rounded-xl py-2 text-xs font-semibold hover:bg-sky-50 transition">
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDel(s)}
                        className="flex-1 border border-pink-200 text-pink-500 rounded-xl py-2 text-xs font-semibold hover:bg-pink-50 transition">
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-sm">No se encontraron sabores</p>
        </div>
      )}

      {/* Modal sabor */}
      {modal && (
        <ModalSabor
          sabor={modal.sabor}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Confirm delete */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar sabor?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Se eliminará <span className="font-semibold text-gray-700">"{confirmDel.nombre}"</span> permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => { deleteSabor(confirmDel.id); setConfirmDel(null) }}
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
