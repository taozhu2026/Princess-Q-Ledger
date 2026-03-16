create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  accent_color text not null default '#355f45',
  theme_preference text not null default 'system' check (theme_preference in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

alter table public.invitations
  add column if not exists inviter_member_id uuid references public.book_members (id) on delete set null;

create unique index if not exists categories_system_unique
on public.categories (name, type)
where book_id is null and is_system = true;

create unique index if not exists categories_book_unique
on public.categories (book_id, name, type)
where book_id is not null;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row
execute function public.touch_updated_at();

insert into public.categories (book_id, name, type, icon, color, is_system)
values
  (null, '餐饮', 'expense', 'UtensilsCrossed', '#f2c078', true),
  (null, '通勤', 'expense', 'TramFront', '#6ea8a1', true),
  (null, '家用', 'expense', 'House', '#c8b17f', true),
  (null, '娱乐', 'expense', 'Popcorn', '#d47f71', true),
  (null, '宠物', 'expense', 'PawPrint', '#9a8dd8', true),
  (null, '工资', 'income', 'Wallet', '#80a771', true),
  (null, '奖金', 'income', 'BadgeCent', '#6d9e61', true),
  (null, '结算', 'settlement', 'ArrowRightLeft', '#355f45', true)
on conflict do nothing;

create policy "users can read related profiles"
on public.profiles
for select
using (
  id = auth.uid()
  or exists (
    select 1
    from public.book_members current_member
    join public.book_members target_member
      on target_member.book_id = current_member.book_id
    where current_member.user_id = auth.uid()
      and target_member.user_id = profiles.id
  )
);

create policy "users can insert own profile"
on public.profiles
for insert
with check (id = auth.uid());

create policy "users can update own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

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
      when profiles.display_name = '' then excluded.display_name
      else profiles.display_name
    end;

  insert into public.ledger_books (name, currency, created_by)
  values (
    coalesce(nullif(trim(book_name), ''), '公主Q的账本'),
    'CNY',
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
      when profiles.display_name = '' then excluded.display_name
      else profiles.display_name
    end;

  insert into public.book_members (book_id, user_id, role, display_name)
  values (invitation_row.book_id, current_user_id, 'member', current_display_name)
  on conflict (book_id, user_id) do update
  set display_name = excluded.display_name;

  update public.invitations
  set accepted_at = now()
  where id = invitation_row.id
    and accepted_at is null;

  return invitation_row.book_id;
end;
$$;

revoke all on function public.bootstrap_ledger(text, text) from public;
revoke all on function public.accept_invitation(text, text) from public;

grant execute on function public.bootstrap_ledger(text, text) to authenticated;
grant execute on function public.accept_invitation(text, text) to authenticated;
