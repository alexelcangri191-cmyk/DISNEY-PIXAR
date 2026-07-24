/*
# Create retiros (withdrawals) table

1. New Tables
- `retiros` — stores each withdrawal request made by an authenticated user.
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to the authenticated user) — owner of the withdrawal.
  - `username` (text, nullable) — display name of the user making the withdrawal.
  - `amount` (numeric, not null) — total amount the user wants to withdraw.
  - `date` (date, nullable) — date portion (YYYY-MM-DD) of the withdrawal request.
  - `time` (text, nullable) — time portion (e.g. "02:45 PM") of the withdrawal request.
  - `account_number` (text, nullable) — destination account number entered manually by the user.
  - `status` (text, not null, defaults to 'pendiente') — initial state of the withdrawal.
  - `created_at` (timestamptz, defaults to now()) — exact server timestamp of the request.

2. Security
- Enable RLS on `retiros`.
- Owner-scoped CRUD: each authenticated user can only access their own withdrawal rows
  (select / insert / update / delete scoped to auth.uid() = user_id).
- `user_id` defaults to auth.uid() so inserts that omit it still satisfy the INSERT policy.

3. Important Notes
- The frontend inserts a new row on every withdrawal request with the selected amount,
  the manually-entered account number, the current date/time, the logged-in user's name,
  and status 'pendiente'. The user's income wallet (user_progress.saldo_ingresos) is
  decremented by the same amount in the same operation.
*/

CREATE TABLE IF NOT EXISTS retiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  amount numeric NOT NULL,
  date date,
  time text,
  account_number text,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE INDEX IF NOT EXISTS idx_retiros_user_id ON retiros(user_id);
CREATE INDEX IF NOT EXISTS idx_retiros_created_at ON retiros(created_at DESC);
