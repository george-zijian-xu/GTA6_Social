## Parent PRD

#1

## What to build

Build the user profile page at `/users/[username]` and the follow/unfollow system. The page is server-rendered. It shows the user's avatar, display name, bio, website, follower/following/total-likes stats, a Follow button, a Share button, and an infinite-scroll masonry grid of the user's posts (same card component as the home feed).

The profile hover card (shown on username/avatar hover anywhere on the site) is also completed here — it's a shared component showing avatar, username, follower count, a Follow button, and a 3-image mini grid.

Own profile: Follow button replaced by Edit Profile button. Edit profile modal: change avatar (upload to `avatars` bucket), display name, bio, website.

Follow/unfollow: inserts/deletes from `follows` table. Creates a `follow` notification for the followed user.

Vitest: follow inserts row, unfollow deletes row, follower count updates, follow notification created.

## Acceptance criteria

- [ ] `/users/[username]` server-renders profile header + first page of posts
- [ ] Profile header: avatar, display name, username, bio, website link, follower count, following count, total likes
- [ ] Follow button: authenticated users can follow/unfollow; count updates optimistically; redirects unauthenticated to login
- [ ] Share button: copies profile URL to clipboard
- [ ] Masonry post grid with infinite scroll (same card component as home feed)
- [ ] Own profile: shows "Edit Profile" instead of Follow; edit modal allows avatar upload, display name, bio, website
- [ ] Profile hover card component works on username/avatar hover anywhere in the app (post cards, post detail, comments)
- [ ] Hover card: avatar, username, follower count, follow button, 3 most recent post images
- [ ] 404 if username not found
- [ ] Vitest: follow → row inserted + notification created; unfollow → row deleted; self-follow rejected; follower count accurate

## Blocked by

- Blocked by #5 (auth)
- Blocked by #6 (home feed — shares the post card component)

## User stories addressed

- User stories 6, 7, 32, 33, 36, 37, 38, 39
