-- =====================================================
-- Tabelas e policies para sistema de push notifications
-- =====================================================

-- 1. Tabela user_subscriptions
create table if not exists public.user_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamp with time zone default now(),
  unique(user_id)
);

alter table public.user_subscriptions enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'users insert own subscription' and tablename = 'user_subscriptions') then
    create policy "users insert own subscription" on public.user_subscriptions for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users select own subscription' and tablename = 'user_subscriptions') then
    create policy "users select own subscription" on public.user_subscriptions for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users update own subscription' and tablename = 'user_subscriptions') then
    create policy "users update own subscription" on public.user_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'service_role select all subscriptions' and tablename = 'user_subscriptions') then
    create policy "service_role select all subscriptions" on public.user_subscriptions for select to service_role using (true);
  end if;
end $$;

-- 2. Tabela notifications
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  quest_id     text not null,
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  body         text not null,
  scheduled_at timestamp with time zone not null,
  delivered_at timestamp with time zone,
  created_at   timestamp with time zone default now()
);

alter table public.notifications enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'users insert own notifications' and tablename = 'notifications') then
    create policy "users insert own notifications" on public.notifications for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users select own notifications' and tablename = 'notifications') then
    create policy "users select own notifications" on public.notifications for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'users delete own notifications' and tablename = 'notifications') then
    create policy "users delete own notifications" on public.notifications for delete using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'service_role select all notifications' and tablename = 'notifications') then
    create policy "service_role select all notifications" on public.notifications for select to service_role using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'service_role update all notifications' and tablename = 'notifications') then
    create policy "service_role update all notifications" on public.notifications for update to service_role using (true) with check (true);
  end if;
end $$;
