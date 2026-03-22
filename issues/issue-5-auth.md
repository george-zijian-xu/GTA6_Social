## Parent PRD

#1

## What to build

Implement full authentication: email/password signup and login, Google OAuth, session persistence, protected routes, and automatic profile creation. The `/auth/login` page handles both sign-up and sign-in. On first sign-in via any provider, a `profiles` row is auto-created by the database trigger from issue #3. Banned users are blocked from logging in.

Vitest tests cover: successful signup creates a profile row, login returns a valid session, logout clears the session, protected route redirects unauthenticated users to `/auth/login`.

## Acceptance criteria

- [ ] `/auth/login` page with email/password fields and Google OAuth button, matching the design system
- [ ] Successful email signup creates an auth user and a `profiles` row (via DB trigger)
- [ ] Google OAuth flow completes and creates/reuses a `profiles` row
- [ ] Returning user can log in with email/password or Google
- [ ] Logged-in user sees "Logout" in the sidebar footer; clicking it signs out and redirects to `/`
- [ ] Routes `/publish`, `/notifications` redirect unauthenticated users to `/auth/login`
- [ ] Supabase session is persisted across page reloads
- [ ] Vitest: signup → profile row exists; login → session valid; logout → session null; unauthenticated fetch of protected data → rejected by RLS
- [ ] Auth error states shown (wrong password, email already in use)

## Blocked by

- Blocked by #3 (schema)
- Blocked by #4 (layout shell)

## User stories addressed

- User stories 16, 17, 19, 20
