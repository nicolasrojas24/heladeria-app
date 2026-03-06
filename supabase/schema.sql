-- ══════════════════════════════════════════════════════════════════
-- HELADERÍA APP — Schema completo
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════════

-- ── Perfiles de usuario (roles) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles (
  id   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol    TEXT NOT NULL CHECK (rol IN ('admin', 'lector')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Sabores / Bachas ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sabores (
  id                  BIGSERIAL PRIMARY KEY,
  nombre              TEXT    NOT NULL,
  categoria           TEXT    NOT NULL,
  color               TEXT    NOT NULL DEFAULT '#94a3b8',
  bachas_total        INTEGER NOT NULL DEFAULT 1,
  porciones_restantes INTEGER NOT NULL DEFAULT 30,
  disponible          BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Paletas ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paletas (
  id         BIGSERIAL PRIMARY KEY,
  nombre     TEXT    NOT NULL,
  precio     INTEGER NOT NULL,
  stock      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Ventas ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ventas (
  id              BIGSERIAL PRIMARY KEY,
  fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tipo            TEXT        NOT NULL CHECK (tipo IN ('cono', 'vasito', 'paleta')),
  bolas           INTEGER     NOT NULL DEFAULT 0,
  sabores_elegidos JSONB      NOT NULL DEFAULT '[]',
  precio          INTEGER     NOT NULL,
  cantidad        INTEGER     NOT NULL DEFAULT 1,
  total           INTEGER     NOT NULL,
  paleta_id       BIGINT      REFERENCES paletas(id) ON DELETE SET NULL,
  paleta_nombre   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gastos ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gastos (
  id          BIGSERIAL PRIMARY KEY,
  fecha       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  categoria   TEXT        NOT NULL,
  descripcion TEXT        NOT NULL,
  monto       INTEGER     NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Metas (fila única) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS metas (
  id       INTEGER PRIMARY KEY DEFAULT 1,
  diaria   INTEGER NOT NULL DEFAULT 80000,
  semanal  INTEGER NOT NULL DEFAULT 500000,
  mensual  INTEGER NOT NULL DEFAULT 2000000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO metas (id, diaria, semanal, mensual)
VALUES (1, 80000, 500000, 2000000)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sabores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE paletas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas    ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden leer y escribir
CREATE POLICY "auth_all_perfiles" ON perfiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_sabores"  ON sabores  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_paletas"  ON paletas  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_ventas"   ON ventas   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_gastos"   ON gastos   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_metas"    ON metas    FOR ALL TO authenticated USING (true) WITH CHECK (true);
