const msDay = 86_400_000
const hace = (n) => new Date(Date.now() - n * msDay).toISOString()

export const PORCIONES_POR_BACHA = 30

// Precios por número de bolas (CLP)
export const PRECIOS_HELADO = { 1: 1500, 2: 2500, 3: 3000 }

// Formato CLP: $1.500, $2.000
export const clp = (n) => '$' + Number(n).toLocaleString('es-CL')

// ── Bachas de helado ──
// porcionesRestantes = bachasTotal * PORCIONES_POR_BACHA (estado inicial lleno)
export const saboresIniciales = [
  { id: 1,  nombre: 'Plátano manjar',        categoria: 'Especial', color: '#FCD34D', bachasTotal: 2, porcionesRestantes: 60, disponible: true },
  { id: 2,  nombre: 'Oreo crema',            categoria: 'Especial', color: '#E2E8F0', bachasTotal: 2, porcionesRestantes: 60, disponible: true },
  { id: 3,  nombre: 'Chocolate',             categoria: 'Clásico',  color: '#92400E', bachasTotal: 2, porcionesRestantes: 60, disponible: true },
  { id: 4,  nombre: 'Menta chocolate',       categoria: 'Especial', color: '#6EE7B7', bachasTotal: 1, porcionesRestantes: 30, disponible: true },
  { id: 5,  nombre: 'Frutilla',              categoria: 'Frutal',   color: '#FCA5A5', bachasTotal: 2, porcionesRestantes: 60, disponible: true },
  { id: 6,  nombre: 'Coco',                  categoria: 'Clásico',  color: '#FEF9C3', bachasTotal: 1, porcionesRestantes: 30, disponible: true },
  { id: 7,  nombre: 'Pasas al ron',          categoria: 'Especial', color: '#C4B5FD', bachasTotal: 1, porcionesRestantes: 30, disponible: true },
  { id: 8,  nombre: 'Vainilla',              categoria: 'Clásico',  color: '#FDE68A', bachasTotal: 2, porcionesRestantes: 60, disponible: true },
  { id: 9,  nombre: 'Snickers',              categoria: 'Especial', color: '#78350F', bachasTotal: 1, porcionesRestantes: 30, disponible: true },
  { id: 10, nombre: 'Yogurt mango maracuya', categoria: 'Frutal',   color: '#FB923C', bachasTotal: 1, porcionesRestantes: 30, disponible: true },
  { id: 11, nombre: 'Yogurt Frambuesa',      categoria: 'Frutal',   color: '#FDA4AF', bachasTotal: 1, porcionesRestantes: 30, disponible: true },
]

// ── Paletas ──
export const paletasIniciales = [
  // Especiales / cremosas premium
  { id: 1,  nombre: 'Oreo crema',                     precio: 2500, stock: 20 },
  { id: 2,  nombre: 'Oreo chocolate',                  precio: 2500, stock: 20 },
  { id: 3,  nombre: 'Unicornio',                       precio: 2500, stock: 15 },
  { id: 4,  nombre: 'Plátano Nutella',                 precio: 2500, stock: 15 },
  // Con leche condensada
  { id: 5,  nombre: 'Frambuesa leche condensada',      precio: 2000, stock: 18 },
  { id: 6,  nombre: 'Frutilla con leche condensada',   precio: 2000, stock: 18 },
  { id: 7,  nombre: 'Maracuya con leche condensada',   precio: 2000, stock: 18 },
  // Yogurt y manjar
  { id: 8,  nombre: 'Yogurt Frambuesa',                precio: 2000, stock: 18 },
  { id: 9,  nombre: 'Lúcuma manjar',                   precio: 2000, stock: 18 },
  { id: 10, nombre: 'Plátano manjar',                  precio: 2000, stock: 20 },
  { id: 11, nombre: 'Yogurt mango maracuya',           precio: 2000, stock: 18 },
  // Cremosas
  { id: 12, nombre: 'Cremosa de plátano',              precio: 2000, stock: 15 },
  { id: 13, nombre: 'Cremosa de lúcuma',               precio: 2000, stock: 15 },
  // Paletas de agua (frutas)
  { id: 14, nombre: 'Frutilla',                        precio: 1500, stock: 24 },
  { id: 15, nombre: 'Frambuesa',                       precio: 1500, stock: 24 },
  { id: 16, nombre: 'Piña menta',                      precio: 1500, stock: 20 },
  { id: 17, nombre: 'Limón menta',                     precio: 1500, stock: 20 },
  { id: 18, nombre: 'Mango menta',                     precio: 1500, stock: 20 },
  { id: 19, nombre: 'Maracuya',                        precio: 1500, stock: 22 },
]

