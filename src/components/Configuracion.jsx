import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { clp } from '../data/initialData'

const TABS = [
  { id: 'precios',   label: '💰 Precios',   adminOnly: true  },
  { id: 'seguridad', label: '🔒 Seguridad',  adminOnly: false },
  { id: 'usuarios',  label: '👥 Usuarios',   adminOnly: true  },
]

// ── Tab Precios ───────────────────────────────────────────────────
function Precios({ metas, updateMetas }) {
  const [form, setForm] = useState({
    precio_1bola:  metas.precio_1bola,
    precio_2bolas: metas.precio_2bolas,
    precio_3bolas: metas.precio_3bolas,
  })
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk]               = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setGuardando(true)
    await updateMetas({
      precio_1bola:  Number(form.precio_1bola),
      precio_2bolas: Number(form.precio_2bolas),
      precio_3bolas: Number(form.precio_3bolas),
    })
    setGuardando(false)
    setOk(true)
    setTimeout(() => setOk(false), 3000)
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
        <p className="font-semibold mb-1">Precios de cono y vasito de helado</p>
        <p className="text-xs">Los cambios se aplican inmediatamente a nuevas ventas.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        {[
          { key: 'precio_1bola',  label: '1 bola',  icon: '🍦' },
          { key: 'precio_2bolas', label: '2 bolas', icon: '🍦🍦' },
          { key: 'precio_3bolas', label: '3 bolas', icon: '🍦🍦🍦' },
        ].map(({ key, label, icon }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              {icon} {label}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                min="0" step="50" required
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <span className="text-sky-600 font-semibold text-sm w-20 text-right">
                {clp(Number(form[key]) || 0)}
              </span>
            </div>
          </div>
        ))}

        {ok && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm text-center">
            ✅ Precios actualizados correctamente
          </div>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition font-semibold text-sm disabled:opacity-60">
          {guardando ? 'Guardando...' : 'Guardar precios'}
        </button>
      </form>
    </div>
  )
}

// ── Tab Seguridad ─────────────────────────────────────────────────
function Seguridad({ usuario }) {
  const [form, setForm]     = useState({ nueva: '', confirmar: '' })
  const [error, setError]   = useState('')
  const [ok, setOk]         = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOk(false)
    if (form.nueva.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (form.nueva !== form.confirmar) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password: form.nueva })
    setLoading(false)
    if (err) { setError('Error al cambiar contraseña: ' + err.message); return }
    setOk(true)
    setForm({ nueva: '', confirmar: '' })
    setTimeout(() => setOk(false), 4000)
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-2xl">
            {usuario?.rol === 'admin' ? '👑' : '👁️'}
          </div>
          <div>
            <p className="font-bold text-gray-800">{usuario?.nombre}</p>
            <p className="text-xs text-gray-400">{usuario?.email}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
              ${usuario?.rol === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'}`}>
              {usuario?.rol === 'admin' ? 'Administrador' : 'Solo lectura'}
            </span>
          </div>
        </div>

        <h4 className="font-semibold text-gray-700">Cambiar contraseña</h4>

        {error && (
          <div className="bg-pink-50 border border-pink-200 text-pink-700 rounded-xl p-3 text-sm">{error}</div>
        )}
        {ok && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm">
            ✅ Contraseña actualizada correctamente
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nueva contraseña</label>
            <input
              type="password"
              value={form.nueva}
              onChange={e => setForm(f => ({ ...f, nueva: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirmar contraseña</label>
            <input
              type="password"
              value={form.confirmar}
              onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
              placeholder="Repetir contraseña"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition font-semibold text-sm disabled:opacity-60">
            {loading ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Tab Usuarios ──────────────────────────────────────────────────
function Usuarios({ perfiles, updateRol, usuarioActual }) {
  const [confirmRol, setConfirmRol] = useState(null) // { perfil, nuevoRol }
  const [guardando, setGuardando]   = useState(null)

  const ROL_LABEL = { admin: 'Administrador', lector: 'Solo lectura' }
  const ROL_ICON  = { admin: '👑', lector: '👁️' }

  const handleCambiarRol = async () => {
    if (!confirmRol) return
    setGuardando(confirmRol.perfil.id)
    await updateRol(confirmRol.perfil.id, confirmRol.nuevoRol)
    setGuardando(null)
    setConfirmRol(null)
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sm text-sky-700">
        <p className="font-semibold mb-1">Gestión de accesos</p>
        <p className="text-xs">Puedes cambiar el rol de cada usuario. Para crear o eliminar usuarios usa el panel de Supabase.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {perfiles.length === 0 ? (
          <p className="p-6 text-gray-400 text-sm">No hay usuarios cargados.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {perfiles.map(p => {
              const esYo = p.id === usuarioActual?.id
              return (
                <div key={p.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-xl">
                      {ROL_ICON[p.rol] || '👤'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {p.nombre} {esYo && <span className="text-xs text-gray-400 font-normal">(tú)</span>}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${p.rol === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'}`}>
                        {ROL_LABEL[p.rol] || p.rol}
                      </span>
                    </div>
                  </div>
                  {!esYo && (
                    <button
                      disabled={guardando === p.id}
                      onClick={() => setConfirmRol({
                        perfil: p,
                        nuevoRol: p.rol === 'admin' ? 'lector' : 'admin',
                      })}
                      className="text-xs border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-sky-50 hover:border-sky-300 text-gray-500 hover:text-sky-700 transition disabled:opacity-50">
                      {guardando === p.id ? '...' : p.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {confirmRol && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <p className="text-4xl mb-3">🔄</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Cambiar rol?</h3>
            <p className="text-gray-500 text-sm mb-4">
              <span className="font-semibold text-gray-700">{confirmRol.perfil.nombre}</span> pasará a ser{' '}
              <span className="font-semibold text-sky-600">
                {confirmRol.nuevoRol === 'admin' ? 'Administrador' : 'Solo lectura'}
              </span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRol(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleCambiarRol}
                className="flex-1 bg-sky-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-sky-600 transition">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Configuracion() {
  const { metas, perfiles, updateMetas, updateRol } = useApp()
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'admin'
  const tabsVisibles = TABS.filter(t => !t.adminOnly || esAdmin)
  const [tab, setTab] = useState(tabsVisibles[0].id)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Configuración</h2>
        <p className="text-gray-400 text-sm">Ajustes del sistema</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabsVisibles.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition
              ${tab === t.id ? 'bg-sky-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-sky-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'precios'   && esAdmin && <Precios metas={metas} updateMetas={updateMetas} />}
      {tab === 'seguridad' && <Seguridad usuario={usuario} />}
      {tab === 'usuarios'  && esAdmin && <Usuarios perfiles={perfiles} updateRol={updateRol} usuarioActual={usuario} />}
    </div>
  )
}
