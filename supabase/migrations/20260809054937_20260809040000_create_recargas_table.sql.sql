/*
# Create recargas (recharge) table with wallet trigger

## Purpose
Stores every recharge request a user submits. When an admin flips a row's
status from 'pendiente' to 'exitoso', a trigger automatically credits the
amount to that user's personal wallet (user_progress.saldo_personal).

## New table: recargas
- id           — uuid primary key (default gen_random_uuid())
- user_id      — uuid, references auth.users, defaults to auth.uid()
- amount       — numeric, not null; the recharge amount in COP
- status       — text, not null, default 'pendiente'; allowed values 'pendiente' | 'exitoso'
- created_at   — timestamptz, default now()

## Trigger logic
- A BEFORE UPDATE trigger compares OLD.status vs NEW.status.
- Only fires when status transitions from 'pendiente' to 'exitoso'.
- Adds NEW.amount to user_progress.saldo_personal for NEW.user_id.
- Uses a SECURITY DEFINER function so it can update user_progress regardless
  of the caller's RLS context (the DB role doing the admin update).

## Security
- RLS enabled on recargas.
- Owner-scoped CRUD: authenticated users can read/insert/update/delete only
  their own rows (auth.uid() = user_id).
- The trigger function is SECURITY DEFINER, owned by postgres, and is only
  invoked by the trigger — not directly callable by anon/authenticated.

## Idempotency
- CREATE TABLE IF NOT EXISTS.
- Function + trigger dropped-if-exists before re-creating.
*/

CREATE TABLE IF NOT EXISTS recargas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recargas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recargas" ON recargas;
CREATE POLICY "select_own_recargas" ON recargas FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_recargas" ON recargas;
CREATE POLICY "insert_own_recargas" ON recargas FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_recargas" ON recargas;
CREATE POLICY "update_own_recargas" ON recargas FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_recargas" ON recargas;
CREATE POLICY "delete_own_recargas" ON recargas FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recargas_user_id ON recargas(user_id);
CREATE INDEX IF NOT EXISTS idx_recargas_created_at ON recargas(created_at DESC);

-- Trigger function: credit personal wallet when a recharge is completed
CREATE OR REPLACE FUNCTION public.credit_personal_wallet_on_recharge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only act on the pendiente → exitoso transition
  IF OLD.status = 'pendiente' AND NEW.status = 'exitoso' THEN
    UPDATE user_progress
      SET saldo_personal = saldo_personal + NEW.amount,
          updated_at = now()
      WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recargas_credit_wallet ON recargas;
CREATE TRIGGER trg_recargas_credit_wallet
  BEFORE UPDATE ON recargas
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_personal_wallet_on_recharge();
