/*
# Create core app tables: users, user_progress, levels
(retiros already exists from an earlier migration)

1. New Tables
- `users` — app-level user profile (1:1 with auth.users)
- `user_progress` — per-user financial/progress state (includes last_spin_at, ruleta_bloqueada)
- `levels` — investment tiers
- `transacciones` — transaction history (for roulette prizes, etc.)

2. Seed Data
- Pasantia + J1 through J9 levels

3. Security
- RLS enabled on all tables.
- users, user_progress, transacciones: owner-scoped CRUD.
- levels: SELECT open to anon+authenticated; CRUD for authenticated.
*/

-- users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  referral_code text,
  withdrawal_pin text,
  level text DEFAULT 'PASANTÍA',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_users" ON users;
CREATE POLICY "select_own_users" ON users FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_users" ON users;
CREATE POLICY "insert_own_users" ON users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_users" ON users;
CREATE POLICY "update_own_users" ON users FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_users" ON users;
CREATE POLICY "delete_own_users" ON users FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- user_progress table (includes roulette spin tracking columns)
CREATE TABLE IF NOT EXISTS user_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nivel_activo text DEFAULT 'pasantia',
  saldo_personal numeric DEFAULT 0,
  saldo_ingresos numeric DEFAULT 0,
  ganancias_ayer numeric DEFAULT 0,
  ganancias_hoy numeric DEFAULT 0,
  ganancias_semana numeric DEFAULT 0,
  ganancias_mes numeric DEFAULT 0,
  ingresos_totales numeric DEFAULT 0,
  tareas_equipo numeric DEFAULT 0,
  ingresos_recomendacion numeric DEFAULT 0,
  videos_vistos_hoy integer DEFAULT 0,
  videos_fecha date,
  pasantia_bloqueada boolean DEFAULT false,
  pasantia_completada boolean DEFAULT false,
  last_spin_at timestamptz,
  ruleta_bloqueada boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_user_progress" ON user_progress;
CREATE POLICY "select_own_user_progress" ON user_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_user_progress" ON user_progress;
CREATE POLICY "insert_own_user_progress" ON user_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_user_progress" ON user_progress;
CREATE POLICY "update_own_user_progress" ON user_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_user_progress" ON user_progress;
CREATE POLICY "delete_own_user_progress" ON user_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- levels table
CREATE TABLE IF NOT EXISTS levels (
  id text PRIMARY KEY,
  name text NOT NULL,
  hierarchy text NOT NULL,
  monthly_income numeric NOT NULL DEFAULT 0,
  daily_income numeric NOT NULL DEFAULT 0,
  task_payment numeric NOT NULL DEFAULT 0,
  daily_tasks integer NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  investment_amount numeric NOT NULL DEFAULT 0,
  annual_income numeric NOT NULL DEFAULT 0,
  commitment_days integer NOT NULL DEFAULT 0
);

ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_levels" ON levels;
CREATE POLICY "select_levels" ON levels FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "select_levels_anon" ON levels;
CREATE POLICY "select_levels_anon" ON levels FOR SELECT
  TO anon USING (true);
DROP POLICY IF EXISTS "insert_levels" ON levels;
CREATE POLICY "insert_levels" ON levels FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_levels" ON levels;
CREATE POLICY "update_levels" ON levels FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_levels" ON levels;
CREATE POLICY "delete_levels" ON levels FOR DELETE
  TO authenticated USING (true);

-- Seed all levels: Pasantia + J1 through J9
INSERT INTO levels (id, name, hierarchy, monthly_income, daily_income, task_payment, daily_tasks, is_free, sort_order, investment_amount, annual_income, commitment_days)
VALUES
  ('pasantia', 'PASANTÍA', 'Intern', 20000, 5000, 1000, 5, true, 1, 0, 0, 0),
  ('j1', 'J1', 'Junior 1', 300000, 10000, 1000, 10, false, 2, 30000, 3600000, 365),
  ('j2', 'J2', 'Junior 2', 600000, 20000, 1500, 10, false, 3, 80000, 7200000, 365),
  ('j3', 'J3', 'Junior 3', 1260000, 42000, 2800, 15, false, 4, 1300000, 15120000, 365),
  ('j4', 'J4', 'Junior 4', 2100000, 70000, 4000, 18, false, 5, 2100000, 25200000, 365),
  ('j5', 'J5', 'Junior 5', 3000000, 100000, 5000, 20, false, 6, 3000000, 36000000, 365),
  ('j6', 'J6', 'Junior 6', 5000000, 166000, 7000, 24, false, 7, 5000000, 60000000, 365),
  ('j7', 'J7', 'Junior 7', 8000000, 266000, 9000, 30, false, 8, 8000000, 96000000, 365),
  ('j8', 'J8', 'Junior 8', 12000000, 400000, 12000, 30, false, 9, 12000000, 144000000, 365),
  ('j9', 'J9', 'Junior 9', 25000000, 833000, 20000, 30, false, 10, 25000000, 300000000, 365)
ON CONFLICT (id) DO NOTHING;

-- transacciones table (for roulette prizes and other transactions)
CREATE TABLE IF NOT EXISTS transacciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  monto numeric NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transacciones" ON transacciones;
CREATE POLICY "select_own_transacciones" ON transacciones FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_transacciones" ON transacciones;
CREATE POLICY "insert_own_transacciones" ON transacciones FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_transacciones" ON transacciones;
CREATE POLICY "update_own_transacciones" ON transacciones FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_transacciones" ON transacciones;
CREATE POLICY "delete_own_transacciones" ON transacciones FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
