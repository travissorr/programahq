# Engineering Changelog

Every meaningful change is recorded here with date, summary, files changed, and
test evidence. Newest first.

---

## 2026-06-25 — Establish verification foundation (tests, typecheck, lint)

**Summary**
The project previously had **no test framework, no typecheck script, no lint,
and `typescript` was not even installed** — `package.json` only exposed `build`
and `dev`. None of the safety gates required for shipping changes confidently
could run. This change adds a minimal-but-real verification toolchain without
touching any production runtime behavior.

What was added:
- **TypeScript typecheck gate** (`npm run typecheck` → `tsc --noEmit`). Adding it
  surfaced 14 pre-existing type holes the Vite/esbuild build silently ignored:
  untyped `import.meta.env`, untyped `figma:asset/*` imports, and missing
  `@types/react`/`@types/react-dom`. All fixed (see Files).
- **Vitest + Testing Library** unit/component/integration test setup, reusing the
  existing figma-asset Vite plugin and `@` alias so tests resolve modules exactly
  as the build does.
- **ESLint flat config** (`npm run lint`), scoped to authored source (vendored
  `components/ui/**` and generated `imports/**` are ignored), tuned to pass.
- **22 tests** across 5 files:
  - `src/content.test.ts` — content-contract invariants (card→page mapping,
    required section fields, button URL shape).
  - `src/app/routes.test.ts` — every landing-card path is a registered route and
    every content route has backing `PAGES` data (dead-link / blank-page guard).
  - `src/editor/persistence.test.ts` — regression for granular Firestore saves and
    the "undefined optional field" crash (saves must strip `undefined`, use
    `merge:true`, and only touch the one page key).
  - `src/editor/EditableText.test.tsx` — `**bold**` markdown renders as `<strong>`;
    commit-on-Enter / cancel-on-Escape behavior.
  - `src/app/components/Landing.test.tsx` — route smoke test: Landing renders all
    default cards with the real `ContentProvider` (persistence mocked, no Firebase).
- **`npm run verify`** — one command: typecheck → lint → test → build.

**Files changed**
- `package.json` — added `typescript`, `vitest`, `jsdom`, `@testing-library/*`,
  `eslint` stack, `@types/react`, `@types/react-dom` (all devDependencies);
  added `typecheck`, `lint`, `test`, `test:watch`, `verify` scripts.
- `vite.config.ts` — `defineConfig` now imported from `vitest/config`; added a
  `test` block (jsdom env, globals, setup file, `css:false`).
- `src/vite-env.d.ts` — new; `vite/client` reference + `figma:asset/*` module decl.
- `src/test/setup.ts` — new; jest-dom matchers + RTL cleanup.
- `eslint.config.js` — new; flat config.
- `src/content.test.ts`, `src/app/routes.test.ts`, `src/editor/persistence.test.ts`,
  `src/editor/EditableText.test.tsx`, `src/app/components/Landing.test.tsx` — new tests.
- `docs/engineering/*` — new engineering logs (this file + BUG_LOG, KNOWN_FAILURES,
  RELEASE_CHECKLIST).

**Test evidence** (`npm run verify`)
- `tsc --noEmit` → 0 errors.
- `eslint .` → 0 errors (4 warnings — see BUG_LOG #2/#3).
- `vitest run` → **5 files, 22 tests passed**.
- `vite build` → built in ~3.6s, no errors.

**Blast radius** — additive only. No `src/` runtime file behavior changed (only a
type-only `vite-env.d.ts` and the test `test` block in `vite.config.ts`, which Vite
ignores during `build`). Rollback = revert the commit.

---
