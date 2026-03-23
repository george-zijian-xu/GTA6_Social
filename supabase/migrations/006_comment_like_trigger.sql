-- Add missing trigger for comments.like_count (never existed in 001)
-- Uses SECURITY DEFINER to bypass RLS, same pattern as post like/comment triggers.

create or replace function update_comment_like_count()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    update public.comments set like_count = like_count + 1 where id = new.comment_id;
  elsif TG_OP = 'DELETE' then
    update public.comments set like_count = greatest(like_count - 1, 0) where id = old.comment_id;
  end if;
  return null;
end;
$$;

create trigger on_comment_like_change
  after insert or delete on public.comment_likes
  for each row execute function update_comment_like_count();
