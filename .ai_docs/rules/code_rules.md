# Code Rules

## Scope

These rules apply to the Astro, TypeScript, Astro component, CSS, Markdown, and MDX files in this static site. The latest user instruction and repository-level `AGENTS.md`, if present, take precedence.

## Implementation

- Keep one Astro + Starlight application with static output and root-path deployment. Do not add a server adapter, runtime API, CMS, database, or client framework.
- Use pnpm and the existing dependencies. Add a dependency only when Astro, Starlight, CSS, or the JavaScript standard library cannot meet an explicit requirement.
- Keep TypeScript strict. Avoid `any`, unchecked casts, duplicated data models, and browser-side JavaScript for build-time content work.
- Keep personal identity, profile text, social links, primary paths, and home topic links in `src/config/site.ts`.
- Keep all authored document and note content in `src/content/docs/`. Do not create generated content copies or synchronization scripts.
- `src/pages/index.astro` is the only file-based route exception: it may only derive page metadata from `src/config/site.ts` and render `HomeLanding` inside the official `StarlightPage`. Do not put authored prose there or add parallel `src/pages/` content routes.
- Extend Starlight `docsSchema()` only for `published`, `updated`, and `tags`. Use Starlight's built-in `draft`; never redefine it.
- Treat frontmatter `updated ?? published` as the only content date. Keep Starlight Git `lastUpdated` disabled.
- `getRecentNotes()` must include only `notes/**`, exclude every final path segment named `index`, explicitly exclude drafts, put undated notes last, and use normalized ID ascending to break date ties.
- Home topic links must target pages that exist in the repository.
- Keep the first release on `base: "/"`. Do not add partial non-root base handling.

## UI And Content

- Prefer Starlight's search, theme switcher, sidebar, table of contents, and pagination instead of overriding core components.
- Use semantic HTML, one page-level H1, meaningful link text, visible keyboard focus, sufficient contrast, useful image alt text, fixed media dimensions, and `prefers-reduced-motion` support.
- Ensure content works at 360px without incoherent overlap or page-level horizontal overflow. Long code and tables may scroll inside their own containers.
- Use local visual assets. Do not copy another person's identity, contact details, domains, registrations, writing, project data, or brand assets.
- Use ASCII paths and slugs; Chinese display text and prose are allowed.
- Keep sample notes original, useful, and clearly editable rather than pretending placeholder identity data is final.

## Quality Gate

- Before handoff, run `pnpm check` and `pnpm build`.
- Check that product files do not contain reference-site personal identifiers.
- Do not leave temporary draft fixtures, development servers, or untracked build output requiring cleanup.
