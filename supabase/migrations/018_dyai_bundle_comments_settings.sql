-- Bundle comment replies
create table if not exists dyai_bundle_replies (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid references dyai_bundles(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_name text,
  body text not null,
  created_at timestamptz not null default now()
);

alter table dyai_bundle_replies enable row level security;

create policy "bundle_replies_public_read" on dyai_bundle_replies
  for select using (true);

create policy "bundle_replies_auth_insert" on dyai_bundle_replies
  for insert with check (auth.uid() = author_id);

create policy "bundle_replies_auth_delete" on dyai_bundle_replies
  for delete using (auth.uid() = author_id);

-- Add reply_count to dyai_bundles
alter table dyai_bundles add column if not exists reply_count int not null default 0;

-- RPC to add a bundle reply atomically
create or replace function dyai_add_bundle_reply(
  p_bundle_id uuid,
  p_body text,
  p_author_name text
) returns uuid language plpgsql security definer as $$
declare
  new_id uuid;
begin
  insert into dyai_bundle_replies(bundle_id, author_id, author_name, body)
  values (p_bundle_id, auth.uid(), p_author_name, p_body)
  returning id into new_id;

  update dyai_bundles set reply_count = reply_count + 1 where id = p_bundle_id;
  return new_id;
end;
$$;

-- User settings: stores active_bundle_id per user
create table if not exists dyai_user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_bundle_id uuid references dyai_bundles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table dyai_user_settings enable row level security;

create policy "user_settings_own_read" on dyai_user_settings
  for select using (auth.uid() = user_id);

create policy "user_settings_own_upsert" on dyai_user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Delete policies for sounds, prompts, bundles (owner only)
create policy "sounds_auth_delete" on dyai_sounds
  for delete using (auth.uid() = creator_id);

create policy "prompts_auth_delete" on dyai_prompts
  for delete using (auth.uid() = creator_id);
