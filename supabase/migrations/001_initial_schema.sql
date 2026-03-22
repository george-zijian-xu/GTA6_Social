-- Full DB schema for Leonida Social
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  website text,
  is_admin boolean not null default false,
  subscription_tier text not null default 'free',
  banned_at timestamptz,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Locations (gtadb.org compatible schema)
create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  category text,
  ig_x numeric,
  ig_y numeric,
  rl_lat numeric,
  rl_lng numeric,
  description text,
  post_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Posts
create table posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles(id) on delete cascade,
  caption text not null default '',
  slug text unique not null,
  location_id uuid references locations(id) on delete set null,
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Hot score: computed at query time since it depends on now()
-- Usage: SELECT *, hot_score(posts) FROM posts ORDER BY hot_score(posts) DESC
create or replace function hot_score(p posts) returns numeric
  language sql stable as $$
  select (p.like_count + p.comment_count * 2.0) /
         power(extract(epoch from (now() - p.created_at)) / 3600.0 + 2.0, 1.5)
$$;

-- Full-text search on posts
alter table posts add column search_vector tsvector
  generated always as (to_tsvector('english', caption)) stored;
create index posts_search_idx on posts using gin(search_vector);

-- Post images
create table post_images (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  display_order int not null default 0,
  width int,
  height int
);

-- Follows
create table follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

-- Likes
create table likes (
  user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- Auto-update like_count
create or replace function update_post_like_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update posts set like_count = like_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set like_count = like_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;
create trigger on_like_change
  after insert or delete on likes
  for each row execute function update_post_like_count();

-- Comments
create table comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  like_count int not null default 0,
  parent_comment_id uuid references comments(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Auto-update comment_count
create or replace function update_post_comment_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set comment_count = comment_count - 1 where id = old.post_id;
  end if;
  return null;
end;
$$;
create trigger on_comment_change
  after insert or delete on comments
  for each row execute function update_post_comment_count();

-- Comment likes
create table comment_likes (
  user_id uuid not null references profiles(id) on delete cascade,
  comment_id uuid not null references comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

-- Notifications
create type notification_type as enum ('like', 'comment', 'follow');
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  type notification_type not null,
  actor_id uuid not null references profiles(id) on delete cascade,
  target_user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Reports
create type report_status as enum ('pending', 'reviewed', 'dismissed');
create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reason text not null,
  status report_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- Full-text search on profiles
alter table profiles add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(username, '') || ' ' || coalesce(display_name, ''))) stored;
create index profiles_search_idx on profiles using gin(search_vector);

-- RLS: enable on all tables
alter table profiles enable row level security;
alter table posts enable row level security;
alter table post_images enable row level security;
alter table locations enable row level security;
alter table follows enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table comment_likes enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;

-- Public read policies
create policy "public read profiles" on profiles for select using (true);
create policy "public read posts" on posts for select using (true);
create policy "public read post_images" on post_images for select using (true);
create policy "public read locations" on locations for select using (true);
create policy "public read comments" on comments for select using (true);

-- Authenticated write policies
create policy "insert own post" on posts for insert with check (auth.uid() = author_id);
create policy "delete own post" on posts for delete using (auth.uid() = author_id);
create policy "insert own comment" on comments for insert with check (auth.uid() = author_id);
create policy "delete own comment" on comments for delete using (auth.uid() = author_id);
create policy "insert own like" on likes for insert with check (auth.uid() = user_id);
create policy "delete own like" on likes for delete using (auth.uid() = user_id);
create policy "insert own comment_like" on comment_likes for insert with check (auth.uid() = user_id);
create policy "delete own comment_like" on comment_likes for delete using (auth.uid() = user_id);
create policy "insert own follow" on follows for insert with check (auth.uid() = follower_id);
create policy "delete own follow" on follows for delete using (auth.uid() = follower_id);
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "insert own report" on reports for insert with check (auth.uid() = reporter_id);
create policy "read own notifications" on notifications for select using (auth.uid() = target_user_id);
create policy "update own notifications" on notifications for update using (auth.uid() = target_user_id);
