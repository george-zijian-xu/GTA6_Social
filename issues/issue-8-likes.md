## Parent PRD

#1

## What to build

Implement the like/unlike toggle for both posts and comments, with optimistic UI updates. This is also where the Vitest test harness is established — these are the first tests in the project and set the pattern for all subsequent test coverage.

Liking a post: inserts a row into `likes`, increments `posts.like_count` via DB trigger, writes a `like` notification for the post author (if not self-like). Unliking deletes the row and decrements the count. Duplicate likes are idempotent (upsert pattern). Same logic applies to comment likes via `comment_likes`.

Unauthenticated users clicking like are redirected to `/auth/login`.

## Acceptance criteria

- [ ] Authenticated user can like a post — heart icon fills, count increments immediately (optimistic)
- [ ] Authenticated user can unlike — heart icon empties, count decrements immediately (optimistic)
- [ ] If the server call fails, the optimistic update is rolled back and an error toast is shown
- [ ] Same like/unlike behaviour on comments in the post detail right panel
- [ ] Unauthenticated like click redirects to `/auth/login`
- [ ] Liking a post creates a `notifications` row of type `like` for the post author (skipped if self-like)
- [ ] Liking a comment creates a `notifications` row of type `like` for the comment author
- [ ] **Vitest tests (new test file — establishes the test harness):**
  - [ ] Like toggle: like count increments on insert, decrements on delete
  - [ ] Idempotency: double-liking does not double-increment
  - [ ] RLS: unauthenticated insert into `likes` is rejected
  - [ ] Notification created on like (not on self-like)

## Blocked by

- Blocked by #7 (post detail — like button lives here)

## User stories addressed

- User stories 27, 28, 31
