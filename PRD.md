# PRD: Leonida Social — Unofficial GTA6 Fan Community

## Problem Statement

GTA 6 has no dedicated social platform where fans can share content, guides, and experiences from the perspective of in-game characters or Florida residents living in the fictional Leonida world. Existing platforms (Reddit, Twitter/X, Discord) are generic and do not provide the immersive, location-aware, roleplay-first experience that the GTA 6 community wants. Xiaohongshu (RedNote) pioneered a visual-first, card-feed social model that is ideal for this type of content — but no English-language fan site has adopted this format for GTA.

Leonida Social is a non-commercial parody fan site that fills this gap: a Xiaohongshu-inspired social feed where users post as GTA 6 NPCs or Florida residents, pin their content to fictional Leonida locations on an interactive map, and discover content from the broader community.

---

## Solution

A web application at grandtheftauto6.com (and .net) — clearly branded as an unofficial fan parody, non-commercial — built with Next.js 15 (App Router) and Supabase. The site delivers:

- A ranked, infinite-scroll masonry feed of user posts (images + captions)
- Per-post detail pages with a media gallery, interactive GTA world map pin, flat comments with like/reply, and social actions
- A full-screen Location Explorer showing post activity as pins on the Leonida map
- User profiles with follow/follower social graph
- A notifications centre (comments, likes, follows)
- Full SEO optimisation on every page so individual posts can rank on Google
- Responsive design: desktop sidebar layout, mobile bottom-nav layout

---

## User Stories

### Unauthenticated Visitor

1. As a visitor, I want to browse the home feed without logging in, so that I can discover the community before committing to an account.
2. As a visitor, I want to see a ranked masonry grid of posts with images, captions, like counts, and usernames, so that I can quickly assess whether the content interests me.
3. As a visitor, I want to click any post card to open the full post detail page, so that I can read the full caption, view all images, and read comments.
4. As a visitor, I want to click the Location Explorer to open the interactive Leonida map, so that I can browse content by in-game location.
5. As a visitor, I want to click a location pin on the map to filter the home feed by that location, so that I can see all posts from a specific Leonida area.
6. As a visitor, I want to click a username or avatar anywhere on the site to open that user's profile, so that I can browse their posts.
7. As a visitor, I want to hover over a username or avatar to see a profile preview card (avatar, username, follower count, recent posts), so that I can quickly assess a user without leaving the page.
8. As a visitor, I want the site to load fast and work on my phone browser, so that I can browse comfortably on any device.
9. As a visitor using Google, I want to find individual posts on the search results page, so that guides and content from this site reach me organically.
10. As a visitor, I want to see post-specific meta titles, descriptions, and preview images when a link is shared on social media or messaging apps, so that the content looks professional.
11. As a visitor, I want to toggle between light and dark mode, so that I can read comfortably in any lighting condition.
12. As a visitor, I want to access the About page to understand what Leonida Social is, so that I know this is an unofficial fan site and not affiliated with Rockstar Games.
13. As a visitor, I want to access the Privacy Policy page, so that I understand how my data is handled before signing up.
14. As a visitor, I want to access the DMCA Takedown page, so that I can request removal of content that infringes on my copyright.
15. As a visitor, I want to search for posts or users by keyword, so that I can find specific content without scrolling.

### Registered User — Authentication

16. As a new user, I want to sign up with my email and password, so that I can create an account without needing a social login.
17. As a new user, I want to sign up with my Google account in one click, so that I don't have to manage a separate password.
18. As a new user, I want to sign up with my phone number via SMS verification, so that I can join even if I don't have access to Google (e.g. users in China).
19. As a returning user, I want to log in with any of the above methods, so that I can access my account reliably.
20. As a logged-in user, I want to log out from the sidebar, so that I can secure my account on shared devices.

### Registered User — Posting

21. As a logged-in user, I want to quickly publish a post using the fast-post panel (triggered by the big POST button) without leaving the home feed, so that I can share content with minimal friction.
22. As a logged-in user, I want to publish a post from the full dedicated Publish page (via the Publish nav item), so that I can craft my post with more care.
23. As a logged-in user, I want to upload one or more images to my post, so that my content is visual and engaging.
24. As a logged-in user, I want to write a caption for my post, so that I can add context and narrative to my images.
25. As a logged-in user, I want to optionally tag my post to a Leonida location from a searchable dropdown, so that my post appears on the Location Explorer map.
26. As a logged-in user, I want my post to appear in the feed immediately after publishing, so that I get instant feedback that it was successful.

### Registered User — Social Interactions

