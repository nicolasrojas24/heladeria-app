-- ================================================================
-- ACTUALIZACIÓN Supabase — Heladería App
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ── 1. FIX CRÍTICO: política DELETE en ventas para admin ─────────
-- Sin esto, la función "Anular venta" falla silenciosamente.
CREATE POLICY "ventas: eliminar (admin)"
  ON ventas FOR DELETE
  USING (get_my_rol() = 'admin');


-- ── 2. Precios de helado editables en tabla metas ────────────────
ALTER TABLE metas
  ADD COLUMN IF NOT EXISTS precio_1bola  INTEGER DEFAULT 1500,
  ADD COLUMN IF NOT EXISTS precio_2bolas INTEGER DEFAULT 2500,
  ADD COLUMN IF NOT EXISTS precio_3bolas INTEGER DEFAULT 3000;

UPDATE metas
SET precio_1bola = 1500, precio_2bolas = 2500, precio_3bolas = 3000
WHERE id = 1;


-- ── 3. RLS perfiles: admin ve todos los usuarios ─────────────────
-- Reemplazar la política anterior (solo lectura propia) por una
-- que permite al admin ver todos los perfiles.
DROP POLICY IF EXISTS "perfiles: leer el propio" ON perfiles;

CREATE POLICY "perfiles: leer"
  ON perfiles FOR SELECT
  USING (id = auth.uid() OR get_my_rol() = 'admin');

-- Admin puede actualizar roles desde la app
CREATE POLICY "perfiles: admin actualiza"
  ON perfiles FOR UPDATE
  USING (get_my_rol() = 'admin');


-- ── Verificación (ejecutar aparte para confirmar) ────────────────
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;
