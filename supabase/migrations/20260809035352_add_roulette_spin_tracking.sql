/*
# Add roulette spin tracking and prize transaction history

1. Modified Tables
- `user_progress`
  - Add `last_spin_at` (timestamptz, nullable) — stores the date/time of the user's last roulette spin. Used to enforce the 24-hour cooldown.
  - Add `ruleta_bloqueada` (boolean, default false) — optional flag to manually block a user from the roulette.

2. New Tables
- `transacciones`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to the authenticated user, references auth.users with cascade delete)
  - `tipo` (text, not null) — transaction type, e.g. "Premio Ruleta"
  - `monto` (numeric, not null) — amount in COP
  - `descripcion` (text, nullable) — optional human-readable description
  - `created_at` (timestamptz, default now())

3. Security
- Enable RLS on `transacciones`.
- Owner-scoped CRUD: each authenticated user can only access their own transactions.
- `user_progress` already has RLS enabled; the new columns inherit the existing policies since they are on the same table.
*/

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS last_spin_at timestamptz,
  ADD COLUMN IF NOT EXISTS ruleta_bloqueada boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS transacciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  monto numeric NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
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
