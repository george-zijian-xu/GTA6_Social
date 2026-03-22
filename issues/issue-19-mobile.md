## Parent PRD

#1

## What to build

Ensure the entire site is fully usable on mobile browsers. The layout shell issue (#4) set up the bottom nav bar structure; this issue is a focused pass to verify and fix every page at mobile viewports, test on real devices, and close any responsive gaps. 60% of expected traffic is mobile.

## Acceptance criteria

- [ ] Bottom nav bar (Discover, Publish, Profile, Notifications) visible and functional on all pages at < 768px
- [ ] Home feed masonry: single column on phone, 2 columns on tablet
- [ ] Post detail: stacks vertically on mobile (media gallery top, post info below)
- [ ] Post creation panel: full-screen sheet on mobile instead of side panel
- [ ] User profile: responsive header layout (avatar + stats wrap correctly)
- [ ] Notifications page: full-width items on mobile
- [ ] Location Explorer map: fills screen, controls positioned for thumb reach
- [ ] Search page: full-width results on mobile
- [ ] All tap targets meet minimum 44×44px touch target size
- [ ] No horizontal scroll on any page at 375px viewport width
- [ ] Fast-post panel opens as a bottom sheet on mobile
- [ ] Tested on at least: Chrome on Android, Safari on iOS (or equivalents via browser DevTools)
- [ ] Sidebar completely hidden on mobile (no ghost layout)

## Blocked by

- Blocked by #4 (layout shell)
- Blocked by #12 (notifications — last major page to verify)

## User stories addressed

- User story 8
