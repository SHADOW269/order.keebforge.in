-- Add custom_work column to order_tracking for customer-facing display
ALTER TABLE public.order_tracking
  ADD COLUMN custom_work JSONB NOT NULL DEFAULT '[]'::jsonb;
