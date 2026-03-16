create extension if not exists "pgcrypto";

create table public.ledger_books (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text not null default 'CNY',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.book_members (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.ledger_books (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  display_name text not null,
  joined_at timestamptz not null default now(),
  unique (book_id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.ledger_books (id) on delete cascade,
  name text not null,
  type text not null check (type in ('expense', 'income', 'settlement')),
  icon text not null,
  color text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.ledger_books (id) on delete cascade,
  type text not null check (type in ('expense', 'income', 'settlement')),
  amount numeric(12, 2) not null check (amount >= 0),
  category_id uuid not null references public.categories (id),
  payer_member_id uuid not null references public.book_members (id),
  occurred_at timestamptz not null,
  note text not null default '',
  is_shared boolean not null default false,
  split_method text not null check (split_method in ('equal', 'custom_amount')),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.transaction_shares (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  member_id uuid not null references public.book_members (id),
  share_amount numeric(12, 2) not null check (share_amount >= 0),
  share_ratio numeric(8, 4),
  is_settlement_impact boolean not null default false
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.ledger_books (id) on delete cascade,
  inviter_user_id uuid not null references auth.users (id),
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ledger_books enable row level security;
alter table public.book_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_shares enable row level security;
alter table public.invitations enable row level security;

create policy "members can read books"
on public.ledger_books
for select
using (
  exists (
    select 1
    from public.book_members
    where book_members.book_id = ledger_books.id
      and book_members.user_id = auth.uid()
  )
);

create policy "owners can create books"
on public.ledger_books
for insert
with check (created_by = auth.uid());

create policy "members can read own memberships"
on public.book_members
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.book_members bm
    where bm.book_id = book_members.book_id
      and bm.user_id = auth.uid()
  )
);

create policy "members can manage categories"
on public.categories
for all
using (
  is_system
  or exists (
    select 1
    from public.book_members
    where book_members.book_id = categories.book_id
      and book_members.user_id = auth.uid()
  )
)
with check (
  is_system = false
  and exists (
    select 1
    from public.book_members
    where book_members.book_id = categories.book_id
      and book_members.user_id = auth.uid()
  )
);

create policy "members can manage transactions"
on public.transactions
for all
using (
  exists (
    select 1
    from public.book_members
    where book_members.book_id = transactions.book_id
      and book_members.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.book_members
    where book_members.book_id = transactions.book_id
      and book_members.user_id = auth.uid()
  )
);

create policy "members can manage transaction shares"
on public.transaction_shares
for all
using (
  exists (
    select 1
    from public.transactions
    join public.book_members on book_members.book_id = transactions.book_id
    where transactions.id = transaction_shares.transaction_id
      and book_members.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.transactions
    join public.book_members on book_members.book_id = transactions.book_id
    where transactions.id = transaction_shares.transaction_id
      and book_members.user_id = auth.uid()
  )
);

create policy "members can manage invitations"
on public.invitations
for all
using (
  exists (
    select 1
    from public.book_members
    where book_members.book_id = invitations.book_id
      and book_members.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.book_members
    where book_members.book_id = invitations.book_id
      and book_members.user_id = auth.uid()
  )
);
