-- Restore the schema required by the existing financial forms, absent from database.sql.
-- Review against the live schema before applying; production was inactive during PR review.
create table if not exists public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  description text not null check (length(trim(description)) > 0),
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  expected_date date not null,
  received_date date,
  status text not null default 'expected' check (status in ('expected','received','canceled')),
  is_recurring boolean not null default false,
  recurrence text check (recurrence in ('weekly','monthly','yearly')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.income_entries enable row level security;
revoke all on public.income_entries from anon;
grant select,insert,update,delete on public.income_entries to authenticated;
grant all on public.income_entries to service_role;
-- Restrictive policy also constrains any permissive policies already installed.
create policy income_owner_guard on public.income_entries as restrictive for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy income_owner_access on public.income_entries for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index if not exists income_user_date on public.income_entries(user_id, expected_date);

alter table public.expenses add column if not exists due_date date;
alter table public.expenses add column if not exists paid_date date;
alter table public.expenses add column if not exists status text not null default 'paid';
alter table public.expenses add column if not exists is_recurring boolean not null default false;
alter table public.expenses add column if not exists recurrence text;
-- Preserve old rows in monthly views. Do not overwrite existing dates.
update public.expenses set due_date = coalesce(month, created_at::date) where due_date is null;
alter table public.expenses enable row level security;
revoke all on public.expenses from anon;
grant select,insert,update,delete on public.expenses to authenticated;
create policy expenses_owner_guard on public.expenses as restrictive for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table if not exists public.user_categories (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
  name text not null, slug text not null, icon text not null default '🏷️', bucket text not null,
  archived boolean not null default false, unique(user_id,slug)
);
alter table public.user_categories enable row level security;
revoke all on public.user_categories from anon;
grant select,insert,update,delete on public.user_categories to authenticated;
create policy categories_owner_guard on public.user_categories as restrictive for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy categories_owner_access on public.user_categories for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
