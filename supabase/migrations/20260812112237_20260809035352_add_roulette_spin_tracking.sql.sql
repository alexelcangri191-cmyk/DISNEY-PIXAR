/*
# Add roulette (Ruleta de la Fortuna) support tables and columns

## Purpose
The RuletaFortuna page needs to persist:
1. When a user last spun the wheel (24h cooldown) — stored on user_progress.
2. A history of prizes won — stored in a new `transacciones` table.

## Changes to user_progress
- Add `last_spin_at` (timestamptz, nullable) — timestamp of the user's last
  roulette spin. NULL means the user has never spun (no cooldown).

## New table: transacciones
- id           — uuid primary key (default gen_random_uuid())
- user_id      — uuid, references auth.users, defaults to auth.uid()
- tipo         — text, not null; category of transaction (e.g. 'Premio Ruleta')
- monto        — numeric, not null; amount in COP
- descripcion  — text, nullable; human-readable description
- created_at   — timestamptz, default now()

## New table: ruleta_premios
- id           — smallserial primary key (1–10)
- valor        — numeric, not null; prize amount in COP
- label        — text, not null; display label for the wheel segment
- activo       — boolean, default true; whether the segment is active
- sort_order   — integer, default 0; display order around the wheel

Seed data: the 10 prize segments shown on the wheel ($500 through $9.000).

## Security
- RLS enabled on transacciones and ruleta_premios.
- transacciones: owner-scoped CRUD (auth.uid() = user_id).
- ruleta_premios: SELECT open to authenticated (read-only reference data);
  CRUD for authenticated (admin maintenance).

## Idempotency
- ALTER TABLE ... ADD COLUMN IF NOT EXISTS.
- CREATE TABLE IF NOT EXISTS.
- Policies dropped-if-exists before re-creating.
- Seed uses ON CONFLICT (id) DO NOTHING.
*/

-- ===== user_progress: add last_spin_at =====
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_spin_at timestamptz;

-- ===== transacciones table =====
CREATE TABLE IF NOT EXISTS transacciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  monto numeric NOT NULL,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transacciones" ON transacciones;
CREATE POLICY "select_own_transacciones" ON transacciones FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transacciones" ON transacciones;
CREATE POLICY "insert_own_transacciones" ON transacciones FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transacciones" ON transacciones;
CREATE POLICY "update_own_transacciones" ON transacciones FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transacciones" ON transacciones;
CREATE POLICY "delete_own_transacciones" ON transacciones FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transacciones_user_id ON transacciones(user_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_created_at ON transacciones(created_at DESC);

-- ===== ruleta_premios table (reference data for wheel segments) =====
CREATE TABLE IF NOT EXISTS ruleta_premios (
  id smallserial PRIMARY KEY,
  valor numeric NOT NULL,
  label text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE ruleta_premios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_ruleta_premios" ON ruleta_premios;
CREATE POLICY "select_ruleta_premios" ON ruleta_premios FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_ruleta_premios" ON ruleta_premios;
CREATE POLICY "insert_ruleta_premios" ON ruleta_premios FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_ruleta_premios" ON ruleta_premios;
CREATE POLICY "update_ruleta_premios" ON ruleta_premios FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_ruleta_premios" ON ruleta_premios;
CREATE POLICY "delete_ruleta_premios" ON ruleta_premios FOR DELETE
  TO authenticated USING (true);

-- Seed the 10 prize segments matching the wheel UI
INSERT INTO ruleta_premios (id, valor, label, sort_order) VALUES
  (1, 500,  '$500', 1),
  (2, 1000, '$1.000', 2),
  (3, 2000, '$2.000', 3),
  (4, 3000, '$3.000', 4),
  (5, 4000, '$4.000', 5),
  (6, 5000, '$5.000', 6),
  (7, 6000, '$6.000', 7),
  (8, 7000, '$7.000', 8),
  (9, 8000, '$8.000', 9),
  (10, 9000, '$9.000', 10)
ON CONFLICT (id) DO NOTHING;
