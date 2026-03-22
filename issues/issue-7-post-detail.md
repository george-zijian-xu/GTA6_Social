## Parent PRD

#1

## What to build

Build the post detail page at `/posts/[slug]`. The page is server-rendered for SEO. The layout is a 60/40 split: left side is a media gallery (image navigation with dot indicators), right side has the user header, caption, a mini map module, and the comments section with Recent/Top sorting tabs and a comment input at the bottom.

The mini map module shows the post's Leonida location as a greyscale thumbnail with an "Open Map" label. Clicking it navigates to `/map?focus=[location_slug]` (the full Location Explorer, built in a later issue). For now the mini map is a styled placeholder that renders the location name if available, or is hidden if no location is tagged.

The right-side action row (bottom) shows: like count, comment count, share button.

## Acceptance criteria

- [ ] `/posts/[slug]` server-renders full page HTML including caption and author (verify with view-source)
- [ ] Left panel: image gallery with left/right navigation arrows, dot position indicators, supports multiple images
- [ ] Right panel top: avatar, username (links to profile), display name, date, location name
- [ ] Right panel: full caption text rendered below user header
- [ ] Mini map module: shows location name + "Open Map" button if `location_id` is set; hidden if no location
- [ ] Clicking "Open Map" navigates to `/map?focus=[location_slug]`
- [ ] Comments list: flat display, sorted Recent by default, switchable to Top (by like_count)
- [ ] Each comment shows: avatar, username, body, timestamp, like count, Reply button
- [ ] Comment input field visible (functional in next issue)
- [ ] Bottom action row: like count (heart icon), comment count, share (copy link to clipboard)
- [ ] Profile hover card on username/avatar hover: avatar, username, follower count, follow button, 3-image grid
- [ ] 404 page if slug not found

## Blocked by

- Blocked by #6 (home feed — establishes card → detail navigation)

## User stories addressed

- User stories 3, 50
