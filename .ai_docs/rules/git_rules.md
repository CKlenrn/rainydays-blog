# Git Rules

- Implement this feature on `feat/personal_learning_blog`.
- Do not commit directly to the default branch.
- Keep changes scoped to the personal learning blog plan; preserve unrelated user changes.
- Use small conventional commits if commits are requested. Do not create a commit unless explicitly authorized.
- Commit `pnpm-lock.yaml` only when dependency resolution changes.
- Never commit `node_modules/`, `dist/`, `.astro/`, local environment files, secrets, editor state, or temporary test fixtures.
- Before handoff, check the active branch and `git status --short` so generated files and fixtures are not accidentally included.
