create or replace function public.is_book_owner(target_book_id uuid)
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
      and book_members.role = 'owner'
  );
$$;

create or replace function public.can_manage_transaction(target_transaction_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.transactions
    where transactions.id = target_transaction_id
      and public.is_book_member(transactions.book_id)
      and (
        transactions.created_by = auth.uid()
        or public.is_book_owner(transactions.book_id)
      )
  );
$$;

revoke all on function public.is_book_owner(uuid) from public;
revoke all on function public.can_manage_transaction(uuid) from public;

grant execute on function public.is_book_owner(uuid) to anon, authenticated;
grant execute on function public.can_manage_transaction(uuid) to anon, authenticated;

drop policy if exists "members can insert memberships" on public.book_members;
drop policy if exists "members can update memberships" on public.book_members;
drop policy if exists "members can manage categories" on public.categories;
drop policy if exists "members can manage transactions" on public.transactions;
drop policy if exists "members can manage transaction shares" on public.transaction_shares;
drop policy if exists "members can manage invitations" on public.invitations;

create policy "owners can insert memberships"
on public.book_members
for insert
with check (public.is_book_owner(book_id));

create policy "owners can update memberships"
on public.book_members
for update
using (public.is_book_owner(book_id))
with check (public.is_book_owner(book_id));

create policy "members can read categories"
on public.categories
for select
using (
  is_system
  or public.is_book_member(book_id)
);

create policy "owners can insert categories"
on public.categories
for insert
with check (
  is_system = false
  and public.is_book_owner(book_id)
);

create policy "owners can update categories"
on public.categories
for update
using (
  is_system = false
  and public.is_book_owner(book_id)
)
with check (
  is_system = false
  and public.is_book_owner(book_id)
);

create policy "owners can delete categories"
on public.categories
for delete
using (
  is_system = false
  and public.is_book_owner(book_id)
);

create policy "members can read transactions"
on public.transactions
for select
using (public.is_book_member(book_id));

create policy "members can insert transactions"
on public.transactions
for insert
with check (
  public.is_book_member(book_id)
  and created_by = auth.uid()
);

create policy "owners or creators can update transactions"
on public.transactions
for update
using (
  public.is_book_member(book_id)
  and (
    created_by = auth.uid()
    or public.is_book_owner(book_id)
  )
)
with check (
  public.is_book_member(book_id)
  and (
    created_by = auth.uid()
    or public.is_book_owner(book_id)
  )
);

create policy "owners or creators can delete transactions"
on public.transactions
for delete
using (
  public.is_book_member(book_id)
  and (
    created_by = auth.uid()
    or public.is_book_owner(book_id)
  )
);

create policy "members can read transaction shares"
on public.transaction_shares
for select
using (
  exists (
    select 1
    from public.transactions
    where transactions.id = transaction_shares.transaction_id
      and public.is_book_member(transactions.book_id)
  )
);

create policy "owners or creators can insert transaction shares"
on public.transaction_shares
for insert
with check (public.can_manage_transaction(transaction_id));

create policy "owners or creators can update transaction shares"
on public.transaction_shares
for update
using (public.can_manage_transaction(transaction_id))
with check (public.can_manage_transaction(transaction_id));

create policy "owners or creators can delete transaction shares"
on public.transaction_shares
for delete
using (public.can_manage_transaction(transaction_id));

create policy "members can read invitations"
on public.invitations
for select
using (public.is_book_member(book_id));

create policy "owners can insert invitations"
on public.invitations
for insert
with check (public.is_book_owner(book_id));

create policy "owners can update invitations"
on public.invitations
for update
using (public.is_book_owner(book_id))
with check (public.is_book_owner(book_id));

create policy "owners can delete invitations"
on public.invitations
for delete
using (public.is_book_owner(book_id));
