## Parent PRD

#1

## What to build

Two entry points for creating posts, both sharing the same underlying logic:

1. **Fast-post panel**: a slide-in panel triggered by the POST button in the sidebar. Opens without leaving the home feed. Contains: image upload (up to 10 images), caption textarea, optional location dropdown (searchable), and a Publish button.

2. **Full Publish page** at `/publish`: same fields as the panel but full-screen with more space. Reached via the "Publish" sidebar nav item.

Both flows: upload images to Supabase Storage (`post-images` bucket), extract image dimensions client-side before upload, auto-generate a slug from the caption (slugify + unique suffix if collision), insert post + post_images rows, then redirect/navigate to the new post's detail page.

The location dropdown is a searchable select populated from the `locations` table. It is optional — posts without a location are valid.

A profanity filter runs on the caption server-side before insert.

## Acceptance criteria

- [ ] POST button in sidebar opens the fast-post panel (slide-in animation) without navigating away
- [ ] `/publish` renders the full-page version with identical fields
- [ ] Image upload: drag-and-drop or click-to-select, up to 10 images, preview thumbnails shown before submit
- [ ] Image dimensions extracted client-side and stored in `post_images.width` / `post_images.height`
- [ ] Caption textarea with character counter
- [ ] Location dropdown: searchable, loads from `locations` table, optional
- [ ] Slug auto-generated from caption (e.g. "Sunset at Vice Beach" → `sunset-at-vice-beach`), unique collision handled
- [ ] On submit: images uploaded to `post-images` bucket, post inserted, panel closes / redirect to `/posts/[slug]`
- [ ] New post appears at the top of the home feed immediately (optimistic or hard-navigate)
- [ ] Profanity filter rejects caption; error shown inline
- [ ] Unauthenticated users trying to access `/publish` are redirected to `/auth/login`
- [ ] Vitest: post creation inserts post + images rows; slug uniqueness; profanity filter on caption

## Blocked by

- Blocked by #5 (auth — posting requires authentication)
- Blocked by #6 (home feed — post must appear in feed after creation)

## User stories addressed

- User stories 21, 22, 23, 24, 25, 26
