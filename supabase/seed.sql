-- ══════════════════════════════════════════════════════════════════
-- HELADERÍA APP — Datos iniciales
-- Ejecutar DESPUÉS de schema.sql
-- ══════════════════════════════════════════════════════════════════

-- ── Sabores ───────────────────────────────────────────────────────
INSERT INTO sabores (nombre, categoria, color, bachas_total, porciones_restantes, disponible) VALUES
  ('Plátano manjar',        'Especial', '#FCD34D', 2, 60, true),
  ('Oreo crema',            'Especial', '#E2E8F0', 2, 60, true),
  ('Chocolate',             'Clásico',  '#92400E', 2, 60, true),
  ('Menta chocolate',       'Especial', '#6EE7B7', 1, 30, true),
  ('Frutilla',              'Frutal',   '#FCA5A5', 2, 60, true),
  ('Coco',                  'Clásico',  '#FEF9C3', 1, 30, true),
  ('Pasas al ron',          'Especial', '#C4B5FD', 1, 30, true),
  ('Vainilla',              'Clásico',  '#FDE68A', 2, 60, true),
  ('Snickers',              'Especial', '#78350F', 1, 30, true),
  ('Yogurt mango maracuya', 'Frutal',   '#FB923C', 1, 30, true),
  ('Yogurt Frambuesa',      'Frutal',   '#FDA4AF', 1, 30, true);

-- ── Paletas ───────────────────────────────────────────────────────
INSERT INTO paletas (nombre, precio, stock) VALUES
  ('Oreo crema',                    2500, 20),
  ('Oreo chocolate',                2500, 20),
  ('Unicornio',                     2500, 15),
  ('Plátano Nutella',               2500, 15),
  ('Frambuesa leche condensada',    2000, 18),
  ('Frutilla con leche condensada', 2000, 18),
  ('Maracuya con leche condensada', 2000, 18),
  ('Yogurt Frambuesa',              2000, 18),
  ('Lúcuma manjar',                 2000, 18),
  ('Plátano manjar',                2000, 20),
  ('Yogurt mango maracuya',         2000, 18),
  ('Cremosa de plátano',            2000, 15),
  ('Cremosa de lúcuma',             2000, 15),
  ('Frutilla',                      1500, 24),
  ('Frambuesa',                     1500, 24),
  ('Piña menta',                    1500, 20),
  ('Limón menta',                   1500, 20),
  ('Mango menta',                   1500, 20),
  ('Maracuya',                      1500, 22);

-- ── Gastos de muestra ─────────────────────────────────────────────
INSERT INTO gastos (fecha, categoria, descripcion, monto) VALUES
  (NOW(),                        'Personal',  'Pago turno mañana',           25000),
  (NOW(),                        'Insumos',   'Compra de conos y vasitos',   15000),
  (NOW() - INTERVAL '1 day',    'Insumos',   'Crema y azúcar al por mayor', 32000),
  (NOW() - INTERVAL '2 days',   'Servicios', 'Cuenta de luz local',         48000),
  (NOW() - INTERVAL '3 days',   'Personal',  'Pago turno tarde',            25000),
  (NOW() - INTERVAL '4 days',   'Insumos',   'Paletas de madera y envases', 12000),
  (NOW() - INTERVAL '5 days',   'Arriendo',  'Arriendo local (cuota)',     120000),
  (NOW() - INTERVAL '6 days',   'Otro',      'Materiales de limpieza',      8500);
