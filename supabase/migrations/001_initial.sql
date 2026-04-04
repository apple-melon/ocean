-- ocean-ms-student initial schema

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '학생',
  avatar_url text,
  grade text,
  role text not null default 'user' check (role in ('user', 'admin')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_all"
  on public.profiles for select
  using (auth.uid() is not null);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(split_part(new.email, '@', 1), ''), '학생')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role = 'admin' from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  body text not null,
  author_id uuid not null references auth.users (id) on delete cascade,
  anonymous boolean not null default true,
  hidden boolean not null default false
);

alter table public.posts enable row level security;

create policy "posts_select"
  on public.posts for select
  using (
    auth.uid() is not null
    and (
      (not hidden)
      or author_id = auth.uid()
      or public.is_admin()
    )
  );

create policy "posts_insert"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "posts_update"
  on public.posts for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create policy "posts_delete"
  on public.posts for delete
  using (author_id = auth.uid() or public.is_admin());

create table public.chat_rooms (
  id text primary key,
  name text not null
);

insert into public.chat_rooms (id, name) values
  ('general', '전체'),
  ('grade1', '1학년'),
  ('grade2', '2학년'),
  ('grade3', '3학년')
on conflict (id) do nothing;

alter table public.chat_rooms enable row level security;

create policy "chat_rooms_select"
  on public.chat_rooms for select
  using (auth.uid() is not null);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.chat_rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) <= 500),
  anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_messages_select"
  on public.chat_messages for select
  using (auth.uid() is not null);

create policy "chat_messages_insert"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "chat_messages_delete"
  on public.chat_messages for delete
  using (user_id = auth.uid() or public.is_admin());

alter publication supabase_realtime add table public.chat_messages;
