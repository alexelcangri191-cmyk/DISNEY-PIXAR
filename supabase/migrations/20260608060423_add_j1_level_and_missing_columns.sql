/*
# Add J1 Level and Missing Columns

1. New Data
- Insert J1 level into `levels` table with all financial data.

2. Schema Changes
- Add `investment_amount` column to `levels` (numeric, default 0) — cost to activate a paid level.
- Add `annual_income` column to `levels` (numeric, default 0) — projected yearly earnings.
- Add `commitment_days` column to `levels` (integer, default 0) — duration of the level commitment.
- Add `pasantia_completada` column to `user_progress` (boolean, default false) — tracks whether the user finished pasantia.

3. Security
- Add anon SELECT policy on `levels` so unauthenticated reads work.
*/

ALTER TABLE levels ADD COLUMN IF NOT EXISTS investment_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE levels ADD COLUMN IF NOT EXISTS annual_income numeric NOT NULL DEFAULT 0;
ALTER TABLE levels ADD COLUMN IF NOT EXISTS commitment_days integer NOT NULL DEFAULT 0;

ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS pasantia_completada boolean NOT NULL DEFAULT false;

INSERT INTO levels (id, name, hierarchy, monthly_income, daily_income, task_payment, daily_tasks, is_free, sort_order, investment_amount, annual_income, commitment_days)
VALUES ('j1', 'J1', 'Junior 1', 180000, 6000, 1200, 5, false, 2, 150000, 2190000, 365)
ON CONFLICT (id) DO UPDATE SET
  monthly_income = EXCLUDED.monthly_income,
  daily_income = EXCLUDED.daily_income,
  task_payment = EXCLUDED.task_payment,
  daily_tasks = EXCLUDED.daily_tasks,
  is_free = EXCLUDED.is_free,
  sort_order = EXCLUDED.sort_order,
  investment_amount = EXCLUDED.investment_amount,
  annual_income = EXCLUDED.annual_income,
  commitment_days = EXCLUDED.commitment_days;

DROP POLICY IF EXISTS "select_levels_anon" ON levels;
CREATE POLICY "select_levels_anon" ON levels FOR SELECT TO anon USING (true);
