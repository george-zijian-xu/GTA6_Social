-- Fix missing RLS policies (issues #20 and #22)

-- post_images: owner can attach images to their own posts
create policy "insert own post_images" on post_images
  for insert with check (
    exists (
      select 1 from posts
      where posts.id = post_id
        and posts.author_id = auth.uid()
    )
  );

-- notifications: actor can insert notifications on their own behalf
create policy "insert own notifications" on notifications
  for insert with check (auth.uid() = actor_id);

-- follows: follow relationships are public information
create policy "public read follows" on follows
  for select using (true);

-- likes: like data is public
create policy "public read likes" on likes
  for select using (true);

-- comment_likes: comment like data is public
create policy "public read comment_likes" on comment_likes
  for select using (true);
