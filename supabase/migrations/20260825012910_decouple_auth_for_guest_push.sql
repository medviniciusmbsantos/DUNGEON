-- Drop ALL existing policies first before altering column type

-- 1. Clean up user_subscriptions policies
drop policy if exists "users insert own subscription" on public.user_subscriptions;
drop policy if exists "users select own subscription" on public.user_subscriptions;
drop policy if exists "users update own subscription" on public.user_subscriptions;
drop policy if exists "service_role select all subscriptions" on public.user_subscriptions;
drop policy if exists "authenticated can insert own subscription" on public.user_subscriptions;
drop policy if exists "authenticated can select own subscription" on public.user_subscriptions;
drop policy if exists "authenticated can update own subscription" on public.user_subscriptions;
drop policy if exists "allow_anon_and_auth_insert_subscription" on public.user_subscriptions;
drop policy if exists "allow_anon_and_auth_select_subscription" on public.user_subscriptions;
drop policy if exists "allow_anon_and_auth_update_subscription" on public.user_subscriptions;
drop policy if exists "allow_anon_and_auth_delete_subscription" on public.user_subscriptions;

-- Drop foreign key and change user_id to text
alter table public.user_subscriptions drop constraint if exists user_subscriptions_user_id_fkey;
alter table public.user_subscriptions alter column user_id type text using user_id::text;

-- Recreate policies for user_subscriptions
create policy "allow_anon_and_auth_insert_subscription" on public.user_subscriptions for insert with check (true);
create policy "allow_anon_and_auth_select_subscription" on public.user_subscriptions for select using (true);
create policy "allow_anon_and_auth_update_subscription" on public.user_subscriptions for update using (true) with check (true);
create policy "allow_anon_and_auth_delete_subscription" on public.user_subscriptions for delete using (true);


-- 2. Clean up notifications policies
drop policy if exists "users insert own notifications" on public.notifications;
drop policy if exists "users select own notifications" on public.notifications;
drop policy if exists "users delete own notifications" on public.notifications;
drop policy if exists "service_role select all notifications" on public.notifications;
drop policy if exists "service_role update all notifications" on public.notifications;
drop policy if exists "service_role can insert notifications" on public.notifications;
drop policy if exists "service_role can update delivered_at" on public.notifications;
drop policy if exists "allow_anon_and_auth_insert_notifications" on public.notifications;
drop policy if exists "allow_anon_and_auth_select_notifications" on public.notifications;
drop policy if exists "allow_anon_and_auth_update_notifications" on public.notifications;
drop policy if exists "allow_anon_and_auth_delete_notifications" on public.notifications;

-- Drop foreign key and change user_id to text
alter table public.notifications drop constraint if exists notifications_user_id_fkey;
alter table public.notifications alter column user_id type text using user_id::text;

-- Recreate policies for notifications
create policy "allow_anon_and_auth_insert_notifications" on public.notifications for insert with check (true);
create policy "allow_anon_and_auth_select_notifications" on public.notifications for select using (true);
create policy "allow_anon_and_auth_update_notifications" on public.notifications for update using (true) with check (true);
create policy "allow_anon_and_auth_delete_notifications" on public.notifications for delete using (true);
