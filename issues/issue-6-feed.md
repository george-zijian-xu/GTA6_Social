## Parent PRD

#1

## What to build

Build the home feed at `/` — the core product experience. The first page of posts is server-rendered (SSR) for SEO and fast first paint. Subsequent pages load via infinite scroll on the client. Posts are ranked by hot score, with a 1.3× follow boost applied for authenticated users whose followed authors have posts in the result set. Each card links to the post detail page, the author's profile, and (if tagged) the location page.

The masonry layout uses `react-masonry-css` with variable card heights — no fixed aspect ratios.

## Acceptance criteria

- [ ] `/` server-renders the first page of posts as full HTML (verify with `curl` or view-source)
- [ ] Masonry grid: variable card heights based on image dimensions, responsive column counts (1 → 2 → 3 → 4 columns at Tailwind breakpoints)
- [ ] Each card shows: image (Next.js `<Image>`), caption (truncated), like count, username, avatar
- [ ] Cards are ordered by `hot_score` descending
- [ ] Authenticated users whose feed includes posts from followed authors see those posts ranked higher (follow boost ×1.3 applied at query time)
- [ ] Intersection Observer at the bottom of the feed triggers loading the next page of posts (cursor-based pagination)
- [ ] Loading spinner shown while fetching more posts
- [ ] Empty state shown if no posts exist
- [ ] Card links: image/caption → `/posts/[slug]`, username/avatar → `/users/[username]`, location tag → `/locations/[slug]`
- [ ] Feed can be filtered by location via `?location=[slug]` query param (used by Location Explorer)

## Blocked by

- Blocked by #3 (schema)
- Blocked by #4 (layout shell)

## User stories addressed

- User stories 1, 2
