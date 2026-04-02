-- Trigger to keep locations.post_count in sync with posts table
-- Follows same SECURITY DEFINER pattern as migration 005

create or replace function update_location_post_count()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    if new.location_id is not null then
      update public.locations set post_count = post_count + 1 where id = new.location_id;
    end if;

  elsif TG_OP = 'DELETE' then
    if old.location_id is not null then
      update public.locations set post_count = greatest(post_count - 1, 0) where id = old.location_id;
    end if;

  elsif TG_OP = 'UPDATE' then
    -- location_id changed: decrement old, increment new
    if old.location_id is distinct from new.location_id then
      if old.location_id is not null then
        update public.locations set post_count = greatest(post_count - 1, 0) where id = old.location_id;
      end if;
      if new.location_id is not null then
        update public.locations set post_count = post_count + 1 where id = new.location_id;
      end if;
    end if;
  end if;

  return null;
end;
$$;

drop trigger if exists on_post_location_change on public.posts;
create trigger on_post_location_change
  after insert or delete or update of location_id on public.posts
  for each row execute function update_location_post_count();

-- Backfill existing posts
update public.locations
set post_count = (
  select count(*) from public.posts where location_id = locations.id
);
