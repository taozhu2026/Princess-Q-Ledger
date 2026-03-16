create or replace function public.rename_book(target_book_id uuid, new_book_name text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_name text := nullif(trim(new_book_name), '');
  updated_book_id uuid;
begin
  if current_user_id is null then
    raise exception '请先登录。';
  end if;

  if normalized_name is null then
    raise exception '账本名称不能为空。';
  end if;

  update public.ledger_books
  set name = normalized_name
  where id = target_book_id
    and public.is_book_owner(target_book_id)
  returning id into updated_book_id;

  if updated_book_id is null then
    raise exception '只有账本创建者可以修改账本名称。';
  end if;

  return updated_book_id;
end;
$$;

revoke all on function public.rename_book(uuid, text) from public;
grant execute on function public.rename_book(uuid, text) to authenticated;
