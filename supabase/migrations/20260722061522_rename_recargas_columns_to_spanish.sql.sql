/*
# Rename recargas columns to Spanish names

## Purpose
The recargas table was originally created with English column names (amount,
payment_method, reference_number). The product spec now requires Spanish column
names to match the rest of the application's domain language. This migration
renames those columns in place WITHOUT losing any data.

## Changes (recargas table)
- `amount`          → `monto`            (Monto dinámico seleccionado en COP)
- `payment_method`  → `metodo_pago`      (Método seleccionado: Nequi/Bancolombia)
- `reference_number`→ `numero_referencia`(Código de referencia ingresado por el usuario)

## Unchanged columns
- `user_id`, `order_number`, `status`, `created_at` keep their current names.

## Security
- No RLS policy changes. Existing owner-scoped policies remain valid after the rename.

## Data safety
- Uses `ALTER TABLE ... RENAME COLUMN`, which preserves all existing row data.
- Wrapped in a DO block with existence checks so the migration is idempotent
  and safe to re-run (a timeout after commit will not cause duplicate renames).
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recargas' AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.recargas RENAME COLUMN amount TO monto;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recargas' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.recargas RENAME COLUMN payment_method TO metodo_pago;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recargas' AND column_name = 'reference_number'
  ) THEN
    ALTER TABLE public.recargas RENAME COLUMN reference_number TO numero_referencia;
  END IF;
END $$;