27. As a logged-in user, I want to like a post, so that I can show appreciation for content I enjoy.
28. As a logged-in user, I want to unlike a post I previously liked, so that I can change my mind.
29. As a logged-in user, I want to comment on a post, so that I can engage with the author and other readers.
30. As a logged-in user, I want to reply to an existing comment with an @mention, so that I can have flat threaded conversations.
31. As a logged-in user, I want to like a comment, so that I can appreciate good comments without posting a reply.
32. As a logged-in user, I want to follow another user, so that their posts receive a score boost in my feed.
33. As a logged-in user, I want to unfollow a user, so that I can manage who influences my feed.
34. As a logged-in user, I want to share a post via the native share sheet or copy-link, so that I can spread content outside the platform.
35. As a logged-in user, I want to report a post or comment, so that I can flag content that violates community standards.

### Registered User — Profile

36. As a logged-in user, I want to view my own profile page showing all my posts, follower count, following count, and total likes, so that I can see how I am perceived by the community.
37. As a logged-in user, I want to edit my profile (avatar, username, bio), so that I can represent my GTA character or roleplay persona.
38. As a logged-in user, I want to view another user's profile and their post feed, so that I can decide whether to follow them.
39. As a logged-in user, I want to see who follows me and who I follow, so that I can manage my social connections.

### Registered User — Notifications

40. As a logged-in user, I want to see an unread badge on the Notifications nav item when I have new activity, so that I know to check my notifications without actively looking.
41. As a logged-in user, I want to see a list of comments on my posts under the Comments tab, so that I can read and respond to feedback.
42. As a logged-in user, I want to see a list of likes on my posts under the Likes tab, so that I know which content is resonating.
43. As a logged-in user, I want to see a list of new followers under the New Follows tab, so that I can discover and follow back people who enjoy my content.
44. As a logged-in user, I want to click a notification item to go directly to the relevant post or profile, so that I can respond efficiently.

### Location Explorer

45. As any user, I want to open the full Location Explorer by clicking the mini map module on a post detail page, so that I can browse the full interactive Leonida map.
46. As any user, I want to see animated activity pins on the map showing areas with high post volume, so that I can identify popular in-game locations.
47. As any user, I want to click a pin to see a preview of recent posts from that location, so that I can sample the content before committing to a filter.
48. As any user, I want to click "Filter Home Feed" to navigate back to the home feed filtered by a selected location, so that I can explore all posts from that place.
49. As any user, I want to zoom and pan the Leonida map, so that I can explore specific areas precisely.
50. As any user, I want to see the mini map module on a post detail page showing where that post was made in the Leonida world, so that I get geographic context.
51. As any user, I want to click the mini map on a post detail page to open the full Location Explorer centred on that pin, so that I can explore nearby posts.

### Search

52. As any user, I want to search posts by keyword and have results shown as a feed of matching posts, so that I can find specific content.
53. As any user, I want to search for a user by username and navigate to their profile, so that I can find specific community members.
54. As any user, I want search to work against post captions and usernames using full-text search, so that results are relevant.

### Admin / Moderation

55. As an admin, I want to view a queue of reported posts and comments, so that I can take moderation action.
56. As an admin, I want to delete any post or comment, so that I can remove content that violates community guidelines.
57. As an admin, I want to ban a user account, so that I can prevent repeat offenders from creating further content.
58. As an admin, I want to promote another user to co-moderator, so that I can delegate moderation as the community grows.
59. As any user, posts and comments should be lightly filtered for the most egregious profanity, so that the site doesn't become hostile, while acknowledging the adult-themed GTA roleplay context.

---

## Implementation Decisions

### Frontend

- **Framework**: Next.js 15 with App Router. Server Components render initial page HTML for SEO and first-paint performance; Client Components handle infinite scroll hydration, interactive map, and real-time UI state.
- **Styling**: Tailwind CSS with a custom design token configuration matching the design system. No 1px borders — tonal background shifts only. Font: Inter throughout.
- **Design system**: Primary colour `#ff2442`. Icons: Material Symbols Outlined exclusively across all screens. Border radius default `0.75rem`. Card hover `scale(1.02)`. Surface hierarchy: `#fdfdfd` (page) → `#f3f3f3` (secondary sections) → `#ffffff` (cards).
- **Feed layout**: True variable-height masonry using `react-masonry-css`. Cards show image (variable aspect ratio), caption, like count, username, avatar.
- **Responsive**: Desktop uses a left sidebar (`256px`). Mobile (`< 768px`) hides the sidebar and shows a bottom navigation bar with 4 icons: Discover, Publish, Profile, Notifications.
- **Map**: Leaflet.js with a custom GTA 6 map tile layer. Pins are rendered as a Leaflet layer. `react-leaflet` used for Next.js integration. Map is loaded client-side only (dynamic import, no SSR) to avoid window reference errors.
- **Infinite scroll**: Intersection Observer API triggers the next page fetch when the user reaches the bottom of the feed. Supabase cursor-based pagination.
- **Profile hover card**: CSS group-hover pattern. Rendered client-side. Shows avatar, username, follower count, follow button, and a 3-image mini grid of recent posts.