// ── Gastos de muestra (últimos 7 días) ──
export const gastosIniciales = [
  { id: 1, fecha: hace(0), categoria: 'Personal',  descripcion: 'Pago turno mañana',              monto: 25000  },
  { id: 2, fecha: hace(0), categoria: 'Insumos',   descripcion: 'Compra de conos y vasitos',      monto: 15000  },
  { id: 3, fecha: hace(1), categoria: 'Insumos',   descripcion: 'Crema y azúcar al por mayor',    monto: 32000  },
  { id: 4, fecha: hace(2), categoria: 'Servicios', descripcion: 'Cuenta de luz local',            monto: 48000  },
  { id: 5, fecha: hace(3), categoria: 'Personal',  descripcion: 'Pago turno tarde',               monto: 25000  },
  { id: 6, fecha: hace(4), categoria: 'Insumos',   descripcion: 'Paletas de madera y envases',    monto: 12000  },
  { id: 7, fecha: hace(5), categoria: 'Arriendo',  descripcion: 'Arriendo local (cuota)',         monto: 120000 },
  { id: 8, fecha: hace(6), categoria: 'Otro',      descripcion: 'Materiales de limpieza',         monto: 8500   },
]

export const metasIniciales = { diaria: 80000, semanal: 500000, mensual: 2000000 }

