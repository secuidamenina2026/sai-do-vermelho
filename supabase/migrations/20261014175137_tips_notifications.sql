-- Additive migration. Provision administrators explicitly with a trusted DB session.
create table public.tip_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.tip_admins enable row level security;
revoke all on public.tip_admins from anon, authenticated;
grant select on public.tip_admins to authenticated;
grant all on public.tip_admins to service_role;
create policy tip_admin_self on public.tip_admins for select to authenticated using (user_id = (select auth.uid()));

create table public.tip_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 120),
  body text not null check (length(trim(body)) between 1 and 2000),
  href text not null check (href ~ '^/dashboard(/[a-z0-9-]+)*$'),
  kind text not null check (kind in ('tip','offer')),
  status text not null default 'draft' check (status in ('draft','scheduled','sent','canceled')),
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  sent_at timestamptz,
  delivered_count integer not null default 0,
  check (status <> 'scheduled' or scheduled_at is not null)
);
alter table public.tip_campaigns enable row level security;
revoke all on public.tip_campaigns from anon, authenticated;
grant select, insert on public.tip_campaigns to authenticated;
grant update(status) on public.tip_campaigns to authenticated;
grant all on public.tip_campaigns to service_role;
create policy tips_admin_read on public.tip_campaigns for select to authenticated
  using (exists(select 1 from public.tip_admins where user_id = (select auth.uid())));
create policy tips_admin_create on public.tip_campaigns for insert to authenticated
  with check (exists(select 1 from public.tip_admins where user_id = (select auth.uid()))
    and created_by = (select auth.uid()) and status in ('draft','scheduled') and sent_at is null and delivered_count = 0
    and (status <> 'scheduled' or scheduled_at > now()));
create policy tips_admin_cancel on public.tip_campaigns for update to authenticated
  using (status in ('draft','scheduled') and exists(select 1 from public.tip_admins where user_id = (select auth.uid())))
  with check (status = 'canceled' and exists(select 1 from public.tip_admins where user_id = (select auth.uid())));

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tips_enabled boolean not null default false,
  offers_enabled boolean not null default false
);
alter table public.notification_preferences enable row level security;
revoke all on public.notification_preferences from anon, authenticated;
grant select, insert, update on public.notification_preferences to authenticated;
grant all on public.notification_preferences to service_role;
create policy preferences_owner on public.notification_preferences for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.tip_campaigns(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, body text not null, href text not null, kind text not null,
  created_at timestamptz not null default now(), read_at timestamptz,
  unique (campaign_id, user_id)
);
alter table public.notifications enable row level security;
revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
grant all on public.notifications to service_role;
create policy notifications_owner_read on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy notifications_owner_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create index notifications_user_created on public.notifications(user_id, created_at desc);
create index campaigns_due on public.tip_campaigns(scheduled_at) where status = 'scheduled';

-- One transaction: retries cannot duplicate deliveries, concurrent workers skip locks.
-- SECURITY INVOKER: only the server-side service role may execute this function.
create function public.deliver_due_tips() returns integer
language plpgsql security invoker set search_path = '' as $$
declare campaign public.tip_campaigns%rowtype; delivered integer; total integer := 0;
begin
  for campaign in select * from public.tip_campaigns
    where status = 'scheduled' and scheduled_at <= now()
    order by scheduled_at limit 20 for update skip locked
  loop
    insert into public.notifications(campaign_id,user_id,title,body,href,kind)
    select campaign.id, p.user_id, campaign.title, campaign.body, campaign.href, campaign.kind
    from public.notification_preferences p
    where (campaign.kind = 'tip' and p.tips_enabled) or (campaign.kind = 'offer' and p.offers_enabled)
    on conflict (campaign_id,user_id) do nothing;
    get diagnostics delivered = row_count;
    update public.tip_campaigns set status = 'sent', sent_at = now(), delivered_count = delivered where id = campaign.id;
    total := total + delivered;
  end loop;
  return total;
end;
$$;
revoke all on function public.deliver_due_tips() from public, anon, authenticated;
grant execute on function public.deliver_due_tips() to service_role;
