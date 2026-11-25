drop policy if exists "Paid readers and admins can view group links" on public.reader_group_settings;
drop policy if exists "Platform admins can update group links" on public.reader_group_settings;

drop function if exists public.is_platform_admin();

grant select on table public.platform_admins to authenticated;
create policy "Users can view their own admin grant"
  on public.platform_admins for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Paid readers and admins can view group links"
  on public.reader_group_settings for select to authenticated
  using (
    (select public.reader_has_paid_access())
    or exists (
      select 1 from public.platform_admins
      where user_id = (select auth.uid())
    )
  );

create policy "Platform admins can update group links"
  on public.reader_group_settings for update to authenticated
  using (
    exists (
      select 1 from public.platform_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.platform_admins
      where user_id = (select auth.uid())
    )
  );

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

  if not exists (
    select 1 from public.platform_admins
    where user_id = (select auth.uid())
  ) then
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
