INSERT INTO levels (id, name, hierarchy, monthly_income, daily_income, task_payment, daily_tasks, is_free, sort_order, investment_amount, annual_income, commitment_days)
VALUES ('j6', 'J6', 'Junior 6', 33600000, 1120000, 14000, 80, false, 7, 31000000, 403200000, 365)
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
