# PRD: Location Explorer Map Page Enhancements

## Problem Statement

The current Location Explorer map page (`/map`) lacks critical search functionality and has a basic bottom sheet design that doesn't match the premium editorial feel of the rest of the site. Users cannot search for locations directly from the map page, and when they do want to search, there's ambiguity about whether they want to:
1. Refocus the map on a searched location, or
2. Navigate to the home feed filtered by that location

Additionally, the bottom panel doesn't provide enough context about locations (no descriptions, activity metrics, or dual-map toggle), and the map pins don't clearly indicate which location is currently focused or how popular each location is.

## Solution

Enhance the Location Explorer page with:

1. **Smart Search Bar**: Add a search bar at the top with a map/magnifier toggle that lets users choose their intent:
   - Map toggle: Search for locations and refocus the map on the selected location
   - Magnifier toggle: Search for locations and navigate to home feed with location filter
   - Non-location searches always go to home feed

2. **Card-Style Bottom Panel**: Replace the bar-style bottom sheet with a horizontal scrollable card layout:
   - First card: Location info card with name, address, live activity metric, description, "Explore More" button, and game/real-life map toggle
   - Subsequent cards: Post preview cards for that location
   - Arrow button navigation for desktop

3. **Enhanced Map Pins with Clustering**:
   - Implement pin clustering (like Apple Maps/Google Maps) to handle thousands of locations
   - Clusters show aggregated post counts
   - Individual pins show post count badges
   - Make the focused location pin larger and red for visibility
   - Size pins based on popularity using Reddit's hot ranking algorithm

4. **Database Enhancement**: Add description field to locations table for future content

## User Stories

