## Parent PRD

#1

## What to build

Build the full-screen Location Explorer at `/map` and complete the mini map module on the post detail page. The Location Explorer uses Leaflet.js with `react-leaflet`, loaded client-side only (dynamic import) to avoid SSR window errors. The base layer is a custom GTA 6 map tile layer sourced from the community (placeholder tiles acceptable for initial build; swap when final tiles are available). Post-count pins are rendered as Leaflet markers sized/coloured by activity. Clicking a pin shows a popup with the location name, post count, a preview of recent posts, and a "Filter Home Feed" button.

The mini map module on the post detail page (stub in issue #7) is now wired up: it renders a small Leaflet map instance centred on the post's location pin. Clicking it navigates to `/map?focus=[location_slug]`.

## Acceptance criteria

- [ ] `/map` route renders a full-screen Leaflet map (no SSR — loaded with `next/dynamic` and `ssr: false`)
- [ ] Custom GTA 6 map tile layer loaded as the base layer (community tiles or placeholder)
- [ ] Locations with `post_count > 0` rendered as pins sized proportionally to activity
- [ ] Animated ping effect on the highest-activity pin
- [ ] Zoom (+/-) and pan controls visible; my-location button present (non-functional — fictional map has no real GPS)
- [ ] Clicking a pin opens a popup: location name, post count, 3 recent post thumbnails, "Filter Home Feed" button
- [ ] "Filter Home Feed" navigates to `/?location=[slug]` and closes the map
- [ ] `/map?focus=[slug]` centres the map on the specified location pin
- [ ] Mini map on post detail: small Leaflet instance showing the post's pin; clicking navigates to `/map?focus=[slug]`; hidden if post has no location
- [ ] Map is accessible to unauthenticated users
- [ ] Map attribution includes credit to community tile sources (stateofleonida.net / gtadb.org)

## Blocked by

- Blocked by #10 (post creation — posts need location tags for pins to have data)

## User stories addressed

- User stories 45, 46, 47, 48, 49, 50, 51
