import { useState } from 'react'
import { useApp } from '../context/AppContext'

const CATEGORIAS = ['Clásico', 'Frutal', 'Especial']

const CATEGORIA_STYLE = {
  Clásico:  'bg-indigo-100 text-indigo-700',
  Frutal:   'bg-emerald-100 text-emerald-700',
  Especial: 'bg-purple-100 text-purple-700',
}

function StockBar({ stock, stockMinimo, stockMaximo }) {
  const pct = stockMaximo > 0 ? Math.min(100, (stock / stockMaximo) * 100) : 0
  const color =
    stock < stockMinimo           ? 'bg-red-500'
    : stock < stockMinimo * 1.5   ? 'bg-amber-400'
    : 'bg-emerald-500'

  return (
    <div className="w-36">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Mín {stockMinimo}</span>
        <span>Máx {stockMaximo}</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const FORM_VACIO = { nombre: '', categoria: 'Clásico', stock: 0, stockMinimo: 10, stockMaximo: 100, precio: 0, unidad: 'lt' }
const NUM_FIELDS = new Set(['stock', 'stockMinimo', 'stockMaximo', 'precio'])

function Modal({ modo, producto, onClose, onSave }) {
  const [form, setForm] = useState(producto ? { ...producto } : { ...FORM_VACIO })

  const set = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: NUM_FIELDS.has(name) ? Number(value) : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-gray-800 mb-5">
          {modo === 'add' ? '🍦 Nuevo Producto' : '✏️ Editar Producto'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</label>
            <input
              name="nombre" value={form.nombre} onChange={set} required
              placeholder="Ej. Vainilla Francesa"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</label>
              <select name="categoria" value={form.categoria} onChange={set}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Unidad</label>
              <select name="unidad" value={form.unidad} onChange={set}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="lt">Litros (lt)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="und">Unidades (und)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'stock',      label: 'Stock actual' },
              { name: 'stockMinimo', label: 'Mínimo' },
              { name: 'stockMaximo', label: 'Máximo' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{f.label}</label>
                <input
                  type="number" name={f.name} value={form[f.name]} onChange={set} min="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio por unidad</label>
            <input
              type="number" name="precio" value={form.precio} onChange={set} min="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition">
              {modo === 'add' ? 'Agregar' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Productos() {
  const { productos, alertas, addProducto, updateProducto, deleteProducto } = useApp()
  const [modal, setModal] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [catFiltro, setCatFiltro] = useState('Todas')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtrados = productos.filter(p => {
    const matchNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchCat    = catFiltro === 'Todas' || p.categoria === catFiltro
    return matchNombre && matchCat
  })

  const handleSave = (form) => {
    if (modal.modo === 'add') addProducto(form)
    else updateProducto(modal.producto.id, form)
    setModal(null)
  }

  const handleDelete = (id) => {
    deleteProducto(id)
    setConfirmDelete(null)
  }

  const valorInventario = productos.reduce((s, p) => s + p.stock * p.precio, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
          <p className="text-gray-400 text-sm">
            {productos.length} sabores · Valor inventario: ${valorInventario.toLocaleString('es-CO')}
          </p>
        </div>
        <button
          onClick={() => setModal({ modo: 'add' })}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition font-semibold text-sm flex items-center gap-2 self-start sm:self-auto">
          + Nuevo Producto
        </button>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 font-semibold text-sm flex items-center gap-2 mb-2">
            ⚠️ {alertas.length} producto{alertas.length > 1 ? 's' : ''} con stock crítico
          </p>
          <div className="flex flex-wrap gap-2">
            {alertas.map(p => (
              <span key={p.id} className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                {p.nombre}: {p.stock} / {p.stockMinimo} mín
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍  Buscar sabor..."
          className="border border-gray-200 rounded-xl px-4 py-2.5 flex-1 min-w-48 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <select
          value={catFiltro}
          onChange={e => setCatFiltro(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option>Todas</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Producto', 'Categoría', 'Stock', 'Nivel de stock', 'Precio', ''].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map(p => {
                const alerta = p.stock < p.stockMinimo
                return (
                  <tr key={p.id} className={`hover:bg-gray-50/70 transition-colors ${alerta ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-xl shrink-0">🍦</div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{p.nombre}</p>
                          {alerta && (
                            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                              ⚠️ Stock bajo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORIA_STYLE[p.categoria] || 'bg-gray-100 text-gray-600'}`}>
                        {p.categoria}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${alerta ? 'text-red-600' : 'text-gray-800'}`}>
                        {p.stock}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">{p.unidad}</span>
                    </td>

                    <td className="px-6 py-4">
                      <StockBar stock={p.stock} stockMinimo={p.stockMinimo} stockMaximo={p.stockMaximo} />
                    </td>

                    <td className="px-6 py-4 text-gray-700 text-sm font-medium">
                      ${p.precio.toLocaleString('es-CO')}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setModal({ modo: 'edit', producto: p })}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold mr-3 transition">
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p)}
                        className="text-red-400 hover:text-red-600 text-sm font-semibold transition">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-sm">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Modal agregar/editar */}
      {modal && (
        <Modal
          modo={modal.modo}
          producto={modal.producto}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar producto?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Se eliminará <span className="font-semibold text-gray-700">"{confirmDelete.nombre}"</span> permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600 transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
