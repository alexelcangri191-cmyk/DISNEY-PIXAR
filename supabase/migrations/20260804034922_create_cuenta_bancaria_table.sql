/*
# Create cuenta_bancaria table

1. New Tables
- `cuenta_bancaria`
- `id` (uuid, primary key, auto-generated)
- `user_id` (uuid, not null, defaults to authenticated user, references auth.users)
- `entidad_bancaria` (text, not null) — bank entity, e.g. "Nequi" or "Bancolombia"
- `numero_cuenta` (text, not null) — account number
- `titular` (text, not null) — account holder name
- `created_at` (timestamptz, defaults to now())
2. Security
- Enable RLS on `cuenta_bancaria`.
- Owner-scoped CRUD: each authenticated user can only access their own row.
- `user_id` defaults to `auth.uid()` so inserts omitting it still succeed.
3. Important Notes
- One account per user enforced by a unique constraint on `user_id`.
- Policies use `auth.uid()` for ownership checks.
*/

CREATE TABLE IF NOT EXISTS cuenta_bancaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  entidad_bancaria text NOT NULL,
  numero_cuenta text NOT NULL,
  titular text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cuenta_bancaria ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS cuenta_bancaria_user_id_unique ON cuenta_bancaria(user_id);

DROP POLICY IF EXISTS "select_own_cuenta_bancaria" ON cuenta_bancaria;
CREATE POLICY "select_own_cuenta_bancaria" ON cuenta_bancaria FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cuenta_bancaria" ON cuenta_bancaria;
CREATE POLICY "insert_own_cuenta_bancaria" ON cuenta_bancaria FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cuenta_bancaria" ON cuenta_bancaria;
CREATE POLICY "update_own_cuenta_bancaria" ON cuenta_bancaria FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cuenta_bancaria" ON cuenta_bancaria;
CREATE POLICY "delete_own_cuenta_bancaria" ON cuenta_bancaria FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
