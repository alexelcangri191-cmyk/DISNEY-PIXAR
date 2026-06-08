CREATE TABLE levels (
  id text PRIMARY KEY,
  name text NOT NULL,
  hierarchy text NOT NULL,
  monthly_income numeric NOT NULL DEFAULT 0,
  daily_income numeric NOT NULL DEFAULT 0,
  task_payment numeric NOT NULL DEFAULT 0,
  daily_tasks integer NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO levels (id, name, hierarchy, monthly_income, daily_income, task_payment, daily_tasks, is_free, sort_order) VALUES
  ('pasantia', 'PASANTÍA', 'Intern', 20000, 5000, 1000, 5, true, 1);

ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS tareas_equipo numeric NOT NULL DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS ingresos_recomendacion numeric NOT NULL DEFAULT 0;

ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_levels" ON levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_levels" ON levels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_levels" ON levels FOR UPDATE TO authenticated USING (true);
CREATE POLICY "delete_levels" ON levels FOR DELETE TO authenticated USING (true);
