create or replace function public.is_book_member(target_book_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.book_members
    where book_members.book_id = target_book_id
      and book_members.user_id = auth.uid()
  );
$$;

revoke all on function public.is_book_member(uuid) from public;
grant execute on function public.is_book_member(uuid) to anon, authenticated;

drop policy if exists "members can read books" on public.ledger_books;
drop policy if exists "owners can create books" on public.ledger_books;
drop policy if exists "members can read own memberships" on public.book_members;
drop policy if exists "members can manage categories" on public.categories;
drop policy if exists "members can manage transactions" on public.transactions;
drop policy if exists "members can manage transaction shares" on public.transaction_shares;
drop policy if exists "members can manage invitations" on public.invitations;

create policy "members can read books"
on public.ledger_books
for select
using (public.is_book_member(id));

create policy "owners can create books"
on public.ledger_books
for insert
with check (created_by = auth.uid());

create policy "members can read memberships"
on public.book_members
for select
using (
  user_id = auth.uid()
  or public.is_book_member(book_id)
);

create policy "members can insert memberships"
on public.book_members
for insert
with check (
  user_id = auth.uid()
  or public.is_book_member(book_id)
);

create policy "members can update memberships"
on public.book_members
for update
using (public.is_book_member(book_id))
with check (public.is_book_member(book_id));

create policy "members can manage categories"
on public.categories
for all
using (
  is_system
  or public.is_book_member(book_id)
)
with check (
  is_system = false
  and public.is_book_member(book_id)
);

create policy "members can manage transactions"
on public.transactions
for all
using (public.is_book_member(book_id))
with check (public.is_book_member(book_id));

create policy "members can manage transaction shares"
on public.transaction_shares
for all
using (
  exists (
    select 1
    from public.transactions
    where transactions.id = transaction_shares.transaction_id
      and public.is_book_member(transactions.book_id)
  )
)
with check (
  exists (
    select 1
    from public.transactions
    where transactions.id = transaction_shares.transaction_id
      and public.is_book_member(transactions.book_id)
  )
);

create policy "members can manage invitations"
on public.invitations
for all
using (public.is_book_member(book_id))
with check (public.is_book_member(book_id));
