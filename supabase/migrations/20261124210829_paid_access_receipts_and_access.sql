create table public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  receipt_path text not null unique,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  access_expires_at timestamptz,
  constraint payment_submissions_review_state
    check (
      (status = 'pending_review' and reviewed_at is null and access_expires_at is null)
      or (status in ('approved', 'rejected') and reviewed_at is not null)
    ),
  constraint payment_submissions_expiry_state
    check (
      (status = 'approved' and access_expires_at is not null)
      or (status <> 'approved' and access_expires_at is null)
    )
);

create index payment_submissions_user_recent
  on public.payment_submissions (user_id, submitted_at desc);

create unique index payment_submissions_one_pending_per_user
  on public.payment_submissions (user_id)
  where status = 'pending_review';

create or replace function public.stamp_payment_submission_review()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'pending_review';
    new.reviewed_at := null;
    new.access_expires_at := null;
  elsif new.status is distinct from old.status then
    if new.status = 'pending_review' then
      new.reviewed_at := null;
      new.access_expires_at := null;
    elsif new.status = 'rejected' then
      new.reviewed_at := now();
      new.access_expires_at := null;
    else
      if new.access_expires_at is null or new.access_expires_at <= now() then
        raise exception 'Approved submissions require a future access expiration.';
      end if;
      new.reviewed_at := now();
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.stamp_payment_submission_review() from public, anon, authenticated;

create trigger stamp_payment_submission_review_before_write
  before insert or update on public.payment_submissions
  for each row execute function public.stamp_payment_submission_review();

alter table public.payment_submissions enable row level security;
revoke all on table public.payment_submissions from public, anon, authenticated;
grant select on table public.payment_submissions to authenticated;
grant insert (user_id, receipt_path) on public.payment_submissions to authenticated;

create policy "Readers can view their own payment submissions"
  on public.payment_submissions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Readers can submit their own payment proof"
  on public.payment_submissions for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending_review'
    and reviewed_at is null
    and access_expires_at is null
    and (storage.foldername(receipt_path))[1] = (select auth.uid()::text)
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Readers can upload their own payment proofs" on storage.objects;
create policy "Readers can upload their own payment proofs"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Readers can read their own payment proofs" on storage.objects;
create policy "Readers can read their own payment proofs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create or replace function public.reader_has_paid_access()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.payment_submissions
    where user_id = (select auth.uid())
      and status = 'approved'
      and (access_expires_at is null or access_expires_at > now())
  );
$$;

revoke all on function public.reader_has_paid_access() from public, anon, authenticated;
grant execute on function public.reader_has_paid_access() to authenticated;

drop policy if exists "Readers can view their own profile" on public.reading_profiles;
drop policy if exists "Readers can create their own profile" on public.reading_profiles;
drop policy if exists "Readers can update their own profile" on public.reading_profiles;
drop policy if exists "Readers can delete their own profile" on public.reading_profiles;
create policy "Paid readers can view their own profile"
  on public.reading_profiles for select to authenticated
  using ((select auth.uid()) = user_id and (select public.reader_has_paid_access()));
create policy "Paid readers can create their own profile"
  on public.reading_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id and (select public.reader_has_paid_access()));
create policy "Paid readers can update their own profile"
  on public.reading_profiles for update to authenticated
  using ((select auth.uid()) = user_id and (select public.reader_has_paid_access()))
  with check ((select auth.uid()) = user_id and (select public.reader_has_paid_access()));
create policy "Readers can delete their own profile"
  on public.reading_profiles for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Readers can view their own book feedback" on public.book_feedback;
drop policy if exists "Readers can create their own book feedback" on public.book_feedback;
drop policy if exists "Readers can update their own book feedback" on public.book_feedback;
drop policy if exists "Readers can delete their own book feedback" on public.book_feedback;
create policy "Paid readers can view their own book feedback"
  on public.book_feedback for select to authenticated
  using ((select auth.uid()) = user_id and (select public.reader_has_paid_access()));
create policy "Paid readers can create their own book feedback"
  on public.book_feedback for insert to authenticated
  with check ((select auth.uid()) = user_id and (select public.reader_has_paid_access()));
create policy "Paid readers can update their own book feedback"
  on public.book_feedback for update to authenticated
  using ((select auth.uid()) = user_id and (select public.reader_has_paid_access()))
  with check ((select auth.uid()) = user_id and (select public.reader_has_paid_access()));
create policy "Readers can delete their own book feedback"
  on public.book_feedback for delete to authenticated
  using ((select auth.uid()) = user_id);
