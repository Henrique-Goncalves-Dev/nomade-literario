create table if not exists public.reading_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 65536),
  profile_scores jsonb not null default '{}'::jsonb
    check (jsonb_typeof(profile_scores) = 'object'),
  profile_leaders text[] not null default array[]::text[],
  preferred_genres text[] not null default array[]::text[]
    check (cardinality(preferred_genres) <= 13),
  avoided_topics text not null default '' check (char_length(avoided_topics) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_feedback (
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null check (char_length(book_id) between 1 and 80),
  status text not null check (status in ('want', 'read', 'skip')),
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

alter table public.reading_profiles enable row level security;
alter table public.book_feedback enable row level security;

revoke all on table public.reading_profiles from public, anon, authenticated;
revoke all on table public.book_feedback from public, anon, authenticated;
grant select, insert, update, delete on table public.reading_profiles to authenticated;
grant select, insert, update, delete on table public.book_feedback to authenticated;

create policy "Readers can view their own profile"
  on public.reading_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Readers can create their own profile"
  on public.reading_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Readers can update their own profile"
  on public.reading_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Readers can delete their own profile"
  on public.reading_profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Readers can view their own book feedback"
  on public.book_feedback for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Readers can create their own book feedback"
  on public.book_feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Readers can update their own book feedback"
  on public.book_feedback for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Readers can delete their own book feedback"
  on public.book_feedback for delete to authenticated
  using ((select auth.uid()) = user_id);
