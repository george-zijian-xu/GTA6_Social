## Parent PRD

#1

## What to build

Build the persistent app shell that wraps every page: the left sidebar on desktop, the bottom navigation bar on mobile, and the dark/light mode toggle. No real data yet — this is the layout skeleton that all feature issues will slot into.

The sidebar contains: Leonida Social wordmark, nav items (Discover, Publish, Profile, Notifications), a prominent POST button, and bottom links (About, Privacy, Dark Mode, Logout). On mobile (< 768px) the sidebar is hidden and replaced by a 4-icon bottom nav bar. Dark mode is toggled by flipping the `dark` class on `<html>` and persisted to localStorage.

## Acceptance criteria

- [ ] Desktop layout: fixed 256px left sidebar, main content fills the rest
- [ ] Sidebar shows: wordmark in `#ff2442`, nav items (Discover, Publish, Profile, Notifications) with Material Symbols Outlined icons, POST button (rounded-full, primary gradient), bottom links (About, Privacy, Dark Mode toggle, Logout)
- [ ] Active nav item highlighted with `bg-red-50` background and `#ff2442` text/icon
- [ ] Mobile (< 768px): sidebar hidden, bottom nav bar shows 4 icons (Discover, Publish, Profile, Notifications)
- [ ] Dark mode toggle switches `dark` class on `<html>`, persisted in localStorage, applied on page load to prevent flash
- [ ] Navigating between `/`, `/publish`, `/users/[username]`, `/notifications` updates the active nav item
- [ ] Shell renders correctly with no content (empty main area) and with placeholder content

## Blocked by

- Blocked by #2

## User stories addressed

- User story 11 (dark/light mode toggle)
