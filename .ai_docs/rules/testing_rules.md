# Testing Rules

## Required Gates

- Run `pnpm install --frozen-lockfile` when validating from the committed lockfile.
- Run `pnpm check`.
- Run `pnpm build`.
- Validate search against a production build because Pagefind behavior is not represented fully by development mode.

## Manual Coverage

- Check `/`, `/about/`, `/notes/`, and all three sample notes.
- Click every home topic link and confirm it resolves.
- Check Chinese Pagefind queries, light/dark themes, keyboard focus, mobile navigation, and 360x800, 768x1024, and 1440x900 layouts.
- Confirm recent notes include only non-index, non-draft entries below `notes/`, use `updated ?? published`, put undated entries last, and break ties by normalized ID.
- Confirm root-path assets and links work. Non-root base deployment is outside first-release scope.

## Draft Fixture

- Use only `src/content/docs/notes/test-fixtures/draft-pagefind-fixture.md` for the temporary production-isolation check.
- Set `draft: true` and include `DRAFT-PAGEFIND-FIXTURE-8D72` in its title and body.
- After building, confirm the draft is absent from the home list, generated HTML, sidebar, and Pagefind results/index.
- Create the fixture inside PowerShell `try/finally` or an equivalent guaranteed cleanup flow. Remove it even if a check fails, then confirm `Test-Path` is false and `git status --short` has no fixture residue.
- Do not add a test framework for this first release.

Keep long-running `pnpm preview` in one terminal, use another for checks, and stop the server with `Ctrl+C` when manual verification ends.

