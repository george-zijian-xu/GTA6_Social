# Design System Specification: Editorial Social

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

Moving away from the cluttered, high-velocity aesthetic of traditional social media, this system treats user content as a gallery exhibition. It prioritizes white space, intentional asymmetry, and a "content-first" architecture. By leveraging high-contrast typography and tonal depth over rigid lines, we create a high-fidelity environment that feels less like a database and more like a premium digital lifestyle magazine.

The experience is defined by a masonry-grid that breathes, avoiding the "boxed-in" feeling of standard social feeds. Elements should overlap slightly where appropriate, and transitions should feel fluid and organic.

---

## 2. Colors
Our palette is rooted in professional neutrality, allowing the signature crimson accent to guide the user’s eye to primary actions.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or containment. Structural boundaries must be defined solely through background color shifts. Use `surface-container-low` for secondary sections sitting on a `surface` background. 

### Surface Hierarchy & Nesting
Depth is achieved through a "Layered Paper" philosophy. 
- **Base Layer:** `surface` (#f9f9f9).
- **Secondary Sections:** `surface-container-low` (#f3f3f3) for sidebars or secondary feeds.
- **Floating Cards:** `surface-container-lowest` (#ffffff) to create a natural "lift" against a grey backdrop.
- **Interactive Elements:** `surface-container-high` (#e8e8e8) for hover states.

### The Glass & Gradient Rule
To ensure the "premium" feel:
- **Navigation/Search:** Use `surface_container_lowest` with 80% opacity and a `24px` backdrop-blur for floating headers.
- **Primary CTAs:** Use a linear gradient from `primary` (#bb0028) to `primary_container` (#e80535) at a 135-degree angle to provide visual depth.

---

## 3. Typography
We utilize **Inter** across all levels to maintain an English-language editorial authority that is both modern and highly readable.

- **Display (LG/MD):** Used for large profile names or hero announcements. Letter-spacing should be set to `-0.02em` to feel tighter and more "custom."
- **Headline & Title:** These are the anchors. `title-lg` is used for post captions within the masonry feed to ensure the user's "voice" carries weight.
- **Body:** Standardized at `body-md` (#1a1c1c) for comments and descriptions, ensuring a high-contrast ratio against white surfaces.
- **Labels:** Used for metadata (timestamps, location tags). These utilize `secondary` (#5f5e5e) to recede visually, keeping the focus on the content.

---

## 4. Elevation & Depth
Elevation is expressed through **Tonal Layering** rather than structural shadows.

- **The Layering Principle:** Instead of a drop shadow, a card (`surface-container-lowest`) gains its prominence by being placed on a `surface-container-low` background. 
- **Ambient Shadows:** For high-priority modals or profile preview cards, use an "Ambient Lift":
  - `box-shadow: 0 12px 32px -4px rgba(26, 28, 28, 0.06);`
- **The "Ghost Border" Fallback:** If accessibility requires a container edge, use `outline_variant` (#e8bcbb) at **15% opacity**. Never use a 100% opaque border.
- **Glassmorphism:** Navigation sidebars should feel integrated into the background. Use a subtle gradient from `surface` to `surface_variant` with 70% transparency to allow content to bleed through softly as the user scrolls.

---

## 5. Components

### Masonry Cards
- **Forbid:** Border lines or explicit dividers.
- **Structure:** `xl` (1.5rem) rounded corners on images. Content padding follows the `4` (1rem) spacing scale.
- **Interaction:** On hover, the card should scale slightly (1.02x) and the background shift to `surface_container_highest`.

### Navigation Sidebar
- **Layout:** Left-aligned. Icons use `secondary` (#5f5e5e) when inactive and `primary` (#bb0028) when active.
- **Labels:** Use `title-sm` for nav items. Vertical spacing between items is `6` (1.5rem).

### Primary Buttons
- **Style:** Fully rounded (`9999px`). 
- **Background:** Primary-to-Container gradient. 
- **Typography:** `label-md` in `on_primary` (#ffffff), uppercase with `0.05em` tracking for a sophisticated, button-like feel.

### Profile Preview Cards (Hover State)
- **Design:** Floating `surface-container-lowest` card with a `xl` corner radius. 
- **Details:** Features a mini-masonry grid of the user's last 3 posts. No lines between images; use `1` (0.25rem) gaps.

### Search Bar
- **Surface:** `surface_container_low`.
- **Shape:** `full` (pill-shaped).
- **Text:** `body-md` with `on_surface_variant` placeholder text.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical spacing (e.g., more top padding than bottom) in header sections to create a "designed" editorial look.
- **Do** use the `primary` accent color sparingly—only for conversion points like "Follow" buttons or active notification dots.
- **Do** allow images in the masonry grid to have varying aspect ratios to maintain the "Xiaohongshu" vibe.

### Don't
- **Don't** use 1px black or grey borders. Use background tonal shifts.
- **Don't** use standard Material Design drop shadows. Only use high-diffusion, low-opacity ambient shadows.
- **Don't** use "GTA" high-saturation yellows or oranges. Stick to the professional neutral and signature crimson palette provided.
- **Don't** use dividers inside lists. Use `spacing-5` (1.25rem) gaps to define list items.