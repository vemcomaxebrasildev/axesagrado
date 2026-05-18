
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS paid_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipping_carrier text,
  ADD COLUMN IF NOT EXISTS tracking_code text,
  ADD COLUMN IF NOT EXISTS shipping_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  category text NOT NULL DEFAULT 'geral',
  amount numeric NOT NULL DEFAULT 0,
  expense_date date NOT NULL DEFAULT (now()::date),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins view expenses" ON public.expenses FOR SELECT USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins insert expenses" ON public.expenses FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins update expenses" ON public.expenses FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins delete expenses" ON public.expenses FOR DELETE USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER expenses_touch_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
