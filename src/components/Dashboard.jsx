import { useApp } from '../context/AppContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { clp } from '../data/initialData'

function StatCard({ titulo, valor, sub, borderColor, bgColor, textColor, icon }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${borderColor} flex items-center gap-4`}>
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide truncate">{titulo}</p>
        <p className={`text-2xl font-bold ${textColor} leading-tight mt-0.5`}>{valor}</p>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const TooltipBar = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-sky-600">{payload[0].value} ventas</p>
    </div>
  )
}

const TooltipArea = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-pink-500">{clp(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard() {
  const { sabores, paletas, ventas, alertas, gastos, metas } = useApp()

  const hoyStr = new Date().toDateString()
  const ventasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === hoyStr)
  const ingresosHoy = ventasHoy.reduce((s, v) => s + v.total, 0)
  const gastosHoy = gastos.filter(g => new Date(g.fecha).toDateString() === hoyStr).reduce((s, g) => s + g.monto, 0)
  const gananciaNeta = ingresosHoy - gastosHoy
  const metaPct = metas.diaria > 0 ? Math.round((ingresosHoy / metas.diaria) * 100) : 0
  const saboresDisponibles = sabores.filter(s => s.disponible && s.porcionesRestantes > 0).length

  // Últimos 7 días para gráficas
  const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dStr = d.toDateString()
    const dvd = ventas.filter(v => new Date(v.fecha).toDateString() === dStr)
    return {
      dia: d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }),
      ventas: dvd.length,
      ingresos: dvd.reduce((s, v) => s + v.total, 0),
    }
  })

  // Top 5 sabores más vendidos (por bolas)
  const conteoSabores = {}
  ventas.forEach(v => {
    v.saboresElegidos.forEach(nombre => {
      conteoSabores[nombre] = (conteoSabores[nombre] || 0) + 1
    })
  })
  const top5 = Object.entries(conteoSabores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, bolas]) => ({ nombre, bolas }))

  const maxBolas = top5[0]?.bolas || 1

  const fechaLarga = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-400 text-sm capitalize">{fechaLarga}</p>
      </div>

      {/* Alertas banner */}
      {alertas.length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="font-semibold text-pink-700 text-sm">
              {alertas.length} sabor{alertas.length > 1 ? 'es' : ''} con stock crítico
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertas.map(s => (
              <span key={s.id} className="bg-pink-100 text-pink-700 text-xs font-medium px-3 py-1 rounded-full">
                {s.nombre}: {s.porcionesRestantes} porciones
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          titulo="Sabores disponibles"
          valor={saboresDisponibles}
          sub={`de ${sabores.length} sabores totales`}
          borderColor="border-sky-400"
          bgColor="bg-sky-50"
          textColor="text-sky-600"
          icon="🍦"
        />
        <StatCard
          titulo="Ventas hoy"
          valor={ventasHoy.length}
          sub="transacciones registradas"
          borderColor="border-sky-400"
          bgColor="bg-sky-50"
          textColor="text-sky-600"
          icon="🛒"
        />
        <StatCard
          titulo="Ingresos hoy"
          valor={clp(ingresosHoy)}
          sub="pesos chilenos"
          borderColor="border-pink-400"
          bgColor="bg-pink-50"
          textColor="text-pink-600"
          icon="💰"
        />
        <StatCard
          titulo="Alertas de stock"
          valor={alertas.length}
          sub={alertas.length === 0 ? 'Todo en orden' : 'requieren reposición'}
          borderColor={alertas.length > 0 ? 'border-pink-400' : 'border-emerald-400'}
          bgColor={alertas.length > 0 ? 'bg-pink-50' : 'bg-emerald-50'}
          textColor={alertas.length > 0 ? 'text-pink-600' : 'text-emerald-600'}
          icon={alertas.length > 0 ? '⚠️' : '✅'}
        />
        <StatCard
          titulo="Ganancia hoy"
          valor={clp(Math.abs(gananciaNeta))}
          sub={gananciaNeta >= 0 ? 'ingresos − gastos (positivo)' : 'ingresos − gastos (negativo)'}
          borderColor={gananciaNeta >= 0 ? 'border-emerald-400' : 'border-red-400'}
          bgColor={gananciaNeta >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
          textColor={gananciaNeta >= 0 ? 'text-emerald-600' : 'text-red-600'}
          icon={gananciaNeta >= 0 ? '📈' : '📉'}
        />
        {/* Meta del día */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-amber-400 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl shrink-0">🎯</div>
            <div className="min-w-0">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Meta del día</p>
              <p className="text-2xl font-bold text-amber-600 leading-tight mt-0.5">{metaPct}%</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${metaPct >= 100 ? 'bg-emerald-400' : metaPct >= 60 ? 'bg-amber-400' : 'bg-pink-400'}`}
              style={{ width: `${Math.min(100, metaPct)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">{clp(ingresosHoy)} / {clp(metas.diaria)}</p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Ventas por día */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-5">Ventas — últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ultimos7} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipBar />} />
              <Bar dataKey="ventas" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ingresos por día */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-5">Ingresos CLP — últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ultimos7} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f9a8d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f9a8d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TooltipArea />} />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#f472b6"
                fill="url(#gradIngresos)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f472b6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 sabores + Estado paletas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top 5 sabores */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">🏆 Top 5 — Sabores más vendidos</h3>
          {top5.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin ventas registradas.</p>
          ) : (
            <div className="space-y-3">
              {top5.map((item, i) => (
                <div key={item.nombre} className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-orange-100 text-orange-500' : 'bg-sky-50 text-sky-400'}`}>
                    {i + 1}
                  </span>
                  <span className="w-36 text-sm text-gray-700 font-medium truncate">{item.nombre}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-sky-400 h-2 rounded-full transition-all"
                      style={{ width: `${(item.bolas / maxBolas) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-20 text-right">{item.bolas} bolas</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estado paletas */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">🍭 Stock de Paletas</h3>
          <div className="space-y-3">
            {paletas.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium truncate flex-1">{p.nombre}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${p.stock < 5 ? 'bg-pink-400' : p.stock < 10 ? 'bg-amber-400' : 'bg-sky-400'}`}
                      style={{ width: `${Math.min(100, (p.stock / 30) * 100)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${p.stock < 5 ? 'text-pink-500' : 'text-gray-700'}`}>
                    {p.stock} und
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
