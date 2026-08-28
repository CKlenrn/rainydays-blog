# Structural Review Rules

Review only structural issues introduced on the current feature branch. Report evidence and impact; do not edit files during structural review.

## Boundaries

- The repository remains one Astro + Starlight application and one static build.
- `src/config/site.ts` is the only source for profile data, primary paths, social links, and home topic links.
- `src/content/docs/` is the only source for authored documents and notes.
- `src/pages/index.astro` is the only file-based route shell: it derives metadata from `src/config/site.ts` and renders `HomeLanding` through the official `StarlightPage`; no other `src/pages/` content routes are allowed.
- `src/lib/notes.ts` owns recent-note filtering and sorting; templates do not duplicate that logic.
- Components render data and remain build-time Astro components unless client interactivity is explicitly required.
- Styling stays in the project custom stylesheet and reuses Starlight variables; core Starlight Header, Search, Sidebar, theme, and pagination are not replaced without an explicit requirement.

## Structural Findings

Report a problem when the change introduces:

- Multiple sources of truth for personal configuration, note content, dates, drafts, or navigation.
- Authored prose or hardcoded site metadata in `src/pages/index.astro`, or any additional file-based route that creates a parallel content source.
- A circular dependency or a layer inversion from config/content into UI components.
- Server runtime, database, CMS, client framework, workspace split, synchronization pipeline, or dependency not required by the first release.
- Partial non-root base handling that leaves links or assets inconsistent.
- Topic links that do not resolve, or content filters that include non-note/index/draft entries.
- Component fragmentation that adds indirection without reuse, or one template that mixes content querying, business rules, and large presentation logic when an existing boundary already owns it.
- A custom replacement for a Starlight capability already required by the product.

For each finding provide severity, file and line, issue, impact, and suggested direction. If none exist, state `无结构性问题`.
