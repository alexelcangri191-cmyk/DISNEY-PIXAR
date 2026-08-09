/*
# Fix recargas table schema and normalize status values

## Problems fixed
1. The recargas table was created with column `amount`, but PaginaQR.tsx
   inserts using `monto`, `order_number`, `metodo_pago`, and
   `numero_referencia` (names from the old on-disk migration that was never
   applied via MCP). This caused every recharge insert to fail.
2. The wallet-credit trigger referenced `NEW.amount`, which would break
   after the rename to `monto`.
3. Both recargas and retiros accepted mixed-case status values
   ('pendiente' vs 'Pendiente'), making status comparisons unreliable.

## Changes to recargas
- Rename `amount` → `monto` (preserves any existing data).
- Add `order_number` (text, nullable) — order code from PaginaQR.
- Add `metodo_pago` (text, nullable) — payment method (Nequi/Bancolombia).
- Add `numero_referencia` (text, nullable) — user-entered voucher reference.
- Recreate the wallet-credit trigger to use `NEW.monto`.
- Add a BEFORE INSERT/UPDATE trigger that lowercases `status` so all
  comparisons see 'pendiente' / 'exitoso' consistently.

## Changes to retiros
- Add the same lowercase-status normalization trigger so 'Pendiente'
  inserted by Retiros.tsx becomes 'pendiente' on storage.
- The refund trigger already uses ILIKE so it works regardless of case,
  but normalized values make the Registro page's job easier.

## Security
- No RLS policy changes. Existing owner-scoped policies remain valid.

## Data safety
- Uses ALTER TABLE ... RENAME COLUMN (preserves data).
- New columns are nullable so existing rows are unaffected.
- Triggers dropped-if-exists before re-creating.
*/

-- ===== recargas: rename amount → monto =====
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recargas' AND column_name = 'amount'
  ) THEN
    ALTER TABLE public.recargas RENAME COLUMN amount TO monto;
  END IF;
END $$;

-- ===== recargas: add missing columns =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recargas' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE public.recargas ADD COLUMN order_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recargas' AND column_name = 'metodo_pago'
  ) THEN
    ALTER TABLE public.recargas ADD COLUMN metodo_pago text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recargas' AND column_name = 'numero_referencia'
  ) THEN
    ALTER TABLE public.recargas ADD COLUMN numero_referencia text;
  END IF;
END $$;

-- ===== recargas: recreate wallet trigger with NEW.monto =====
CREATE OR REPLACE FUNCTION public.credit_personal_wallet_on_recharge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pendiente' AND NEW.status = 'exitoso' THEN
    UPDATE user_progress
      SET saldo_personal = saldo_personal + NEW.monto,
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

-- ===== recargas: lowercase status normalization =====
CREATE OR REPLACE FUNCTION public.normalize_recargas_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.status := lower(NEW.status);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recargas_normalize_status ON recargas;
CREATE TRIGGER trg_recargas_normalize_status
  BEFORE INSERT OR UPDATE ON recargas
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_recargas_status();

-- ===== retiros: lowercase status normalization =====
CREATE OR REPLACE FUNCTION public.normalize_retiros_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.status := lower(NEW.status);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_retiros_normalize_status ON retiros;
CREATE TRIGGER trg_retiros_normalize_status
  BEFORE INSERT OR UPDATE ON retiros
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_retiros_status();

-- ===== Normalize existing rows (in case any have capitalized status) =====
UPDATE recargas SET status = lower(status) WHERE status <> lower(status);
UPDATE retiros SET status = lower(status) WHERE status <> lower(status);