// ── Ventas de muestra (últimos 7 días) ──
export const ventasIniciales = [
  // Hoy
  { id: 1,  fecha: hace(0), tipo: 'cono',   bolas: 2, saboresElegidos: ['Vainilla', 'Frutilla'],                          precio: 2500, cantidad: 1, total:  2500, paletaId: null, paletaNombre: null },
  { id: 2,  fecha: hace(0), tipo: 'vasito', bolas: 1, saboresElegidos: ['Chocolate'],                                     precio: 1500, cantidad: 1, total:  1500, paletaId: null, paletaNombre: null },
  { id: 3,  fecha: hace(0), tipo: 'paleta', bolas: 0, saboresElegidos: [],                                                precio: 1500, cantidad: 2, total:  3000, paletaId: 14,   paletaNombre: 'Frutilla' },
  { id: 4,  fecha: hace(0), tipo: 'cono',   bolas: 3, saboresElegidos: ['Vainilla', 'Chocolate', 'Oreo crema'],           precio: 3000, cantidad: 1, total:  3000, paletaId: null, paletaNombre: null },
  // Ayer
  { id: 5,  fecha: hace(1), tipo: 'vasito', bolas: 2, saboresElegidos: ['Plátano manjar', 'Frutilla'],                    precio: 2500, cantidad: 1, total:  2500, paletaId: null, paletaNombre: null },
  { id: 6,  fecha: hace(1), tipo: 'cono',   bolas: 1, saboresElegidos: ['Menta chocolate'],                               precio: 1500, cantidad: 1, total:  1500, paletaId: null, paletaNombre: null },
  { id: 7,  fecha: hace(1), tipo: 'paleta', bolas: 0, saboresElegidos: [],                                                precio: 2500, cantidad: 3, total:  7500, paletaId: 1,    paletaNombre: 'Oreo crema' },
  { id: 8,  fecha: hace(1), tipo: 'vasito', bolas: 3, saboresElegidos: ['Vainilla', 'Snickers', 'Oreo crema'],            precio: 3000, cantidad: 1, total:  3000, paletaId: null, paletaNombre: null },
  // Hace 2 días
  { id: 9,  fecha: hace(2), tipo: 'cono',   bolas: 2, saboresElegidos: ['Frutilla', 'Yogurt Frambuesa'],                  precio: 2500, cantidad: 1, total:  2500, paletaId: null, paletaNombre: null },
  { id: 10, fecha: hace(2), tipo: 'vasito', bolas: 1, saboresElegidos: ['Coco'],                                          precio: 1500, cantidad: 1, total:  1500, paletaId: null, paletaNombre: null },
  { id: 11, fecha: hace(2), tipo: 'paleta', bolas: 0, saboresElegidos: [],                                                precio: 2000, cantidad: 4, total:  8000, paletaId: 9,    paletaNombre: 'Lúcuma manjar' },
  // Hace 3 días
  { id: 12, fecha: hace(3), tipo: 'cono',   bolas: 3, saboresElegidos: ['Plátano manjar', 'Vainilla', 'Frutilla'],        precio: 3000, cantidad: 1, total:  3000, paletaId: null, paletaNombre: null },
  { id: 13, fecha: hace(3), tipo: 'vasito', bolas: 2, saboresElegidos: ['Chocolate', 'Oreo crema'],                       precio: 2500, cantidad: 1, total:  2500, paletaId: null, paletaNombre: null },
  { id: 14, fecha: hace(3), tipo: 'paleta', bolas: 0, saboresElegidos: [],                                                precio: 2000, cantidad: 2, total:  4000, paletaId: 12,   paletaNombre: 'Cremosa de plátano' },
  // Hace 4 días
  { id: 15, fecha: hace(4), tipo: 'cono',   bolas: 1, saboresElegidos: ['Vainilla'],                                      precio: 1500, cantidad: 1, total:  1500, paletaId: null, paletaNombre: null },
  { id: 16, fecha: hace(4), tipo: 'paleta', bolas: 0, saboresElegidos: [],                                                precio: 2500, cantidad: 5, total: 12500, paletaId: 4,    paletaNombre: 'Plátano Nutella' },
  { id: 17, fecha: hace(4), tipo: 'vasito', bolas: 2, saboresElegidos: ['Yogurt mango maracuya', 'Frutilla'],             precio: 2500, cantidad: 1, total:  2500, paletaId: null, paletaNombre: null },
  // Hace 5 días
  { id: 18, fecha: hace(5), tipo: 'vasito', bolas: 2, saboresElegidos: ['Menta chocolate', 'Chocolate'],                  precio: 2500, cantidad: 1, total:  2500, paletaId: null, paletaNombre: null },
  { id: 19, fecha: hace(5), tipo: 'cono',   bolas: 3, saboresElegidos: ['Vainilla', 'Frutilla', 'Yogurt mango maracuya'], precio: 3000, cantidad: 1, total:  3000, paletaId: null, paletaNombre: null },
  { id: 20, fecha: hace(5), tipo: 'paleta', bolas: 0, saboresElegidos: [],                                                precio: 2000, cantidad: 3, total:  6000, paletaId: 6,    paletaNombre: 'Frutilla con leche condensada' },
  // Hace 6 días
  { id: 21, fecha: hace(6), tipo: 'vasito', bolas: 1, saboresElegidos: ['Yogurt Frambuesa'],                              precio: 1500, cantidad: 1, total:  1500, paletaId: null, paletaNombre: null },
  { id: 22, fecha: hace(6), tipo: 'cono',   bolas: 2, saboresElegidos: ['Snickers', 'Oreo crema'],                        precio: 2500, cantidad: 1, total:  2500, paletaId: null, paletaNombre: null },
  { id: 23, fecha: hace(6), tipo: 'paleta', bolas: 0, saboresElegidos: [],                                                precio: 1500, cantidad: 6, total:  9000, paletaId: 15,   paletaNombre: 'Frambuesa' },
  { id: 24, fecha: hace(6), tipo: 'cono',   bolas: 1, saboresElegidos: ['Pasas al ron'],                                  precio: 1500, cantidad: 1, total:  1500, paletaId: null, paletaNombre: null },
]
