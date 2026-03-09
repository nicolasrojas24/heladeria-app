-- ================================================================
-- PERFILES — Preferencias por usuario
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ── 1. Columna preferencia de página de inicio ───────────────────
ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS pagina_inicio TEXT DEFAULT 'dashboard';

UPDATE perfiles SET pagina_inicio = 'dashboard' WHERE pagina_inicio IS NULL;


-- ── 2. Política: cada usuario puede actualizar su propio perfil ──
-- Permite guardar pagina_inicio y otros cambios futuros.
-- La política de admin (perfiles: admin actualiza) ya cubre todo,
-- pero esta permite que cualquier usuario guarde sus preferencias.
CREATE POLICY "perfiles: usuario actualiza el propio"
  ON perfiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- ── Verificación ─────────────────────────────────────────────────
-- SELECT id, nombre, rol, pagina_inicio FROM perfiles;
