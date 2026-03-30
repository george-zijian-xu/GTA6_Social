# PRD: Location Explorer Map Page Enhancements

## Status
Phase 1 (Search + Bottom Panel) ✅ COMPLETED
Phase 2 (Pin System Enhancement) 🚧 IN PROGRESS

## Problem Statement

The current Location Explorer map page (`/map`) has implemented search functionality and card-based bottom panel, but the pin system needs significant enhancement. Current pin issues:

1. **Poor Clickability**: Small grey dots are difficult to click; users often mis-click on the map instead. The clickable area needs to be larger than the visual size.

2. **No Highlight System**: When users focus on a location (via search, mini-map navigation, or direct click), there's no visual differentiation to identify the focused pin among all others.

3. **No Information Display**: Pins don't show post counts, making it impossible to identify popular locations at a glance. The backend popularity algorithm (hot_score) exists but isn't reflected in pin design.

4. **No Smart Clustering**: With thousands of locations, the map becomes cluttered at zoomed-out views. Need intelligent visibility management based on zoom level and popularity.

## Solution

### Phase 2: Enhanced Pin System (Current Focus)

Redesign the map pin system with two distinct pin types and intelligent visibility management:

1. **Two Pin Types**:
   - **Grey Dot Pins**: For locations with 0 posts (unchanged from current design)
   - **Rounded Rectangle Pins**: For locations with posts, displaying post count with a small triangular tip at bottom

