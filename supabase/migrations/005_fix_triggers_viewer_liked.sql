-- Fix trigger functions: add SECURITY DEFINER so they can UPDATE posts
-- under RLS (authenticated users have no UPDATE policy on posts).
-- Without this, like_count and comment_count never update in production.

create or replace function update_post_like_count()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

create or replace function update_post_comment_count()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

-- Update get_feed to include viewer_liked boolean
-- Must drop first: Postgres cannot change return type via CREATE OR REPLACE
drop function if exists get_feed(uuid, numeric, timestamptz, uuid, int, timestamptz);

create function get_feed(
  p_viewer_id         uuid        default null,
  p_cursor_score      numeric     default null,
  p_cursor_created_at timestamptz default null,
  p_cursor_id         uuid        default null,
  p_limit             int         default 20,
  p_ref_time          timestamptz default null
)
returns table (
  id            uuid,
  author_id     uuid,
  caption       text,
  slug          text,
  location_id   uuid,
  like_count    int,
  comment_count int,
  created_at    timestamptz,
  score         numeric,
  username      text,
  display_name  text,
  avatar_url    text,
  image_path    text,
  image_alt     text,
  image_width   int,
  image_height  int,
  location_name text,
  location_slug text,
  viewer_liked  boolean
)
language sql stable
set search_path = ''
as $$
  with scored as (
    select
      p.id,
      p.author_id,
      p.caption,
      p.slug,
      p.location_id,
      p.like_count,
      p.comment_count,
      p.created_at,
      (p.like_count + p.comment_count * 2.0)
        / power(extract(epoch from (coalesce(p_ref_time, now()) - p.created_at)) / 3600.0 + 2.0, 1.5)
        * case when f.follower_id is not null then 1.3 else 1.0 end
        as score,
      pr.username,
      pr.display_name,
      pr.avatar_url,
      pi.storage_path  as image_path,
      pi.alt_text       as image_alt,
      pi.width          as image_width,
      pi.height         as image_height,
      loc.name          as location_name,
      loc.slug          as location_slug,
      (lv.user_id is not null) as viewer_liked
    from public.posts p
    join public.profiles pr on pr.id = p.author_id
    left join public.post_images pi
      on pi.post_id = p.id and pi.display_order = 0
    left join public.follows f
      on f.follower_id = p_viewer_id
      and f.following_id = p.author_id
    left join public.locations loc
      on loc.id = p.location_id
    left join public.likes lv
      on lv.post_id = p.id
      and lv.user_id = p_viewer_id
  )
  select * from scored s
  where (
    p_cursor_score is null
    or (s.score, s.created_at, s.id)
       < (p_cursor_score, p_cursor_created_at, p_cursor_id)
  )
  order by s.score desc, s.created_at desc, s.id desc
  limit p_limit;
$$;
