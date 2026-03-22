## Parent PRD

#1

## What to build

Build the report flow and admin moderation panel. Any logged-in user can report a post or comment via a report button (three-dot menu or flag icon). Reports flow into the `/admin` route which is gated behind `profiles.is_admin = true`. Admins can view the pending report queue, delete posts/comments, ban users, and promote users to co-moderator.

## Acceptance criteria

- [ ] Report button visible on post cards (three-dot menu), post detail page, and comments
- [ ] Clicking Report opens a modal with a reason field (free text) and a Submit button
- [ ] Submitted report creates a `reports` row with `status = 'pending'`
- [ ] `/admin` route: only accessible to users where `profiles.is_admin = true`; others receive 403
- [ ] Admin report queue: lists pending reports with: reporter, reported content preview, reason, timestamp, action buttons
- [ ] Admin can mark a report as Reviewed (dismisses it) or take action
- [ ] Admin can delete any post (hard delete — cascades to images, likes, comments, notifications)
- [ ] Admin can delete any comment
- [ ] Admin can ban a user: sets `profiles.banned_at = now()`; banned users get signed out via Supabase Admin API and see a "Your account has been suspended" message on next login
- [ ] Admin can toggle `profiles.is_admin` to promote/demote co-moderators
- [ ] Vitest: report insert creates pending row; non-admin cannot access admin API route; admin delete cascades correctly; RLS: unauthenticated cannot read reports table

## Blocked by

- Blocked by #5 (auth — admin check requires authenticated session)

## User stories addressed

- User stories 55, 56, 57, 58, 59
