import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { clp } from '../data/initialData'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ── Helpers ──────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().slice(0, 10)

function isSameDay(dateStr, refStr) {
  return new Date(dateStr).toDateString() === new Date(refStr).toDateString()
}

function rangoSemana() {
  const fin = new Date()
  const ini = new Date()
  ini.setDate(fin.getDate() - 6)
  return { ini, fin }
}

function rangoMes() {
  const fin = new Date()
  const ini = new Date(fin.getFullYear(), fin.getMonth(), 1)
  return { ini, fin }
}

function enRango(fecha, ini, fin) {
  const d = new Date(fecha)
  const i = new Date(ini); i.setHours(0, 0, 0, 0)
  const f = new Date(fin); f.setHours(23, 59, 59, 999)
  return d >= i && d <= f
}

function diasEnRango(ini, fin) {
  const days = []
  const cur = new Date(ini); cur.setHours(0, 0, 0, 0)
  const end = new Date(fin); end.setHours(23, 59, 59, 999)
  while (cur <= end) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

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

function ProgressBar({ pct }) {
  const color = pct >= 100 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-pink-400'
  return (
    <div className="w-full bg-gray-100 rounded-full h-3">
      <div className={`${color} h-3 rounded-full transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

const TooltipReporte = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2 text-sm space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {clp(p.value)}</p>
      ))}
    </div>
  )
}

// ── Tab 1: Cierre de caja ─────────────────────────────────────────────────────

function CierreCaja({ ventas, gastos }) {
  const [fecha, setFecha] = useState(todayStr())

  const ventasDia = ventas.filter(v => isSameDay(v.fecha, fecha))
  const gastosDia = gastos.filter(g => isSameDay(g.fecha, fecha))

  const ingresos = ventasDia.reduce((s, v) => s + v.total, 0)
  const totalGastos = gastosDia.reduce((s, g) => s + g.monto, 0)
  const ganancia = ingresos - totalGastos

  // Desglose ventas por tipo
  const tipoData = ['cono', 'vasito', 'paleta'].map(tipo => {
    const vs = ventasDia.filter(v => v.tipo === tipo)
    return { tipo, cantidad: vs.length, total: vs.reduce((s, v) => s + v.total, 0) }
  })

  // Desglose gastos por categoría
  const catMap = {}
  gastosDia.forEach(g => { catMap[g.categoria] = (catMap[g.categoria] || 0) + g.monto })
  const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1])

  const TIPO_LABEL = { cono: '🍦 Conos', vasito: '🥤 Vasitos', paleta: '🍭 Paletas' }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Fecha del cierre:</label>
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard titulo="Ingresos brutos" valor={clp(ingresos)} sub={`${ventasDia.length} ventas`} borderColor="border-sky-400" bgColor="bg-sky-50" textColor="text-sky-600" icon="💰" />
        <StatCard titulo="Total gastos" valor={clp(totalGastos)} sub={`${gastosDia.length} gastos`} borderColor="border-pink-400" bgColor="bg-pink-50" textColor="text-pink-600" icon="💸" />
        <StatCard
          titulo="Ganancia neta"
          valor={clp(Math.abs(ganancia))}
          sub={ganancia >= 0 ? 'positivo' : 'negativo'}
          borderColor={ganancia >= 0 ? 'border-emerald-400' : 'border-red-400'}
          bgColor={ganancia >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
          textColor={ganancia >= 0 ? 'text-emerald-600' : 'text-red-600'}
          icon={ganancia >= 0 ? '📈' : '📉'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-4">Ventas por tipo</h4>
          {ventasDia.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin ventas este día.</p>
          ) : (
            <div className="space-y-3">
              {tipoData.filter(t => t.cantidad > 0).map(t => (
                <div key={t.tipo} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">{TIPO_LABEL[t.tipo]}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">{t.cantidad} ventas</span>
                    <span className="text-sm font-semibold text-sky-600">{clp(t.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-4">Gastos por categoría</h4>
          {gastosDia.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin gastos este día.</p>
          ) : (
            <div className="space-y-3">
              {catData.map(([cat, monto]) => (
                <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                  <span className="text-sm font-semibold text-pink-600">{clp(monto)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Tab 2: Por período ────────────────────────────────────────────────────────

function PorPeriodo({ ventas, gastos }) {
  const [modo, setModo] = useState('semana') // 'semana' | 'mes' | 'custom'
  const [customIni, setCustomIni] = useState(todayStr())
  const [customFin, setCustomFin] = useState(todayStr())

  const { ini, fin } = modo === 'semana' ? rangoSemana() : modo === 'mes' ? rangoMes() : { ini: customIni, fin: customFin }

  const dias = diasEnRango(ini, fin)

  const chartData = dias.map(d => {
    const dStr = d.toDateString()
    const ingDia = ventas.filter(v => new Date(v.fecha).toDateString() === dStr).reduce((s, v) => s + v.total, 0)
    const gastDia = gastos.filter(g => new Date(g.fecha).toDateString() === dStr).reduce((s, g) => s + g.monto, 0)
    return {
      dia: d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }),
      Ingresos: ingDia,
      Gastos: gastDia,
    }
  })

  const ventasPeriodo = ventas.filter(v => enRango(v.fecha, ini, fin))
  const gastosPeriodo = gastos.filter(g => enRango(g.fecha, ini, fin))
  const totalIngresos = ventasPeriodo.reduce((s, v) => s + v.total, 0)
  const totalGastos = gastosPeriodo.reduce((s, g) => s + g.monto, 0)
  const ganancia = totalIngresos - totalGastos
  const ticketProm = ventasPeriodo.length > 0 ? Math.round(totalIngresos / ventasPeriodo.length) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        {['semana', 'mes', 'custom'].map(m => (
          <button
            key={m}
            onClick={() => setModo(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition
              ${modo === m ? 'bg-sky-500 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-sky-50'}`}
          >
            {m === 'semana' ? 'Última semana' : m === 'mes' ? 'Este mes' : 'Personalizado'}
          </button>
        ))}
        {modo === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customIni} onChange={e => setCustomIni(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
            <span className="text-gray-400 text-sm">—</span>
            <input type="date" value={customFin} onChange={e => setCustomFin(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard titulo="Ingresos" valor={clp(totalIngresos)} sub={`${ventasPeriodo.length} ventas`} borderColor="border-sky-400" bgColor="bg-sky-50" textColor="text-sky-600" icon="💰" />
        <StatCard titulo="Gastos" valor={clp(totalGastos)} sub={`${gastosPeriodo.length} registros`} borderColor="border-pink-400" bgColor="bg-pink-50" textColor="text-pink-600" icon="💸" />
        <StatCard
          titulo="Ganancia"
          valor={clp(Math.abs(ganancia))}
          sub={ganancia >= 0 ? 'positivo' : 'negativo'}
          borderColor={ganancia >= 0 ? 'border-emerald-400' : 'border-red-400'}
          bgColor={ganancia >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
          textColor={ganancia >= 0 ? 'text-emerald-600' : 'text-red-600'}
          icon={ganancia >= 0 ? '📈' : '📉'}
        />
        <StatCard titulo="Ticket promedio" valor={clp(ticketProm)} sub="por venta" borderColor="border-amber-400" bgColor="bg-amber-50" textColor="text-amber-600" icon="🎟️" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h4 className="font-semibold text-gray-700 mb-5">Ingresos vs Gastos por día</h4>
        {chartData.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin datos en este rango.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<TooltipReporte />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="Ingresos" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="#f472b6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

// ── Tab 3: Metas ──────────────────────────────────────────────────────────────

function Metas({ ventas, metas, updateMetas }) {
  const { usuario } = useAuth()
  const isAdmin = usuario?.rol === 'admin'
  const [editando, setEditando] = useState(false)
  const [draft, setDraft] = useState({ ...metas })

  const hoyStr = new Date().toDateString()
  const lunes = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); d.setHours(0,0,0,0); return d })()
  const mesIni = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const ingHoy = ventas.filter(v => new Date(v.fecha).toDateString() === hoyStr).reduce((s, v) => s + v.total, 0)
  const ingSemana = ventas.filter(v => new Date(v.fecha) >= lunes).reduce((s, v) => s + v.total, 0)
  const ingMes = ventas.filter(v => new Date(v.fecha) >= mesIni).reduce((s, v) => s + v.total, 0)

  const periodos = [
    { label: 'Meta diaria',   icon: '📅', ingresado: ingHoy,     meta: metas.diaria,   key: 'diaria' },
    { label: 'Meta semanal',  icon: '📆', ingresado: ingSemana,  meta: metas.semanal,  key: 'semanal' },
    { label: 'Meta mensual',  icon: '🗓️', ingresado: ingMes,     meta: metas.mensual,  key: 'mensual' },
  ]

  const handleSave = () => {
    updateMetas({
      diaria:   parseInt(draft.diaria)   || metas.diaria,
      semanal:  parseInt(draft.semanal)  || metas.semanal,
      mensual:  parseInt(draft.mensual)  || metas.mensual,
    })
    setEditando(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Progreso de metas de ingresos</p>
        {isAdmin && !editando && (
          <button onClick={() => { setDraft({ ...metas }); setEditando(true) }}
            className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition">
            ✏️ Editar metas
          </button>
        )}
        {isAdmin && editando && (
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition">Guardar</button>
            <button onClick={() => setEditando(false)} className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-xl transition">Cancelar</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {periodos.map(p => {
          const pct = p.meta > 0 ? Math.round((p.ingresado / p.meta) * 100) : 0
          const colorText = pct >= 100 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-pink-600'
          return (
            <div key={p.key} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <h4 className="font-semibold text-gray-700">{p.label}</h4>
              </div>
              {editando ? (
                <input
                  type="number"
                  value={draft[p.key]}
                  onChange={e => setDraft(d => ({ ...d, [p.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              ) : (
                <p className="text-xs text-gray-400">Meta: <span className="font-semibold text-gray-600">{clp(p.meta)}</span></p>
              )}
              <div className="space-y-2">
                <ProgressBar pct={pct} />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{clp(p.ingresado)} ingresado</span>
                  <span className={`font-bold ${colorText}`}>{pct}%</span>
                </div>
              </div>
              <p className={`text-lg font-bold ${colorText}`}>
                {pct >= 100 ? '✅ Meta cumplida' : `Faltan ${clp(Math.max(0, p.meta - p.ingresado))}`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'cierre',   label: '🧾 Cierre de caja' },
  { id: 'periodo',  label: '📊 Por período' },
  { id: 'metas',    label: '🎯 Metas' },
]

export default function Reportes() {
  const { ventas, gastos, metas, updateMetas } = useApp()
  const [tab, setTab] = useState('cierre')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">📈 Reportes</h2>
        <p className="text-gray-400 text-sm">Análisis financiero del negocio</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition
              ${tab === t.id ? 'bg-sky-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-sky-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cierre'  && <CierreCaja ventas={ventas} gastos={gastos} />}
      {tab === 'periodo' && <PorPeriodo ventas={ventas} gastos={gastos} />}
      {tab === 'metas'   && <Metas ventas={ventas} metas={metas} updateMetas={updateMetas} />}
    </div>
  )
}
