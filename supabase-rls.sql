-- ================================================================
-- ROW LEVEL SECURITY — Heladería App
-- Ejecutar completo en: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ── Función helper: obtener rol del usuario actual ───────────────
-- SECURITY DEFINER permite leer 'perfiles' sin restricción de RLS
-- evitando referencias circulares al validar el rol.
CREATE OR REPLACE FUNCTION get_my_rol()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT rol FROM perfiles WHERE id = auth.uid()
$$;


-- ════════════════════════════════════════════════════════════════
-- PERFILES
-- Cada usuario solo puede leer su propio perfil.
-- ════════════════════════════════════════════════════════════════
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfiles: leer el propio"
  ON perfiles FOR SELECT
  USING (id = auth.uid());


-- ════════════════════════════════════════════════════════════════
-- SABORES
-- Lectura: cualquier usuario autenticado
-- Escritura / edición / borrado: solo admin
-- ════════════════════════════════════════════════════════════════
ALTER TABLE sabores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sabores: leer (autenticados)"
  ON sabores FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "sabores: insertar (admin)"
  ON sabores FOR INSERT
  WITH CHECK (get_my_rol() = 'admin');

CREATE POLICY "sabores: actualizar (admin)"
  ON sabores FOR UPDATE
  USING (get_my_rol() = 'admin');

CREATE POLICY "sabores: eliminar (admin)"
  ON sabores FOR DELETE
  USING (get_my_rol() = 'admin');


-- ════════════════════════════════════════════════════════════════
-- PALETAS
-- Lectura: cualquier usuario autenticado
-- Escritura / edición / borrado: solo admin
-- ════════════════════════════════════════════════════════════════
ALTER TABLE paletas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paletas: leer (autenticados)"
  ON paletas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "paletas: insertar (admin)"
  ON paletas FOR INSERT
  WITH CHECK (get_my_rol() = 'admin');

CREATE POLICY "paletas: actualizar (admin)"
  ON paletas FOR UPDATE
  USING (get_my_rol() = 'admin');

CREATE POLICY "paletas: eliminar (admin)"
  ON paletas FOR DELETE
  USING (get_my_rol() = 'admin');


-- ════════════════════════════════════════════════════════════════
-- VENTAS
-- Lectura: cualquier usuario autenticado
-- Insertar: solo admin
-- Update/Delete: bloqueado (integridad contable)
-- ════════════════════════════════════════════════════════════════
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ventas: leer (autenticados)"
  ON ventas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "ventas: insertar (admin)"
  ON ventas FOR INSERT
  WITH CHECK (get_my_rol() = 'admin');

-- UPDATE y DELETE no se crean intencionalmente:
-- nadie puede modificar ni borrar ventas directamente.


-- ════════════════════════════════════════════════════════════════
-- GASTOS
-- Lectura: cualquier usuario autenticado
-- Insertar / borrar: solo admin
-- ════════════════════════════════════════════════════════════════
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gastos: leer (autenticados)"
  ON gastos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "gastos: insertar (admin)"
  ON gastos FOR INSERT
  WITH CHECK (get_my_rol() = 'admin');

CREATE POLICY "gastos: eliminar (admin)"
  ON gastos FOR DELETE
  USING (get_my_rol() = 'admin');


-- ════════════════════════════════════════════════════════════════
-- METAS
-- Lectura: cualquier usuario autenticado
-- Actualizar: solo admin (siempre existe 1 sola fila con id=1)
-- ════════════════════════════════════════════════════════════════
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "metas: leer (autenticados)"
  ON metas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "metas: actualizar (admin)"
  ON metas FOR UPDATE
  USING (get_my_rol() = 'admin');


-- ================================================================
-- VERIFICACIÓN (opcional, ejecutar aparte para confirmar)
-- ================================================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';
--
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;
