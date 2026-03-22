## Parent PRD

#1

## What to build

Build the three static legal/informational pages: `/about`, `/privacy`, and `/dmca`. These pages use the established layout shell (sidebar, dark mode). The page structure and design are complete; legal copy is intentionally left as a placeholder — the user will supply final text from a legal professional before public launch.

This is a HITL issue: the page shells can be merged immediately, but the issue should remain open until final legal copy is inserted and reviewed.

## Acceptance criteria

- [ ] `/about` page renders within the app shell; contains: site name, a clear "unofficial fan site, not affiliated with Rockstar Games or Take-Two Interactive" disclaimer, and a map/community attribution section (crediting stateofleonida.net and gtadb.org)
- [ ] `/privacy` page renders with a placeholder section structure (Data collected, How it's used, Contact) ready for legal copy
- [ ] `/dmca` page renders with a placeholder DMCA takedown request form or contact email ready for legal copy
- [ ] All three pages linked from the sidebar footer (About, Privacy links already wired)
- [ ] DMCA page linked from the sidebar footer alongside About and Privacy
- [ ] All three pages have appropriate `generateMetadata` titles and descriptions
- [ ] Pages render correctly in dark mode

## Blocked by

- Blocked by #4 (layout shell)

## User stories addressed

- User stories 12, 13, 14

## Note

This issue stays open until final legal copy is provided and inserted. Do not mark complete until copy is live.
