-- Run this once in Supabase > SQL Editor.
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  details text not null default '' check (char_length(details) <= 500),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_created_idx on public.tasks (user_id, created_at desc);
alter table public.tasks enable row level security;

create policy "Users can view own tasks" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add own tasks" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can edit own tasks" on public.tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own tasks" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);
