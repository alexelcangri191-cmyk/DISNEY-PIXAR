/*
# Create retiros (withdrawal) table

## Purpose
Stores every withdrawal request a user submits. The existing Retiros page
already deducts the amount from saldo_ingresos client-side at creation time;
this table persists those records so the Registro de Retiros history page
can display them with realtime updates.

## New table: retiros
- id             — uuid primary key (default gen_random_uuid())
- user_id        — uuid, references auth.users, defaults to auth.uid()
- amount         — numeric, not null; the withdrawal amount in COP
- status         — text, not null, default 'pendiente'
                   Accepts 'pendiente', 'exitoso', 'Pendiente', 'Exitoso'
                   (existing Retiros page uses capitalized 'Pendiente')
- created_at     — timestamptz, default now()
- username       — text, nullable; full name at time of request (existing page)
- date           — date, nullable; request date (existing page)
- time           — text, nullable; request time string (existing page)
- account_number — text, nullable; target account (existing page)

## Reimbursement trigger (optional per spec)
- When status transitions from 'pendiente'/'Pendiente' to 'rechazado',
  the amount is refunded to user_progress.saldo_ingresos.
- SECURITY DEFINER function so it can update user_progress regardless
  of the caller's RLS context.

## Security
- RLS enabled on retiros.
- Owner-scoped CRUD: authenticated users can read/insert/update/delete
  only their own rows (auth.uid() = user_id).
- The trigger function is SECURITY DEFINER, owned by postgres, invoked
  only by the trigger.

## Idempotency
- CREATE TABLE IF NOT EXISTS.
- Function + trigger dropped-if-exists before re-creating.
*/

CREATE TABLE IF NOT EXISTS retiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  username text,
  date date,
  time text,
  account_number text
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

-- Reimbursement trigger: refund to income wallet when a withdrawal is rejected
CREATE OR REPLACE FUNCTION public.refund_income_wallet_on_rejection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only act on pendiente → rechazado transition
  IF (OLD.status ILIKE 'pendiente') AND (NEW.status ILIKE 'rechazado') THEN
    UPDATE user_progress
      SET saldo_ingresos = saldo_ingresos + NEW.amount,
          updated_at = now()
      WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_retiros_refund_wallet ON retiros;
CREATE TRIGGER trg_retiros_refund_wallet
  BEFORE UPDATE ON retiros
  FOR EACH ROW
  EXECUTE FUNCTION public.refund_income_wallet_on_rejection();
