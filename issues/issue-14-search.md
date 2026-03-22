## Parent PRD

#1

## What to build

Implement full-text search across post captions and usernames. The search bar in the top header (present on all pages) submits to `/search?q=[query]`. Results are split into two sections: matching posts (rendered as the standard masonry feed card) and matching users (rendered as a row with avatar, username, follower count, follow button). Empty state shown when no results found.

The `tsvector` columns and indexes were set up in issue #3. This issue wires up the query and the UI.

## Acceptance criteria

- [ ] Typing in the search bar and pressing Enter (or clicking a search icon) navigates to `/search?q=[query]`
- [ ] Results page shows a "Posts" section and a "Users" section
- [ ] Post results use the standard masonry card component; clicking navigates to the post detail
- [ ] User results show avatar, username, follower count, follow button; clicking navigates to profile
- [ ] Search uses Postgres full-text search (`@@` operator against `search_vector` columns)
- [ ] Results are ranked by relevance (ts_rank)
- [ ] Empty state shown per section if no matches
- [ ] Search is accessible to unauthenticated users
- [ ] Vitest: caption keyword returns matching posts; username search returns correct profile; empty query returns empty results

## Blocked by

- Blocked by #6 (home feed — reuses post card component)
- Blocked by #11 (user profile — reuses user row component)

## User stories addressed

- User stories 15, 52, 53, 54
