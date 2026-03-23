-- Storage bucket creation and RLS policies (issue #23)
-- Fixes: image uploads blocked for post-images and avatars buckets

-- Ensure buckets exist and are public (no-op if already created via web UI)
insert into storage.buckets (id, name, public)
  values ('post-images', 'post-images', true)
  on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do update set public = true;

-- post-images: public read, authenticated write/delete
create policy "post images are publicly readable"
  on storage.objects for select to public
  using (bucket_id = 'post-images');

create policy "authenticated users can upload post images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'post-images');

create policy "authenticated users can delete their post images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'post-images' and owner = auth.uid());

-- avatars: public read, authenticated write (upsert = insert + update)
create policy "avatars are publicly readable"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

create policy "authenticated users can upload avatars"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');

create policy "users can replace their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and owner = auth.uid());
