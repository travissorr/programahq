# Engineering Changelog

Every meaningful change is recorded here with date, summary, files changed, and
test evidence. Newest first.

---

## 2026-06-25 — Gate production deploys + add local pre-push check

**Summary**
Hardened enforcement so "whoever publishes can't break the live site," independent
of account/machine. Two layers added on top of CI:
- **Vercel deploy gate:** `vercel.json` now sets `"buildCommand": "npm run verify"`,
  so the production/preview build runs typecheck + lint + test + build before
  publishing. A failing change cannot reach the live site even if it bypassed CI or
  branch protection. (Vercel installs devDeps and the build needs no secrets.)
- **Shared pre-push hook:** `.githooks/pre-push` runs `npm run verify` before every
  push; a dependency-free `prepare` npm script (`git config core.hooksPath
  .githooks`) activates it on `npm install`. Bypassable (`--no-verify`), so it's
  fast local feedback, not the guarantee.

**Files changed**
- `vercel.json` — `buildCommand: npm run verify`.
- `.githooks/pre-push` — new (executable).
- `package.json` — `prepare` script wires `core.hooksPath`.
- `docs/engineering/RELEASE_CHECKLIST.md` — enforcement layers marked in place.

**Enforcement model now:** (1) CI on every push/PR · (2) branch protection requiring
`verify` *(repo-admin setting — still required to BLOCK merges)* · (3) Vercel build
gate · (4) local pre-push hook. Layers 1/3/4 are in the repo; layer 2 is the one
manual admin step.

---

## 2026-06-25 — Add CI to enforce standards across all contributors

**Summary**
The verification tooling shipped in the repo, but nothing *enforced* it for other
contributors pushing from other accounts/machines (no CI; Vercel's build skips
typecheck/lint/test). Added `.github/workflows/ci.yml` — runs `npm ci` + typecheck
+ lint + test + build on every push and pull request, on GitHub's runners, so the
standards apply account/machine-independently. No secrets required (build succeeds
without `VITE_FIREBASE_*`; tests mock Firebase).

**Files changed**
- `.github/workflows/ci.yml` — new CI workflow (job: `verify`).
- `docs/engineering/RELEASE_CHECKLIST.md` — documented the enforcement layers
  (CI + branch protection + optional Vercel build gate + optional local hook).

**Still requires a repo admin (settings, not code):** enable branch protection
requiring the **verify** check, and optionally set Vercel's build command to
`npm run verify`. Without branch protection, CI reports but does not *block*.

---

## 2026-06-25 — Fix partial-Firestore-doc white-screen crash + codebase audit

**Summary**
Ran an adversarially-verified audit (32 confirmed findings, see BUG_LOG). Fixed
the single highest-severity issue: a **production white-screen crash**. The
granular savers (`saveCards` / `savePage`) legitimately write a document with
only `cards`, or only some `pages` keys. `subscribeContent` / `loadContent` cast
the raw snapshot to `ContentData` and passed `data.cards` / `data.pages` straight
into React state, so a partial document produced `setCards(undefined)` /
`setPages(undefined)` → `cards.map(...)` (Landing) and `pages[key].title`
(Brands/Designers/Forecast) threw, white-screening the SPA (no error boundary).

**Fix** — coalesce every Firestore read against the in-code defaults at the single
read boundary in `persistence.ts` (`withDefaults()`): missing `cards` fall back to
`DEFAULT_CARDS`; `pages` is merged over `DEFAULT_PAGES` so missing page keys render
defaults instead of crashing. This protects first load, live remote updates, and
discard/reload simultaneously and required no changes to the (sensitive) snapshot
state machine. Other confirmed findings (concurrent lost-update, world-writable
storage rules, card-image wiring, a11y) are logged for a product/security decision,
not changed here.

**Files changed**
- `src/editor/persistence.ts` — added `withDefaults()`; `loadContent` and
  `subscribeContent` now coalesce partial docs.
- `src/editor/persistence.test.ts` — +6 regression tests (partial-doc via
  `loadContent` and the `onSnapshot` listener; local-write flag; non-existent doc).
- `docs/engineering/{BUG_LOG,KNOWN_FAILURES,CHANGELOG}.md` — audit findings recorded.

**Test evidence** (`npm run verify`)
- `tsc --noEmit` → 0 errors · `eslint .` → 0 errors · `vitest run` → **28 tests
  passed** (was 22) · `vite build` → OK.

**Blast radius** — `persistence.ts` is on the save/load path (sensitive). The change
is additive defaulting only; the happy path (complete doc) is byte-identical in
behavior. Rollback = revert this commit.

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
