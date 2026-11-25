create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;
revoke all on table public.platform_admins from public, anon, authenticated;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_platform_admin() from public, anon, authenticated;
grant execute on function public.is_platform_admin() to authenticated;

create table public.reader_group_settings (
  profile_key text primary key
    check (profile_key in ('explorador', 'imersivo', 'investigador', 'contemplativo')),
  invite_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint reader_group_settings_invite_url
    check (
      invite_url is null
      or (
        char_length(invite_url) <= 500
        and invite_url ~ '^https://chat[.]whatsapp[.]com/[A-Za-z0-9_-]{6,256}([?][A-Za-z0-9_=&%-]*)?$'
      )
    )
);

insert into public.reader_group_settings (profile_key)
values ('explorador'), ('imersivo'), ('investigador'), ('contemplativo')
on conflict (profile_key) do nothing;

create or replace function public.touch_reader_group_setting()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

revoke all on function public.touch_reader_group_setting() from public, anon, authenticated;

create trigger touch_reader_group_setting_before_update
  before update on public.reader_group_settings
  for each row execute function public.touch_reader_group_setting();

alter table public.reader_group_settings enable row level security;
revoke all on table public.reader_group_settings from public, anon, authenticated;
grant select on table public.reader_group_settings to authenticated;
grant update (invite_url) on table public.reader_group_settings to authenticated;

create policy "Paid readers and admins can view group links"
  on public.reader_group_settings for select to authenticated
  using (
    (select public.reader_has_paid_access())
    or (select public.is_platform_admin())
  );

create policy "Platform admins can update group links"
  on public.reader_group_settings for update to authenticated
  using ((select public.is_platform_admin()))
  with check ((select public.is_platform_admin()));

create or replace function public.update_reader_group_settings(p_settings jsonb)
returns setof public.reader_group_settings
language plpgsql
security invoker
set search_path = ''
as $$
declare
  setting jsonb;
begin
  if p_settings is null or jsonb_typeof(p_settings) is distinct from 'array' then
    raise exception 'Provide one setting for each reader profile.';
  end if;

  if jsonb_array_length(p_settings) <> 4 then
    raise exception 'Provide one setting for each reader profile.';
  end if;

  if not (select public.is_platform_admin()) then
    raise insufficient_privilege using message = 'Platform administrator access is required.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_settings) as item(value)
    where jsonb_typeof(item.value) is distinct from 'object'
      or item.value->>'profile_key' not in ('explorador', 'imersivo', 'investigador', 'contemplativo')
  ) or (
    select count(distinct item.value->>'profile_key')
    from jsonb_array_elements(p_settings) as item(value)
  ) <> 4 then
    raise exception 'Provide each supported reader profile exactly once.';
  end if;

  for setting in select item.value from jsonb_array_elements(p_settings) as item(value)
  loop
    update public.reader_group_settings
      set invite_url = nullif(setting->>'invite_url', '')
      where profile_key = setting->>'profile_key';
  end loop;

  return query
    select settings.*
    from public.reader_group_settings as settings
    order by settings.profile_key;
end;
$$;

revoke all on function public.update_reader_group_settings(jsonb) from public, anon, authenticated;
grant execute on function public.update_reader_group_settings(jsonb) to authenticated;