2. **Three Pin States**:
   - **Regular Pins**: White background, grey text, shows post count
   - **Popular Pins**: White background with light pink border (#ff244220), shows post count (determined by backend hot_score algorithm)
   - **Highlighted/Focused Pins**: Bright red (#ff2442) background, white text, shows post count (overrides all other states)

3. **Enhanced Clickability**: All pins have larger clickable areas than their visual size to prevent mis-clicks

4. **Dynamic Focus System**:
   - Focus changes based on user interaction: search selection, mini-map navigation, direct pin click
   - URL parameter `?focus=slug` reflects current focus but doesn't lock it
   - Bottom panel cards respond to focused location

5. **Smart Visibility Management** (instead of traditional clustering):
   - At zoomed-out views: Hide less popular pins, show only very popular locations + highlighted location
   - As user zooms in: Gradually reveal more pins based on popularity threshold
   - Highlighted pin always visible at any zoom level
   - Auto-zoom when user clicks a pin to focus it

## User Stories

### Phase 1 (Completed)
1. ✅ As a map page visitor, I want to search for locations directly from the map page
2. ✅ As a user searching for a location, I want to choose whether to see it on the map or filter the feed by it
3. ✅ As a user viewing a location on the map, I want to see a card with detailed information about that location
4. ✅ As a user on desktop, I want to scroll through post cards using arrow buttons
5. ✅ As a user viewing the map, I want smooth animated transitions when the map refocuses

### Phase 2 (Pin System Enhancement)
6. As a user clicking on small pins, I want a larger clickable area than the visual size, so that I don't accidentally click the map instead
7. As a user who searched for a location, I want to see it highlighted with a distinctive red pin, so that I can easily identify it among all other pins
8. As a user who clicked on a pin, I want it to become the highlighted pin and the map to auto-zoom to it, so that I can focus on that location
9. As a user who navigated from a mini-map, I want the corresponding location to be highlighted on the full map, so that I maintain context
10. As a user browsing the map, I want to see post counts displayed on pins (except zero-post pins), so that I know which locations have content
11. As a user viewing pins, I want popular locations to have a distinctive pink border, so that I can identify high-engagement areas at a glance
12. As a user viewing a highlighted pin, I want it to always show in red regardless of popularity, so that my current focus is always clear
13. As a user viewing a zoomed-out map, I want less popular pins to be hidden, so that the map remains readable and I can focus on major locations
14. As a user zooming into the map, I want more pins to gradually appear based on popularity, so that I discover locations as I explore
15. As a user viewing any zoom level, I want the highlighted pin to always be visible, so that I never lose track of my focused location
16. As a user viewing locations with zero posts, I want them shown as small grey dots, so that they don't clutter the map but are still discoverable

## Implementation Decisions

### Pin Visual Design

**Grey Dot Pins (0 posts)**:
- Size: 6px diameter circle
- Color: #9ca3af (grey-400)
- Clickable area: 16px diameter (invisible padding)
- No label or count display
- Can be highlighted (turns red when focused)

**Rounded Rectangle Pins (1+ posts)**:
- Shape: Rounded rectangle with small triangular tip at bottom (like Stitch design)
- Background colors:
  - Regular: white (#ffffff)
  - Popular: white with 2px light pink border (border: #ff244240)
  - Highlighted: bright red (#ff2442)
- Text: Post count + "posts" label
  - Regular/Popular: grey text (#374151)
  - Highlighted: white text (#ffffff)
- Font size: 9-10px, bold
- Padding: 6px horizontal, 4px vertical
- Border radius: 6px
- Tip: 4px triangle pointing down
- Clickable area: Entire pin + 4px padding around edges

### Pin State Logic

```
if (location.slug === focusedSlug) {
  return HIGHLIGHTED_PIN; // Always red, overrides everything
}
if (location.postCount === 0) {
  return GREY_DOT_PIN;
}
if (location.hotScore >= POPULAR_THRESHOLD) {
  return POPULAR_PIN; // White with pink border
}
return REGULAR_PIN; // White, no border
```

Popular threshold: `hotScore >= 50` (configurable constant)

### Focus Management System

**Focus Sources** (in order of priority):
1. User clicks a pin directly → Set that location as focused, auto-zoom to it
2. User searches and selects a location (map toggle) → Set as focused, smooth pan/zoom
3. User navigates from mini-map → URL param `?focus=slug` sets initial focus
4. No focus → Show map at default zoom, no highlighted pin

**Focus Behavior**:
- Focus is dynamic and changes with user interaction (not locked to URL param)
- When focus changes: Update URL param, update bottom panel, re-render pins
- Clicking map background (not a pin) → Clear focus, zoom out to default view
- Auto-zoom levels:
  - Game map: Zoom to level 7 (close-up)
  - Real map: Zoom to level 14 (street level)

### Smart Visibility Management

Simple zoom-based filtering to prevent clutter at zoomed-out views:

**Zoom Thresholds**:

**Game Map**:
- Zoom < 6 (zoomed out): Show top 100 locations by hotScore + highlighted pin
- Zoom >= 6 (zoomed in): Show all pins

**Real Map**:
- Zoom < 13 (zoomed out): Show top 100 locations by hotScore + highlighted pin
- Zoom >= 13 (zoomed in): Show all pins

**Sorting Logic**:
- Primary: hotScore (descending)
- Fallback: postCount (descending) - ensures pins show even when all hotScores are 0
- Highlighted pin always included regardless of rank

**Benefits**:
- Simple, predictable behavior
- No performance concerns
- Works even when all locations have 0 posts
- Users understand: zoom in to see more

### Component Changes

**Update LeafletMap.tsx**:
- Replace `L.circleMarker` with custom DivIcon for rounded rectangle pins
- Implement pin rendering logic based on state (grey dot vs rectangle, regular vs popular vs highlighted)
- Add zoom event listener to recalculate pin visibility
- Increase clickable area using CSS (larger hit box than visual size)
- Handle pin click: set focus, auto-zoom, update URL
- Handle map background click: clear focus

**Update MapClient.tsx**:
- Add `focusedSlug` state (separate from URL param)
- Pass `focusedSlug` to LeafletMap for pin highlighting
- Update `onPinClick` handler to set focused slug and update URL

**Update locations data**:
- Ensure `hotScore` is included in MapLocation interface
- Calculate hotScore server-side or client-side (TBD based on performance)

## Testing Decisions

### Phase 2 Testing Focus

1. **Pin visibility logic**:
   - Test: Correct pins shown at each zoom threshold
   - Test: Highlighted pin always visible regardless of zoom
   - Test: Grey dots only appear at highest zoom levels

2. **Focus management**:
   - Test: Pin click sets focus and updates URL
   - Test: Search selection sets focus correctly
   - Test: Map background click clears focus

3. **Pin rendering**:
   - Test: Correct pin type rendered based on postCount and hotScore
   - Test: Highlighted state overrides popular state
   - Test: Post count displays correctly on rectangle pins

## Out of Scope

### Phase 2 Out of Scope:
1. **Traditional clustering with cluster markers**: Using smart visibility instead
2. **Pin animations**: No pulsing, bouncing, or complex animations (keep it simple)
3. **Custom pin icons/images**: Text-based pins only
4. **Multi-select pins**: Only one focused location at a time
5. **Pin filtering UI**: No separate controls to filter pins by category/type
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

### Future Enhancements (Post-MVP)
- Persistent user preference for map/magnifier toggle
- Realtime activity updates via Supabase Realtime
- Location description content population
- Location sharing functionality
- Heatmap overlay for activity density

