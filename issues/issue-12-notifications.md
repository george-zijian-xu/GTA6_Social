## Parent PRD

#1

## What to build

Build the notifications centre at `/notifications`. The page has three tabs: Comments, Likes, New Follows. Notifications are fetched on page load (pull-on-load — no realtime). The Notifications nav item shows an unread badge (red dot) when there are unread notifications; the badge count is fetched on each page navigation and cleared when the user visits `/notifications`.

Each notification item: actor avatar, description text (e.g. "Elena Rossi commented on your post: '...'"), timestamp, and a thumbnail of the related post (for comment/like notifications). Clicking an item navigates to the relevant post or profile and marks the notification as read.

## Acceptance criteria

- [ ] `/notifications` page with three tabs: Comments, Likes, New Follows
- [ ] Comments tab: shows notifications where `type = 'comment'`, newest first
- [ ] Likes tab: shows notifications where `type = 'like'`, newest first
- [ ] New Follows tab: shows notifications where `type = 'follow'`, newest first
- [ ] Each item shows: actor avatar (links to their profile), description, relative timestamp, post thumbnail (comment/like only)
- [ ] Clicking a comment/like notification navigates to the post and marks it `read_at = now()`
- [ ] Clicking a follow notification navigates to the actor's profile and marks it read
- [ ] Unread badge on Notifications nav item: visible when `read_at IS NULL` count > 0
- [ ] Badge count refreshes on each page navigation (fetched server-side in layout)
- [ ] Visiting `/notifications` marks all currently shown notifications as read
- [ ] Empty state per tab shown when no notifications of that type exist
- [ ] Unauthenticated access redirects to `/auth/login`
- [ ] Vitest: notification created on like/comment/follow (covered in prior issues); read_at updated on visit

## Blocked by

- Blocked by #8 (likes — creates like notifications)
- Blocked by #9 (comments — creates comment notifications)
- Blocked by #11 (profile/follow — creates follow notifications)

## User stories addressed

- User stories 40, 41, 42, 43, 44
