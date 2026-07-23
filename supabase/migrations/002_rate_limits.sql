-- Rate limiting table for cross-instance enforcement
-- Supabase service-role bypasses RLS, so no policies needed for server use.
create table if not exists public.rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);

-- Auto-cleanup: drop rows older than 10 minutes
-- Run via pg_cron if available, or rely on DELETE with WHERE in app code.
create index if not exists idx_rate_limits_window on public.rate_limits (window_start);
