alter table public.profiles
  add column if not exists avatar_url text;

alter table public.ledger_books
  add column if not exists kind text not null default 'shared'
  check (kind in ('personal', 'shared'));

update public.ledger_books
set kind = case
  when member_counts.member_count = 1 then 'personal'
  else 'shared'
end
from (
  select book_id, count(*)::int as member_count
  from public.book_members
  group by book_id
) as member_counts
where public.ledger_books.id = member_counts.book_id;

alter table public.book_members
  alter column display_name drop not null;

create or replace function public.ensure_user_profile()
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  existing_display_name text;
  computed_display_name text;
begin
  if current_user_id is null then
    raise exception '请先登录。';
  end if;

  select email
  into current_email
  from auth.users
  where id = current_user_id;

  select display_name
  into existing_display_name
  from public.profiles
  where id = current_user_id;

  computed_display_name := coalesce(
    nullif(trim(existing_display_name), ''),
    split_part(coalesce(current_email, ''), '@', 1),
    '成员'
  );

  insert into public.profiles (id, email, display_name)
  values (
    current_user_id,
    coalesce(current_email, ''),
    computed_display_name
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = case
      when coalesce(trim(public.profiles.display_name), '') = '' then excluded.display_name
      else public.profiles.display_name
    end;

  return current_user_id;
end;
$$;

create or replace function public.ensure_personal_ledger()
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  current_display_name text;
  existing_book_id uuid;
  created_book_id uuid;
  default_book_name text;
begin
  if current_user_id is null then
    raise exception '请先登录。';
  end if;

  perform public.ensure_user_profile();

  select bm.book_id
  into existing_book_id
  from public.book_members bm
  join public.ledger_books lb on lb.id = bm.book_id
  where bm.user_id = current_user_id
  order by
    case when lb.kind = 'personal' then 0 else 1 end,
    bm.joined_at asc
  limit 1;

  if existing_book_id is not null then
    return existing_book_id;
  end if;

  select display_name
  into current_display_name
  from public.profiles
  where id = current_user_id;

  default_book_name := case
    when coalesce(trim(current_display_name), '') <> '' then current_display_name || '的账本'
    else '我的账本'
  end;

  insert into public.ledger_books (name, currency, kind, created_by)
  values (default_book_name, 'CNY', 'personal', current_user_id)
  returning id into created_book_id;

  insert into public.book_members (book_id, user_id, role, display_name)
  values (created_book_id, current_user_id, 'owner', current_display_name);

  return created_book_id;
end;
$$;

create or replace function public.update_my_profile(
  new_display_name text,
  new_avatar_url text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_display_name text;
  updated_profile public.profiles%rowtype;
begin
  if current_user_id is null then
    raise exception '请先登录。';
  end if;

  perform public.ensure_user_profile();

  normalized_display_name := nullif(trim(new_display_name), '');
  if normalized_display_name is null then
    raise exception '显示名称不能为空。';
  end if;

  update public.profiles
  set
    display_name = normalized_display_name,
    avatar_url = coalesce(new_avatar_url, avatar_url)
  where id = current_user_id
  returning * into updated_profile;

  update public.book_members
  set display_name = normalized_display_name
  where user_id = current_user_id;

  return updated_profile;
end;
$$;

create or replace function public.bootstrap_ledger(book_name text, member_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  current_display_name text;
  existing_book_id uuid;
  created_book_id uuid;
begin
  if current_user_id is null then
    raise exception '请先登录。';
  end if;

  select book_id
  into existing_book_id
  from public.book_members
  where user_id = current_user_id
  limit 1;

  if existing_book_id is not null then
    return existing_book_id;
  end if;

  select email
  into current_email
  from auth.users
  where id = current_user_id;

  current_display_name := coalesce(
    nullif(trim(member_display_name), ''),
    split_part(coalesce(current_email, ''), '@', 1),
    '成员'
  );

  insert into public.profiles (id, email, display_name)
  values (current_user_id, coalesce(current_email, ''), current_display_name)
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = case
      when public.profiles.display_name = '' then excluded.display_name
      else public.profiles.display_name
    end;

  insert into public.ledger_books (name, currency, kind, created_by)
  values (
    coalesce(nullif(trim(book_name), ''), '公主Q的账本'),
    'CNY',
    'shared',
    current_user_id
  )
  returning id into created_book_id;

  insert into public.book_members (book_id, user_id, role, display_name)
  values (created_book_id, current_user_id, 'owner', current_display_name);

  return created_book_id;
end;
$$;

create or replace function public.accept_invitation(invite_token text, member_display_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  current_display_name text;
  existing_book_id uuid;
  invitation_row public.invitations%rowtype;
begin
  if current_user_id is null then
    raise exception '请先登录。';
  end if;

  select *
  into invitation_row
  from public.invitations
  where token = invite_token
  for update;

  if not found then
    raise exception '邀请不存在或已失效。';
  end if;

  if invitation_row.accepted_at is not null then
    raise exception '这条邀请已经被使用过了。';
  end if;

  if invitation_row.expires_at < now() then
    raise exception '邀请已过期，请重新生成。';
  end if;

  select book_id
  into existing_book_id
  from public.book_members
  where user_id = current_user_id
  limit 1;

  if existing_book_id is not null and existing_book_id <> invitation_row.book_id then
    raise exception '当前账号已经加入其他账本。';
  end if;

  select email
  into current_email
  from auth.users
  where id = current_user_id;

  current_display_name := coalesce(
    nullif(trim(member_display_name), ''),
    split_part(coalesce(current_email, ''), '@', 1),
    '成员'
  );

  insert into public.profiles (id, email, display_name)
  values (current_user_id, coalesce(current_email, ''), current_display_name)
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = case
      when public.profiles.display_name = '' then excluded.display_name
      else public.profiles.display_name
    end;

  insert into public.book_members (book_id, user_id, role, display_name)
  values (invitation_row.book_id, current_user_id, 'member', current_display_name)
  on conflict (book_id, user_id) do update
  set display_name = excluded.display_name;

  update public.invitations
  set accepted_at = now()
  where id = invitation_row.id
    and accepted_at is null;

  update public.ledger_books
  set kind = 'shared'
  where id = invitation_row.book_id;

  return invitation_row.book_id;
end;
$$;

revoke all on function public.ensure_user_profile() from public;
revoke all on function public.ensure_personal_ledger() from public;
revoke all on function public.update_my_profile(text, text) from public;
revoke all on function public.bootstrap_ledger(text, text) from public;
revoke all on function public.accept_invitation(text, text) from public;

grant execute on function public.ensure_user_profile() to authenticated;
grant execute on function public.ensure_personal_ledger() to authenticated;
grant execute on function public.update_my_profile(text, text) to authenticated;
grant execute on function public.bootstrap_ledger(text, text) to authenticated;
grant execute on function public.accept_invitation(text, text) to authenticated;
