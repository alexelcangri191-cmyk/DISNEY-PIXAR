/*
# Create recargas table for top-up transactions

1. Purpose
- Stores each top-up (recharge) attempt a user makes via the QR payment flow.
- Each row represents a pending payment order with a unique order number, the
  amount in COP, the chosen payment method (Nequi / Bancolombia), the reference
  number the user enters from their payment app, and a status that starts as
  'pendiente' until an admin/system confirms the payment.

2. New Tables
- `recargas`
  - `id` (uuid, primary key, auto-generated)
  - `user_id` (uuid, not null, defaults to the authenticated user, references
    auth.users with cascade delete so a deleted user's recargas are removed)
  - `order_number` (text, not null, unique) — unique order code generated per
    recharge attempt, format ORD + timestamp/id (e.g. ORD17846070161518589).
  - `amount` (numeric, not null) — amount in COP selected by the user.
  - `payment_method` (text, not null) — 'nequi' or 'bancolombia'.
  - `reference_number` (text, not null) — reference code entered by the user
    from their payment app.
  - `status` (text, not null, default 'pendiente') — transaction status.
    Possible values: 'pendiente', 'aprobada', 'rechazada'.
  - `created_at` (timestamptz, default now()) — exact timestamp of the record.

3. Indexes
- Unique index on `order_number` to enforce uniqueness and speed lookups.
- Index on `user_id` for per-user history queries.

4. Security
- Enable RLS on `recargas`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- `user_id` defaults to `auth.uid()` so inserts that omit it still satisfy the
  INSERT policy's WITH CHECK.
*/

CREATE TABLE IF NOT EXISTS recargas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  reference_number text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS recargas_order_number_key ON recargas (order_number);
CREATE INDEX IF NOT EXISTS recargas_user_id_idx ON recargas (user_id);

ALTER TABLE public.recargas ENABLE ROW LEVEL SECURITY;

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
