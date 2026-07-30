/*
# Create retiros (withdrawals) table

1. New Tables
- `retiros` — stores each withdrawal request made by a user.
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to the authenticated user) — owner of the withdrawal.
  - `amount` (numeric, not null) — total amount withdrawn.
  - `bank_account` (text, not null) — destination bank account number entered by the user.
  - `created_at` (timestamptz, defaults to now()) — exact date/time of the withdrawal.
  - `status` (text, not null, defaults to 'pendiente') — initial state of the withdrawal.

2. Security
- Enable RLS on `retiros`.
- Owner-scoped CRUD: each authenticated user can only access their own withdrawal rows
  (select / insert / update / delete scoped to auth.uid() = user_id).
- `user_id` defaults to auth.uid() so inserts that omit it still satisfy the INSERT policy.
*/

CREATE TABLE IF NOT EXISTS retiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  bank_account text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pendiente'
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
