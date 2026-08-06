/*
# Create core app tables: users, user_progress, levels, retiros

1. New Tables
- `users` — app-level user profile (1:1 with auth.users)
  - id (uuid, PK, references auth.users)
  - email (text)
  - full_name (text)
  - phone (text)
  - referral_code (text)
  - withdrawal_pin (text)
  - level (text, default 'PASANTÍA')
  - created_at (timestamptz, default now())
- `user_progress` — per-user financial/progress state
  - user_id (uuid, PK, references auth.users)
  - nivel_activo (text, default 'pasantia')
  - saldo_personal (numeric, default 0) — personal wallet balance
  - saldo_ingresos (numeric, default 0) — income wallet balance
  - ganancias_ayer, ganancias_hoy, ganancias_semana, ganancias_mes (numeric, default 0)
  - ingresos_totales (numeric, default 0)
  - tareas_equipo (numeric, default 0)
  - ingresos_recomendacion (numeric, default 0)
  - videos_vistos_hoy (integer, default 0)
  - videos_fecha (date, nullable)
  - pasantia_bloqueada (boolean, default false)
  - pasantia_completada (boolean, default false)
  - updated_at (timestamptz, default now())
- `levels` — investment tiers
  - id (text, PK)
  - name (text)
  - hierarchy (text)
  - monthly_income, daily_income, task_payment (numeric, default 0)
  - daily_tasks (integer, default 0)
  - is_free (boolean, default false)
  - sort_order (integer, default 0)
  - investment_amount (numeric, default 0)
  - annual_income (numeric, default 0)
  - commitment_days (integer, default 0)
- `retiros` — withdrawal requests
  - id (uuid, PK)
  - user_id (uuid, references auth.users, default auth.uid())
  - username (text, nullable)
  - amount (numeric, not null)
  - date (date, nullable)
  - time (text, nullable)
  - account_number (text, nullable)
  - status (text, default 'Pendiente')
  - created_at (timestamptz, default now())

2. Seed Data
- Insert 'pasantia' level into levels.

3. Security
- RLS enabled on all tables.
- users: owner-scoped CRUD (auth.uid() = id).
- user_progress: owner-scoped CRUD (auth.uid() = user_id).
- levels: SELECT open to anon+authenticated; CRUD for authenticated.
- retiros: owner-scoped CRUD (auth.uid() = user_id).
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

-- user_progress table
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

-- Seed pasantia level
INSERT INTO levels (id, name, hierarchy, monthly_income, daily_income, task_payment, daily_tasks, is_free, sort_order)
VALUES ('pasantia', 'PASANTÍA', 'Intern', 20000, 5000, 1000, 5, true, 1)
ON CONFLICT (id) DO NOTHING;

-- retiros table
CREATE TABLE IF NOT EXISTS retiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  amount numeric NOT NULL,
  date date,
  time text,
  account_number text,
  status text NOT NULL DEFAULT 'Pendiente',
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
