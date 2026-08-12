/*
# Add atomic roulette spin function

## Purpose
The RuletaFortuna page currently does three separate DB calls after the wheel
stops (update last_spin_at, read saldo_ingresos, update saldo_ingresos, insert
transaccion). This is racy: two concurrent spins could both read the same
balance and overwrite each other. This migration adds a single SECURITY
DEFINER RPC that does everything atomically in one transaction.

## New function: spin_roulette(amount numeric)
- Validates the caller is authenticated.
- Updates user_progress: sets last_spin_at = now() and increments
  saldo_ingresos by the prize amount, in a single UPDATE.
- Inserts a row into transacciones with tipo='Premio Ruleta'.
- Returns the new saldo_ingresos so the client can update the UI.

## Security
- SECURITY DEFINER so it can update user_progress and insert into
  transacciones regardless of RLS (the caller owns both, but this avoids
  the three-round-trip race).
- Only callable by authenticated users.
- Uses auth.uid() to scope the update — a user can only credit their own
  wallet.

## Idempotency
- CREATE OR REPLACE FUNCTION (safe to re-run).
*/

CREATE OR REPLACE FUNCTION public.spin_roulette(prize_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_new_balance numeric;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Atomic: set spin time + credit income wallet in one statement
  UPDATE user_progress
    SET last_spin_at = now(),
        saldo_ingresos = saldo_ingresos + prize_amount,
        updated_at = now()
    WHERE user_id = v_user_id
    RETURNING saldo_ingresos INTO v_new_balance;

  -- Record the prize as a transaction
  INSERT INTO transacciones (user_id, tipo, monto, descripcion)
    VALUES (v_user_id, 'Premio Ruleta', prize_amount,
            'Premio de la Ruleta de la Fortuna: $' || prize_amount || ' COP');

  RETURN v_new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spin_roulette(numeric) TO authenticated;
