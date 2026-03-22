## Parent PRD

#1

## What to build

Add the full SEO layer across all public-facing dynamic routes. This issue is intentionally sequenced after the core features are live so that real content exists to validate metadata. Every dynamic route gets `generateMetadata`, structured data (JSON-LD), and canonical links. Static infrastructure (`sitemap.xml`, `robots.txt`) is also added here.

## Acceptance criteria

- [ ] `generateMetadata` on `/posts/[slug]`: title = first 60 chars of caption + " | Leonida Social", description = caption truncated to 155 chars, OG image = first post image URL, canonical = `https://grandtheftauto6.com/posts/[slug]`
- [ ] `generateMetadata` on `/users/[username]`: title = "[Display Name] (@[username]) | Leonida Social", description = bio or fallback, canonical = profile URL
- [ ] `generateMetadata` on `/locations/[slug]` (ISR): title = "Posts from [Location Name] | Leonida Social", canonical = location URL
- [ ] `generateMetadata` on `/` home feed: static title + description
- [ ] JSON-LD structured data: `SocialMediaPosting` on post pages, `Person` on profile pages, `Place` on location pages
- [ ] All images rendered with `next/image`; `alt` text = `post_images.alt_text` (auto-populated from caption on insert if empty)
- [ ] `/sitemap.xml` dynamically generated: includes all public post slugs, user slugs, and location slugs
- [ ] `/robots.txt`: allow all on public routes, disallow `/api`, `/admin`, `/auth`
- [ ] Canonical `<link>` present on every page (including home feed and search)
- [ ] OG / Twitter card meta tags on all pages
- [ ] Verify with Google's Rich Results Test on at least one post page

## Blocked by

- Blocked by #6 (home feed)
- Blocked by #7 (post detail)
- Blocked by #11 (user profile)
- Blocked by #13 (location explorer — location pages needed for sitemap)

## User stories addressed

- User stories 9, 10
