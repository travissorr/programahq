# Release Checklist

Practical, repo-specific checklist for shipping changes to the Trimble/Programa
site safely. This is a **Vite + React SPA deployed to Vercel** under base path
`/trimble/`, backed by **Firebase Firestore + Storage**.

## Before you start
- [ ] Work on the designated feature branch (never commit straight to the default
      branch).
- [ ] Understand the blast radius: is this content-only (`src/content.ts`), CMS
      logic (`src/editor/*`), routing (`src/app/routes.ts`), or layout
      (`src/app/components|pages/*`)?

## Local verification (must all pass)
Run the single gate:
```
npm run verify    # typecheck → lint → test → build
```
Or individually:
- [ ] `npm install` (clean install resolves; lockfile committed).
- [ ] `npm run typecheck` — 0 errors.
- [ ] `npm run lint` — 0 errors (warnings acceptable but review them).
- [ ] `npm run test` — all tests green; **add/adjust tests for your change**.
- [ ] `npm run build` — production build succeeds.

## Production-reality checks (this stack bites here — see KNOWN_FAILURES)
- [ ] **Env vars**: any new `import.meta.env.VITE_*` must be set in the Vercel
      project for all environments. Missing Firebase vars → silent broken CMS.
- [ ] **Base path**: all routes live under `/trimble/`. New routes must be added to
      `src/app/routes.ts` AND have a matching `PAGES` entry AND (if linked from the
      landing page) a `CARDS` entry with the same path. `routes.test.ts` enforces this.
- [ ] **Firestore shape**: saves must not write `undefined` (Firestore rejects it).
      Use the granular `saveCards`/`savePage` helpers; `persistence.test.ts` guards this.
- [ ] **Empty / missing data**: app must render when the Firestore `content/main`
      doc is absent (first load falls back to bundled defaults in `content.ts`).
- [ ] **Real-time concurrency**: with multiple editors, confirm remote updates don't
      clobber unsaved local edits (the `hasRemoteUpdate` flag path).
- [ ] **Mobile/responsive**: check `max-md:` layouts (landing stacks vertically;
      header gets a backdrop). Test at ≤768px.
- [ ] **Image upload**: `uploadImage` writes to Firebase Storage — verify Storage
      rules allow the write in the target project.

## Deploy
- [ ] Push to the feature branch; let CI/preview build run.
- [ ] Smoke the Vercel **preview** URL: landing renders 3 cards; each route loads;
      open the CMS (Cmd/Ctrl+E) and confirm edit → save → reload persists.
- [ ] Verify `X-Robots-Tag: noindex` is still applied (this site is intentionally
      not indexed — see `vercel.json`).

## After deploy
- [ ] Smoke production: hard-refresh each route (SPA rewrite must serve
      `/trimble/index.html`).
- [ ] Update `docs/engineering/CHANGELOG.md` with what shipped + test evidence.
- [ ] If a bug was fixed, update `BUG_LOG.md` and add a regression test.
- [ ] If something only failed in prod, update `KNOWN_FAILURES.md`.

## Rollback
- [ ] Vercel: redeploy the previous good deployment (instant rollback), or revert
      the commit on the branch and re-push.
- [ ] Content-only regressions can also be fixed via the CMS without a code deploy.
