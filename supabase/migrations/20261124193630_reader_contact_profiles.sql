alter table public.reading_profiles
  add constraint reading_profiles_known_leaders
    check (profile_leaders <@ array['explorador', 'imersivo', 'investigador', 'contemplativo']::text[]),
  add constraint reading_profiles_known_genres
    check (preferred_genres <@ array['Romance', 'Fantasia', 'Ficção científica', 'Suspense e mistério', 'Drama', 'Desenvolvimento pessoal', 'Psicologia', 'Filosofia', 'História', 'Biografias', 'Poesia', 'Clássicos', 'Quero descobrir']::text[]),
  add constraint reading_profiles_scores_size
    check (pg_column_size(profile_scores) <= 2048),
  add constraint reading_profiles_scores_keys
    check (profile_scores - 'explorador' - 'imersivo' - 'investigador' - 'contemplativo' = '{}'::jsonb);

alter table public.book_feedback
  add constraint book_feedback_known_books
    check (book_id in ('guia-galaxias', 'kindred', 'pequeno-principe', 'torto-arado', 'vida-invisivel', 'quarto-despejo', 'ideias-adiar', 'hora-estrela', 'poema-sujo', 'ridicula-ideia', 'biblioteca-meia-noite'));

create table if not exists public.reader_contact_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null
    check (char_length(btrim(display_name)) between 1 and 120),
  age_range text
    check (age_range is null or age_range in ('18-24', '25-34', '35-44', '45-54', '55+')),
  phone text
    check (phone is null or phone ~ '^\+55[1-9][0-9]{9,10}$'),
  delivery_interest boolean not null default false,
  postal_code text check (postal_code is null or postal_code ~ '^[0-9]{8}$'),
  street text check (street is null or char_length(btrim(street)) between 1 and 180),
  address_number text check (address_number is null or char_length(btrim(address_number)) between 1 and 20),
  address_complement text check (address_complement is null or char_length(address_complement) <= 120),
  neighborhood text check (neighborhood is null or char_length(btrim(neighborhood)) between 1 and 120),
  city text check (city is null or char_length(btrim(city)) between 1 and 120),
  state text,
  adult_attested_at timestamptz not null default now(),
  privacy_notice_version text not null default 'v1',
  privacy_notice_accepted_at timestamptz not null default now(),
  delivery_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reader_contact_profiles_state_format
    check (state is null or state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  constraint reader_contact_profiles_delivery_address
    check (
      (delivery_interest and phone is not null and postal_code is not null and street is not null
        and char_length(btrim(street)) between 1 and 180
        and address_number is not null and char_length(btrim(address_number)) between 1 and 20
        and neighborhood is not null and char_length(btrim(neighborhood)) between 1 and 120
        and city is not null and char_length(btrim(city)) between 1 and 120 and state is not null
        and delivery_consent_at is not null)
      or
      (not delivery_interest and phone is null and postal_code is null and street is null
        and address_number is null and address_complement is null and neighborhood is null and city is null
        and state is null and delivery_consent_at is null)
    )
);

create or replace function public.stamp_reader_contact_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.adult_attested_at := now();
    new.privacy_notice_accepted_at := now();
    if new.delivery_interest then
      new.delivery_consent_at := now();
    else
      new.delivery_consent_at := null;
    end if;
  else
    new.adult_attested_at := old.adult_attested_at;
    new.privacy_notice_version := old.privacy_notice_version;
    new.privacy_notice_accepted_at := old.privacy_notice_accepted_at;
    if new.delivery_interest then
      if old.delivery_interest then
        new.delivery_consent_at := old.delivery_consent_at;
      else
        new.delivery_consent_at := now();
      end if;
    else
      new.delivery_consent_at := null;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.stamp_reader_contact_profile() from public, anon, authenticated;

create trigger stamp_reader_contact_profile_before_write
  before insert or update on public.reader_contact_profiles
  for each row execute function public.stamp_reader_contact_profile();

alter table public.reader_contact_profiles enable row level security;
revoke all on table public.reader_contact_profiles from public, anon, authenticated;
grant select, delete on table public.reader_contact_profiles to authenticated;
grant insert (
  user_id, display_name, age_range, phone, delivery_interest, postal_code, street,
  address_number, address_complement, neighborhood, city, state
) on public.reader_contact_profiles to authenticated;
grant update (
  user_id, display_name, age_range, phone, delivery_interest, postal_code, street,
  address_number, address_complement, neighborhood, city, state
) on public.reader_contact_profiles to authenticated;

create policy "Readers can view their own contact profile"
  on public.reader_contact_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Readers can create their own contact profile"
  on public.reader_contact_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Readers can update their own contact profile"
  on public.reader_contact_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Readers can delete their own contact profile"
  on public.reader_contact_profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.delete_my_reading_data()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  delete from public.reader_contact_profiles where user_id = current_user_id;
  delete from public.book_feedback where user_id = current_user_id;
  delete from public.reading_profiles where user_id = current_user_id;
end;
$$;

revoke all on function public.delete_my_reading_data() from public, anon, authenticated;
grant execute on function public.delete_my_reading_data() to authenticated;