### Backend / Database (Supabase)

**Core tables:**

- `profiles` — extends Supabase auth.users. Fields: `id`, `username` (unique, slug-safe), `display_name`, `avatar_url`, `bio`, `website`, `is_admin`, `subscription_tier`, `created_at`
- `posts` — Fields: `id`, `author_id`, `caption`, `slug` (auto-generated from caption, unique), `location_id` (nullable FK), `hot_score` (generated column), `like_count`, `comment_count`, `created_at`
- `post_images` — Fields: `id`, `post_id`, `storage_path`, `alt_text`, `display_order`, `width`, `height`
- `locations` — Fields: `id`, `name`, `slug`, `category`, `ig_x`, `ig_y` (in-game coordinates), `rl_lat`, `rl_lng` (real-life Florida coordinates), `description`, `post_count`. Schema accommodates full gtadb.org landmark dataset; data import is a separate migration script.
- `follows` — Fields: `follower_id`, `following_id`, `created_at` (composite PK)
- `likes` — Fields: `user_id`, `post_id`, `created_at` (composite PK)
- `comments` — Fields: `id`, `post_id`, `author_id`, `body`, `like_count`, `parent_comment_id` (nullable, for @mention replies — flat display), `created_at`
- `comment_likes` — Fields: `user_id`, `comment_id`, `created_at` (composite PK)
- `notifications` — Fields: `id`, `type` (enum: `like`, `comment`, `follow`), `actor_id`, `target_user_id`, `post_id` (nullable), `comment_id` (nullable), `read_at` (nullable), `created_at`
- `reports` — Fields: `id`, `reporter_id`, `post_id` (nullable), `comment_id` (nullable), `reason`, `status` (enum: `pending`, `reviewed`, `dismissed`), `created_at`

**Feed ranking — hot score:**

```
hot_score = (like_count + comment_count * 2) / POWER(EXTRACT(EPOCH FROM (now() - created_at)) / 3600 + 2, 1.5)
```

Implemented as a Postgres `GENERATED ALWAYS AS` column that recomputes on every row update. Follow boost (×1.3) applied at query time in the API route for authenticated users.

**Row-Level Security:** All tables have RLS enabled. Public read on posts/profiles/comments/locations. Write restricted to authenticated owner. Admin bypass via `is_admin` check.

**Full-text search:** Postgres `tsvector` column on `posts.caption` and `profiles.username`. Updated via trigger on insert/update.

### Authentication

Supabase Auth with three providers: email+password, Google OAuth, phone/SMS (Twilio). On first sign-in, a `profiles` row is created via a Supabase database trigger.

### Storage

Supabase Storage bucket `post-images` (public read). Images uploaded via signed upload URLs. Dimensions extracted client-side before upload and stored in `post_images` for structured data. Avatar images stored in `avatars` bucket.

### SEO

- `generateMetadata` on every dynamic route (`/posts/[slug]`, `/users/[username]`, `/locations/[slug]`)
- Post pages: title = first 60 chars of caption + " | Leonida Social", description = caption truncated to 155 chars, OG image = first post image
- Structured data: `SocialMediaPosting` JSON-LD on post pages, `Person` JSON-LD on profile pages, `Place` JSON-LD on location pages
- `sitemap.xml` dynamically generated, includes all public posts, user profiles, and location pages
- `robots.txt` allows all crawlers on public routes, disallows `/api`, `/admin`, `/auth`
- All images rendered with Next.js `<Image>` component (auto srcset, lazy loading, AVIF/WebP)
- `alt` attributes auto-generated from post caption; stored in `post_images.alt_text`
- Canonical `<link>` on every page
- Internal links: post cards link to post detail, user profile, and location page

### Pages / Routes

| Route | Type | Notes |
|---|---|---|
| `/` | SSR | Home feed, first page server-rendered |
| `/posts/[slug]` | SSR | Post detail with generateMetadata |
| `/users/[username]` | SSR | User profile with generateMetadata |
| `/locations/[slug]` | ISR | Location feed page, revalidates every hour |
| `/map` | Client | Location Explorer, Leaflet loaded client-side only |
| `/publish` | Client (auth-gated) | Full Publish page |
| `/notifications` | Client (auth-gated) | Notifications centre |
| `/admin` | Client (admin-gated) | Report queue, ban, delete |
| `/about` | Static | About page, fan/parody disclaimer |
| `/privacy` | Static | Privacy Policy (legal copy TBD) |
| `/dmca` | Static | DMCA Takedown (legal copy TBD) |
| `/auth/login` | Client | Login/signup page |

