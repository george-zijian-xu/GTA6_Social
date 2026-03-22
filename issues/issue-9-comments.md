## Parent PRD

#1

## What to build

Make the comment input on the post detail page functional. Users can write a top-level comment or reply to an existing comment with an @mention (flat display — replies are visually indented but stored with `parent_comment_id`). Comments can be sorted Recent (default, newest first) or Top (by `like_count` descending). A light profanity filter runs server-side on all submitted comment bodies before insert.

A `comment` notification is created for the post author on each new top-level comment (not for self-comments).

## Acceptance criteria

- [ ] Comment input at the bottom of the post detail right panel submits on Enter or clicking POST
- [ ] New comment appears at the top of the Recent-sorted list immediately after submit (optimistic insert)
- [ ] Reply button on a comment populates the input with `@username ` prefix and sets `parent_comment_id`
- [ ] Replies appear visually indented below their parent comment
- [ ] Sort toggle: "Recent" (default) and "Top" tabs switch the ordering without page reload
- [ ] Profanity filter: comments containing blocked words are rejected with a polite error message; the word list is a server-side blocklist (not exposed to client)
- [ ] Comment notification created for post author on new top-level comment (skipped for self-comment)
- [ ] Unauthenticated users see the comment input disabled with a "Log in to comment" prompt
- [ ] Vitest: comment insert → `comment_count` increments; delete → decrements; profanity filter rejects blocked words; notification created on comment

## Blocked by

- Blocked by #7 (post detail page)

## User stories addressed

- User stories 29, 30, 59