1. As a map page visitor, I want to search for locations directly from the map page, so that I don't have to navigate away to find a specific place
2. As a user searching for a location, I want to choose whether to see it on the map or filter the feed by it, so that I have control over my navigation intent
3. As a user who searches for non-location content (posts/users), I want to be automatically taken to the home feed search results, so that I can find what I'm looking for
4. As a user typing a location name, I want to see autocomplete suggestions, so that I can quickly select the exact location I mean when multiple matches exist
5. As a map user, I want the search toggle to default to "map" mode, so that the most common use case (exploring the map) is the default behavior
6. As a user viewing a location on the map, I want to see a card with detailed information about that location, so that I understand what makes it interesting
7. As a user viewing location details, I want to see how active/popular the location is, so that I know if it's worth exploring
8. As a user viewing location details, I want to see a description of the location, so that I have context about what this place is
9. As a user on desktop, I want to scroll through post cards using arrow buttons, so that I can easily browse posts from that location
10. As a user viewing a location, I want to toggle between the game map and real-life map views, so that I can see where it exists in both contexts
11. As a user viewing a location that only exists in one map type, I want the toggle to be hidden, so that I'm not confused by unavailable options
12. As a user looking at the map, I want to see which location is currently focused with a distinctive pin, so that I can easily identify it among other pins
13. As a user browsing the map, I want to see post counts on each pin, so that I know which locations have the most content
18. As a user viewing a zoomed-out map with many locations, I want pins to cluster together, so that the map remains readable and performant
19. As a user viewing a cluster, I want to see the total post count for all locations in that cluster, so that I know how much content is in that area
20. As a user clicking on a cluster, I want the map to zoom in and break the cluster into smaller clusters or individual pins, so that I can explore specific locations
21. As a user viewing location popularity, I want it calculated using a time-decay algorithm (like Reddit's hot ranking), so that recent activity is weighted more heavily than old posts
14. As a user who clicks "Explore More" on a location, I want to see a friendly message, so that I know this feature is coming soon
15. As a user searching for a location with the magnifier toggle active, I want to land on the home feed with a visible location filter chip, so that I know I'm viewing filtered content and can clear it easily
16. As a user viewing the map, I want smooth animated transitions when the map refocuses on a searched location, so that I can follow where the map is moving
17. As a user viewing location cards, I want locations with only an address (no name) to display the address as the name, so that every location has a clear identifier

## Implementation Decisions

### Search Bar Component
- Create new `MapSearchBar` component for the map page
- Include two toggle buttons (map icon and magnifier icon) always visible in the search bar
- Default toggle state: map mode (not persistent across sessions)
- Implement autocomplete dropdown showing location suggestions as user types
- Search logic: Query locations table with ILIKE pattern match on name field
- If matches found: treat as location search, show autocomplete
- If no location matches: treat as general search, navigate to `/search?q=...`

### Search Behavior
- **Map toggle active + location selected**: Navigate to `/map?focus=[slug]&layer=[current]` with smooth pan/zoom animation to location, open bottom sheet
- **Magnifier toggle active + location selected**: Navigate to `/?location=[slug]` (home feed with location filter)
- **Non-location search**: Navigate to `/search?q=...` regardless of toggle state

### Home Feed Location Filter
- Add support for `location` query parameter on home feed page
- Display filter chip at top of feed: "Location: [Name] ×" with clear button
- Filter posts by location_slug in feed query
- Clicking × removes query param and shows full feed

### Bottom Panel Redesign
- Replace `MapBottomSheet` component with new card-based horizontal scroll layout
- First card: Location info card (360px width, fixed)
  - Location name (bold, large) or address-as-name if no name
  - Address in gray text below (hidden if address was promoted to name)
  - Live activity: Calculate using Reddit's hot ranking algorithm (time-decay based on post age, likes, and comments)
  - Description text (max 150 chars, from new DB column, hide section if null)
  - "Explore More" button: Show toast "Coming soon! 🚧" on click
  - Game/Real toggle: Hide entirely if location only has one coordinate type (check igX/igY and rlLat/rlLng)
- Subsequent cards: Post preview cards (240px width each)
- Desktop: Left/right arrow buttons overlaid on panel edges
- Mobile: Touch drag scrolling

### Map Pin Clustering
- Integrate Leaflet.markercluster plugin for pin clustering
- Cluster appearance: Circular badge showing total post count for all locations in cluster
- Cluster size/color based on aggregated post count (similar to individual pin sizing)
- Clicking cluster: Zoom in to break cluster apart (standard Leaflet.markercluster behavior)
- Individual pins within clusters: Show post count badge above pin
- Focused location pin: Never clusters, always visible at 2x size + primary red
- Cluster distance: 80px at default zoom (adjustable based on testing)

### Popularity Algorithm (Reddit Hot Ranking)
- Replace simple post count with time-decay algorithm
- Formula: `score = (ups - downs) / (age_hours + 2)^1.5`
  - `ups` = likes + (comments * 2) for the location's posts
  - `downs` = 0 (no downvotes in our system)
  - `age_hours` = hours since location's most recent post
- Calculate on-demand when location is viewed (not stored in DB)
- Use for pin sizing and "Live Activity" display
- Activity labels: "🔥 Hot" (score > 100), "⚡ Active" (score > 20), "📍 Steady" (score > 5), "💤 Quiet" (score ≤ 5)

### Database Changes
- Add `description` column to `locations` table: `TEXT` type, nullable, max 150 chars (enforced in app layer)
- Create migration: `010_add_location_description.sql`

### API/Data Layer
- Create new function in `src/lib/locations.ts`: `searchLocations(query: string, client: SupabaseClient)` - returns matching locations
- Create new function in `src/lib/locations.ts`: `calculateLocationHotScore(locationId: string, client: SupabaseClient)` - implements Reddit hot ranking algorithm
- Extend `MapLocation` interface to include `description: string | null` and `hotScore: number`
- Query for hot score calculation: Get most recent post timestamp, sum of likes, sum of comments for location's posts

### Component Architecture
- **MapSearchBar.tsx**: New component for map page search with toggle
- **MapLocationInfoCard.tsx**: New component for first card in bottom panel
- **MapBottomPanel.tsx**: New component replacing MapBottomSheet, manages horizontal scroll
- **LocationFilterChip.tsx**: New component for home feed location filter indicator
- Update **MapClient.tsx**: Integrate new search bar, handle search navigation
- Update **LeafletMap.tsx**: Integrate leaflet.markercluster, enhanced pin styling for focused location, add post count badges
- Update **page.tsx** (home feed): Add location filter support
- Install dependency: `leaflet.markercluster` and `@types/leaflet.markercluster`

## Testing Decisions

### What Makes a Good Test
- Test external behavior, not implementation details
- Test user-facing functionality and data transformations
- Avoid testing internal state or private methods
- Focus on critical paths and edge cases

### Modules to Test
1. **Location search function** (`searchLocations` in `src/lib/locations.ts`)
   - Test: Returns matching locations for partial name match
   - Test: Returns empty array when no matches
   - Test: Case-insensitive matching works correctly

2. **Hot score calculation** (`calculateLocationHotScore` in `src/lib/locations.ts`)
   - Test: Calculates correct score using Reddit formula
   - Test: Recent posts score higher than old posts with same engagement
   - Test: Returns 0 for locations with no posts
   - Test: Handles edge case of very new posts (age_hours near 0)

3. **Home feed location filter**
   - Test: Feed correctly filters posts by location_slug
   - Test: Filter chip displays correct location name
   - Test: Clearing filter shows all posts

4. **Pin clustering behavior**
   - Test: Clusters form correctly at different zoom levels
   - Test: Focused pin never gets clustered
   - Test: Cluster post counts aggregate correctly

### Prior Art
- Existing search tests in `src/lib/search.ts` for pattern matching
- Feed filtering logic similar to existing RPC function tests
- Component interaction tests similar to existing PostCard tests

## Out of Scope

The following items are explicitly out of scope for this PRD:

1. **Realtime location activity updates**: Activity metrics are calculated on page load, not updated in realtime
2. **Location descriptions content**: The description field will be added to the database but will remain empty initially. Content population is a separate content creation task
3. **Custom map styles**: Beyond game/real toggle and clustering, no custom tile layers or map themes
4. **Location creation/editing UI**: Admin interface for managing locations is separate
5. **Mobile-specific bottom sheet gestures**: Drag-to-dismiss, snap points, etc. Basic scroll works but advanced gestures deferred
6. **Search history/suggestions**: No saved searches or trending locations
7. **Multi-location selection**: Users can only focus on one location at a time
8. **Location sharing**: Social sharing buttons for specific locations
9. **Persistent toggle preference**: Map/magnifier toggle always resets to map mode (not saved to user preferences)

## Further Notes

### Design Alignment
This enhancement aligns with the stitch design reference at `stitch_gta6/location_explorer_fully_unified_layout/` while adapting it for the actual implementation needs discovered during the interview process.

### Key Design Decisions from Interview
- **Toggle visibility**: Always visible (not conditional on typing) for clarity
- **Placeholder text**: Simple "Search..." to keep it clean
- **Bottom panel layout**: Info card as first card in horizontal scroll (not fixed header)
- **Scroll controls**: Arrow buttons for desktop (not drag-only)
- **Address handling**: Promote address to name position when no name exists
- **Activity metric**: Reddit hot ranking algorithm with time decay (not simple post count)
- **Description column**: Add to DB now (even though empty initially)
- **Explore button**: Toast notification "Coming soon! 🚧"
- **Map toggle**: Hide entirely when only one coordinate type exists
- **Focused pin**: Larger + red color (not pulsing animation)
- **Pin badges**: Positioned above pins (not overlaid)
- **Pin clustering**: Leaflet.markercluster plugin (like Apple/Google Maps) to handle thousands of pins
- **Search logic**: Name match with autocomplete recommendations
- **Multiple matches**: Show autocomplete picker for user selection
- **Map refocus**: Smooth pan/zoom animation (not instant jump)

### Technical Considerations
- Autocomplete dropdown should debounce search queries (350ms like existing search)
- Hot score calculation should be memoized to avoid repeated DB queries
- Post count badges on pins should use CSS transforms for positioning to avoid layout shifts
- Cluster styling should match pin styling (size/color based on aggregated post count)
- Focused pin must be excluded from clustering (use separate marker layer)
- Arrow buttons should disable when at scroll boundaries (start/end of card list)
- Toast notifications should auto-dismiss after 3 seconds
- Leaflet.markercluster CSS must be imported alongside leaflet.css

### Future Enhancements (Post-MVP)
- Persistent user preference for map/magnifier toggle
- Realtime activity updates via Supabase Realtime
- Location description content population
- Custom cluster icons with better visual hierarchy
- Location sharing functionality
- Heatmap overlay for activity density