### Sidebar Navigation

Desktop: Discover, Publish, Profile, Notifications (with unread badge) + POST button + About, Privacy, Dark Mode, Logout at bottom.
Mobile: bottom bar with Discover, Publish, Profile, Notifications icons only.

### Moderation

Light profanity filter applied server-side on `comment.body` and `post.caption` at insert time using a blocklist. Reported content flows to the `/admin` queue. Admin can delete posts/comments and set `profiles.banned_at`. Banned users' auth sessions invalidated via Supabase Admin API.

---

## Testing Decisions

**Philosophy:** Test external behaviour only — what a user or API caller observes, not internal implementation details. Tests should remain valid through refactors.

**Modules to test:**

- **Feed ranking query** — given a set of posts with known ages and engagement, assert that the hot_score ordering matches expected rank. Test with and without follow boost.
- **Auth flows** — sign-up with email, Google, phone; login; logout; session persistence.
- **Post creation** — upload images, write caption, select location, submit. Assert post appears in feed.
- **Like / unlike toggle** — assert like count increments and decrements. Assert duplicate like is idempotent.
- **Comment creation and flat reply** — assert comment appears under correct post. Assert @mention reply is associated with parent.
- **Follow / unfollow** — assert follower count updates. Assert feed receives follow boost for followed users.
- **Notifications** — assert that liking a post creates a `like` notification for the post author. Assert comment creates a `comment` notification. Assert follow creates a `follow` notification.
- **Report flow** — assert report creates a `pending` row in reports table visible to admin.
- **Search** — assert full-text search on captions returns relevant posts. Assert username search returns correct profile.
- **SEO metadata** — assert `generateMetadata` returns correct title/description/OG image for a known post slug.
- **Sitemap** — assert sitemap.xml includes all public post slugs, user slugs, and location slugs.
- **RLS** — assert unauthenticated users cannot write posts/comments/likes. Assert users cannot delete other users' posts. Assert admin can delete any post.

**Tools:** Vitest for unit/integration tests, Playwright for end-to-end browser tests.

---

## Out of Scope

- Video upload and playback (deferred to v2 — Cloudflare Stream integration)
- Realtime push notifications (deferred to v2 — Supabase Realtime WebSockets)
- AI image generation subscription feature (deferred to v2+)
- WeChat OAuth (requires Chinese business license — skipped)
- Mini map picker in Publish flow (deferred to v3)
- Real-life ↔ game location dual picker (deferred to v2)
- AI-assisted content moderation (deferred to v2+)
- Native mobile app / React Native (deferred to post-MVP)
- Legal copy for About, Privacy, and DMCA pages (user will engage a legal professional)
- Data import of gtadb.org landmarks (schema is ready; bulk import script is a separate task)
- Seed content creation (user will seed manually post-launch)
- Discord integration for community co-mod recruitment
- Monetisation / subscription billing (payment infrastructure not included in MVP)

---

## Further Notes

- **Legal**: grandtheftauto6.com / .net are registered with full awareness of trademark risk. The site is framed throughout as a non-commercial parody fan page. DMCA page is required from day one. Legal copy for About, Privacy, and DMCA should be drafted by a legal professional before public launch.
- **Map tile source**: The GTA 6 map tile layer will reference community-sourced tile data (e.g. from the stateofleonida.net / gtadb.org community). Any tile data used must be compatible with open-source licensing. Attribution to source communities should be included in the About page.
- **SEO is critical**: This is a new site with no domain authority. Crawl budget is limited. Every public page must be server-rendered with complete metadata from day one. Submit sitemap to Google Search Console immediately on launch with the first batch of real posts.
- **60% mobile traffic expected**: The responsive bottom-nav layout is not optional — it must ship with MVP and be tested on real devices.
- **Supabase scaling**: Free tier supports ~50k MAU. At projected 1M page views, upgrade to Supabase Pro (~$25/month). No architectural changes required.
- **Vercel deployment**: User has Vercel MCP configured. Request Vercel MCP access when ready to deploy.
- **Design reference files**: Stitch HTML exports are in `/stitch_gta6/`. Use as visual reference only — they use CDN Tailwind and placeholder images. The actual build uses a local Tailwind + Next.js setup with the unified design system described above.

---

## Performance Requirements

