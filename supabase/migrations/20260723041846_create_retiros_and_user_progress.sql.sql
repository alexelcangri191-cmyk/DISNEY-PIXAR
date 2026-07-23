/*
# Create retiros (withdrawal) table and user_progress wallet table

## Purpose
Supports the Retiros (withdrawals) page. The retiros table records each withdrawal
request by an authenticated user. The user_progress table stores the user's wallet
balances (personal + income), from which withdrawal amounts are deducted.

## New Table: retiros
- `id` (uuid, primary key) — unique row identifier.
- `user_id` (uuid, not null, defaults to auth.uid()) — the authenticated user requesting the withdrawal. References auth.users.
- `amount` (numeric, not null) — total amount of the withdrawal in COP.
- `bank_account` (text, not null) — bank account number entered by the user.
- `status` (text, not null, default 'pendiente') — withdrawal state. Initial value is 'pendiente'.
- `created_at` (timestamptz, not null, default now()) — exact date and time of the withdrawal request.

## New Table: user_progress
Stores per-user wallet balances and earnings statistics consumed by the Perfil page.
- `id` (uuid, primary key).
- `user_id` (uuid, not null, unique, defaults to auth.uid()) — links to auth.users.
- `saldo_personal` (numeric, default 0) — personal wallet balance.
- `saldo_ingresos` (numeric, default 0) — income wallet balance (source for withdrawals).
- `ganancias_ayer`, `ganancias_hoy`, `ganancias_semana`, `ganancias_mes` (numeric, default 0) — earnings by period.
- `ingresos_totales`, `tareas_equipo`, `ingresos_recomendacion` (numeric, default 0) — income breakdowns.
- `pasantia_completada` (boolean, default false) — tracks pasantia completion.
- `created_at`, `updated_at` (timestamptz) — timestamps.

## Security (RLS)
- Enable RLS on both tables.
- Owner-scoped CRUD: authenticated users can only access their own rows.
- `user_id` defaults to `auth.uid()` so client inserts/updates that omit user_id still satisfy WITH CHECK.

## Important notes
1. Only creates retiros + user_progress. Does not touch recargas or any existing data.
2. Index on user_id for per-user history lookups.
3. Idempotent: safe to re-run (IF NOT EXISTS + DROP POLICY IF EXISTS).
*/

CREATE TABLE IF NOT EXISTS retiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  bank_account text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retiros_user_id ON retiros(user_id);

ALTER TABLE retiros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_retiros" ON retiros;
CREATE POLICY "select_own_retiros" ON retiros FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_retiros" ON retiros;
CREATE POLICY "insert_own_retiros" ON retiros FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_retiros" ON retiros;
CREATE POLICY "update_own_retiros" ON retiros FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_retiros" ON retiros;
CREATE POLICY "delete_own_retiros" ON retiros FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- user_progress: wallet balances for the Perfil page + withdrawal source
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  saldo_personal numeric NOT NULL DEFAULT 0,
  saldo_ingresos numeric NOT NULL DEFAULT 0,
  ganancias_ayer numeric NOT NULL DEFAULT 0,
  ganancias_hoy numeric NOT NULL DEFAULT 0,
  ganancias_semana numeric NOT NULL DEFAULT 0,
  ganancias_mes numeric NOT NULL DEFAULT 0,
  ingresos_totales numeric NOT NULL DEFAULT 0,
  tareas_equipo numeric NOT NULL DEFAULT 0,
  ingresos_recomendacion numeric NOT NULL DEFAULT 0,
  pasantia_completada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_user_progress" ON user_progress;
CREATE POLICY "select_own_user_progress" ON user_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_user_progress" ON user_progress;
CREATE POLICY "insert_own_user_progress" ON user_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_user_progress" ON user_progress;
CREATE POLICY "update_own_user_progress" ON user_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_user_progress" ON user_progress;
CREATE POLICY "delete_own_user_progress" ON user_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
