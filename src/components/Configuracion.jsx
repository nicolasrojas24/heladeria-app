import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { clp } from '../data/initialData'

const PAGINAS = [
  { id: 'dashboard',     label: '📊 Dashboard' },
  { id: 'inventario',    label: '🪣 Inventario' },
  { id: 'sabores',       label: '🍨 Sabores' },
  { id: 'ventas',        label: '🛒 Ventas' },
  { id: 'gastos',        label: '💸 Gastos' },
  { id: 'reportes',      label: '📈 Reportes' },
  { id: 'configuracion', label: '⚙️ Configuración' },
]

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
function Seguridad({ usuario, updatePerfil }) {
  const [formPass, setFormPass] = useState({ nueva: '', confirmar: '' })
  const [errorPass, setErrorPass]   = useState('')
  const [okPass, setOkPass]         = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)

  const [paginaInicio, setPaginaInicio] = useState(usuario?.pagina_inicio || 'dashboard')
  const [okPagina, setOkPagina]         = useState(false)
  const [loadingPagina, setLoadingPagina] = useState(false)

  const handlePassword = async (e) => {
    e.preventDefault()
    setErrorPass('')
    setOkPass(false)
    if (formPass.nueva.length < 6) { setErrorPass('La contraseña debe tener al menos 6 caracteres.'); return }
    if (formPass.nueva !== formPass.confirmar) { setErrorPass('Las contraseñas no coinciden.'); return }
    setLoadingPass(true)
    const { error: err } = await supabase.auth.updateUser({ password: formPass.nueva })
    setLoadingPass(false)
    if (err) { setErrorPass('Error: ' + err.message); return }
    setOkPass(true)
    setFormPass({ nueva: '', confirmar: '' })
    setTimeout(() => setOkPass(false), 4000)
  }

  const handlePaginaInicio = async () => {
    setLoadingPagina(true)
    await updatePerfil({ pagina_inicio: paginaInicio })
    setLoadingPagina(false)
    setOkPagina(true)
    setTimeout(() => setOkPagina(false), 3000)
  }

  return (
    <div className="max-w-md space-y-6">
      {/* Info del usuario */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">
          {usuario?.rol === 'admin' ? '👑' : '👁️'}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-lg">{usuario?.nombre}</p>
          <p className="text-xs text-gray-400">{usuario?.email}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block
            ${usuario?.rol === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'}`}>
            {usuario?.rol === 'admin' ? 'Administrador' : 'Solo lectura'}
          </span>
        </div>
      </div>

      {/* Página de inicio */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="font-semibold text-gray-700">🏠 Página de inicio</h4>
        <p className="text-xs text-gray-400">Al iniciar sesión, irás directamente a esta sección.</p>
        <select
          value={paginaInicio}
          onChange={e => setPaginaInicio(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
          {PAGINAS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        {okPagina && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm">
            ✅ Página de inicio guardada
          </div>
        )}
        <button
          onClick={handlePaginaInicio}
          disabled={loadingPagina}
          className="w-full bg-sky-500 text-white py-2.5 rounded-xl hover:bg-sky-600 transition font-semibold text-sm disabled:opacity-60">
          {loadingPagina ? 'Guardando...' : 'Guardar preferencia'}
        </button>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="font-semibold text-gray-700">🔑 Cambiar contraseña</h4>
        {errorPass && (
          <div className="bg-pink-50 border border-pink-200 text-pink-700 rounded-xl p-3 text-sm">{errorPass}</div>
        )}
        {okPass && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm">
            ✅ Contraseña actualizada correctamente
          </div>
        )}
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nueva contraseña</label>
            <input
              type="password"
              value={formPass.nueva}
              onChange={e => setFormPass(f => ({ ...f, nueva: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirmar contraseña</label>
            <input
              type="password"
              value={formPass.confirmar}
              onChange={e => setFormPass(f => ({ ...f, confirmar: e.target.value }))}
              placeholder="Repetir contraseña"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPass}
            className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition font-semibold text-sm disabled:opacity-60">
            {loadingPass ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Tab Usuarios ──────────────────────────────────────────────────
function Usuarios({ perfiles, updateRol, usuarioActual }) {
  const [confirmRol, setConfirmRol] = useState(null)
  const [guardando, setGuardando]   = useState(null)

  const [formNuevo, setFormNuevo] = useState({ nombre: '', email: '', password: '', rol: 'lector' })
  const [errorNuevo, setErrorNuevo] = useState('')
  const [okNuevo, setOkNuevo]       = useState(false)
  const [creando, setCreando]       = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)

  const ROL_LABEL = { admin: 'Administrador', lector: 'Solo lectura' }
  const ROL_ICON  = { admin: '👑', lector: '👁️' }

  const handleCambiarRol = async () => {
    if (!confirmRol) return
    setGuardando(confirmRol.perfil.id)
    await updateRol(confirmRol.perfil.id, confirmRol.nuevoRol)
    setGuardando(null)
    setConfirmRol(null)
  }

  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    setErrorNuevo('')
    setOkNuevo(false)
    if (formNuevo.password.length < 6) { setErrorNuevo('La contraseña debe tener al menos 6 caracteres.'); return }

    setCreando(true)
    // 1. Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formNuevo.email.trim(),
      password: formNuevo.password,
    })
    if (error) { setErrorNuevo('Error: ' + error.message); setCreando(false); return }

    // 2. Actualizar perfil con nombre y rol correctos (el trigger ya creó la fila)
    if (data?.user?.id) {
      await supabase.from('perfiles').update({
        nombre:        formNuevo.nombre.trim(),
        rol:           formNuevo.rol,
        pagina_inicio: 'dashboard',
      }).eq('id', data.user.id)
    }

    setCreando(false)
    setOkNuevo(true)
    setFormNuevo({ nombre: '', email: '', password: '', rol: 'lector' })
    setTimeout(() => { setOkNuevo(false); setMostrarForm(false) }, 4000)
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sm text-sky-700">
        <p className="font-semibold mb-1">Gestión de accesos</p>
        <p className="text-xs">
          Cada usuario se loguea con su correo y contraseña. Sus preferencias
          (página de inicio, contraseña) quedan guardadas en su propio perfil en Supabase.
        </p>
      </div>

      {/* Lista de usuarios */}
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
                    <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-xl shrink-0">
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
                      onClick={() => setConfirmRol({ perfil: p, nuevoRol: p.rol === 'admin' ? 'lector' : 'admin' })}
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

      {/* Crear nuevo usuario */}
      {!mostrarForm ? (
        <button
          onClick={() => setMostrarForm(true)}
          className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition font-semibold text-sm">
          + Agregar nuevo usuario
        </button>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-700">Nuevo usuario</h4>
            <button onClick={() => { setMostrarForm(false); setErrorNuevo('') }}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
            El usuario recibirá un correo de confirmación de Supabase. Para omitirlo,
            deshabilita "Enable email confirmations" en Supabase → Authentication → Settings.
          </div>

          {errorNuevo && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 rounded-xl p-3 text-sm">{errorNuevo}</div>
          )}
          {okNuevo && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm">
              ✅ Usuario creado. Ya puede iniciar sesión con su correo y contraseña.
            </div>
          )}

          <form onSubmit={handleCrearUsuario} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</label>
              <input
                type="text" value={formNuevo.nombre} required
                onChange={e => setFormNuevo(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej. María González"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Correo electrónico</label>
              <input
                type="email" value={formNuevo.email} required
                onChange={e => setFormNuevo(f => ({ ...f, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contraseña temporal</label>
              <input
                type="password" value={formNuevo.password} required
                onChange={e => setFormNuevo(f => ({ ...f, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</label>
              <select
                value={formNuevo.rol}
                onChange={e => setFormNuevo(f => ({ ...f, rol: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300">
                <option value="lector">👁️ Solo lectura</option>
                <option value="admin">👑 Administrador</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setMostrarForm(false); setErrorNuevo('') }}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" disabled={creando}
                className="flex-1 bg-sky-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-sky-600 transition disabled:opacity-60">
                {creando ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal cambiar rol */}
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
  const { usuario, updatePerfil } = useAuth()
  const esAdmin = usuario?.rol === 'admin'
  const tabsVisibles = TABS.filter(t => !t.adminOnly || esAdmin)
  const [tab, setTab] = useState(tabsVisibles[0].id)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Configuración</h2>
        <p className="text-gray-400 text-sm">Ajustes del sistema y preferencias personales</p>
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
      {tab === 'seguridad' && <Seguridad usuario={usuario} updatePerfil={updatePerfil} />}
      {tab === 'usuarios'  && esAdmin && <Usuarios perfiles={perfiles} updateRol={updateRol} usuarioActual={usuario} />}
    </div>
  )
}