### Philosophy
Performance is a feature. A slow feed kills engagement before content has a chance to. All targets apply to **mixed device / 4G connection** (the median user) and are measured via **Lighthouse CI** and **Google Core Web Vitals** in Search Console. Any regression that pushes a score below these thresholds must be fixed before merging.

---

### Core Web Vitals Targets (Google "Good" thresholds)

| Metric | Target | What it measures |
|--------|--------|-----------------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | Time until the main image or text block is visible |
| **INP** (Interaction to Next Paint) | ≤ 200ms | Responsiveness to every tap and click |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | Visual stability — no layout jumps as content loads |
| **TTFB** (Time to First Byte) | ≤ 800ms | Server response speed (Vercel Edge + Supabase) |

---

### Lighthouse Score Targets

| Category | Mobile | Desktop |
|----------|--------|---------|
| Performance | ≥ 80 | ≥ 90 |
| Accessibility | ≥ 90 | ≥ 90 |
| SEO | ≥ 90 | ≥ 90 |
| Best Practices | ≥ 90 | ≥ 90 |

---

### Page-Level First Meaningful Paint Targets

| Page | Target | Notes |
|------|--------|-------|
| Home feed | ≤ 1.5s | First 20 posts SSR, masonry hydrates client-side |
| Post detail | ≤ 1.5s | SSR with image gallery and comments |
| User profile | ≤ 1.5s | SSR with post grid |
| Auth (login/signup) | ≤ 1.0s | Effectively static |
| Search | ≤ 1.5s | SSR skeleton, results stream in |
| Location Explorer | ≤ 2.0s | Leaflet adds JS overhead |

---

### API & Database Latency Targets (p95)

| Operation | Target | Notes |
|-----------|--------|-------|
| `get_feed` RPC | ≤ 200ms | Ranked feed with follow boost + viewer_liked join |
| Post detail fetch | ≤ 150ms | Post + images + author + location |
| Like / unlike | ≤ 150ms | Masked entirely by optimistic UI |
| Comment submit | ≤ 300ms | |
| Follow / unfollow | ≤ 150ms | |
| Full-text search | ≤ 300ms | Postgres tsvector on posts + profiles |
| Image upload | ≤ 5s | Up to 8MB file to Supabase Storage |
| Notification fetch | ≤ 200ms | Per-tab query |

---

### Image Loading Rules

- **Format**: Next.js `<Image>` serves WebP/AVIF automatically — no manual conversion needed.
- **Max upload size**: 8MB per image. The publish form must enforce this client-side.
- **No layout shift**: Every `<Image>` must declare explicit `width`/`height` or use `fill` with a fixed-size container. CLS from images must be 0.
- **Priority loading**: First 3 cards in the home feed use `priority` prop to avoid LCP penalty. All other images are lazy-loaded (Next.js default).
- **Responsive sizes**: Feed card images use `sizes` prop matching the masonry column widths so the browser downloads the right resolution.

---

### Interaction Feel

| Interaction | Expected feel | Implementation |
|-------------|--------------|----------------|
| Like / unlike | Instant | Optimistic UI — state updates before DB confirms |
| Follow / unfollow | Instant | Optimistic UI |
| Comment submit | < 300ms perceived | Optimistic append to list |
| Page navigation | < 500ms perceived | Next.js link prefetch on hover |
| Infinite scroll load | ≤ 500ms | Spinner visible; sentinel fires 200px before bottom |
| Search input | Debounced 300ms | No request on every keystroke |

---

### Measurement & Monitoring

| Tool | How it's used |
|------|--------------|
| **Lighthouse CI** | Run manually (or in CI) against home, post detail, and profile routes before each release |
| **Google Search Console** | Monitor Core Web Vitals field data for real users post-launch; aim for ≥ 75% of URLs in "Good" |
| **Vercel Speed Insights** | Continuous real-user monitoring on production; surfaced in Vercel dashboard |
| **Supabase Query Advisor** | Review slow queries (> 100ms) in the Supabase dashboard after each schema or RPC change |

---

### Out of Scope (Performance)

- **CDN for Supabase Storage**: Supabase public buckets are served via CDN by default. Custom CDN configuration is not required at MVP scale.
- **Edge caching of feed**: The home feed is dynamic (personalised by viewer). Full-page caching is not viable. Per-query DB caching (Redis/pgBouncer) is a v2 concern.
- **Bundle size budgeting**: No hard JS bundle size limit at MVP, but Leaflet (map) must remain lazy-loaded and not imported on non-map pages.
- **Synthetic monitoring / alerting**: Automated performance regression alerts (e.g. Datadog) are post-launch once traffic justifies the cost.
