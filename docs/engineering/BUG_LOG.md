# Bug Log

Bugs, regressions, and latent defects: root cause, fix, and prevention. Every
fixed bug should get a regression test. Newest first.

Severity: 🔴 high · 🟠 medium · 🟡 low

---

## BL-4 🔴 Partial Firestore doc white-screens the SPA — 2026-06-25
**Status:** ✅ Fixed (with regression tests).
**Root cause:** Granular saves write a document with only `cards` (`saveCards`) or
only some `pages` keys (`savePage`). `subscribeContent`/`loadContent` cast the raw
snapshot to `ContentData` and passed `data.cards`/`data.pages` straight through, so
a partial doc produced `setCards(undefined)`/`setPages(undefined)`. `Landing`'s
`cards.map(...)` and `Brands/Designers/Forecast`'s `pages[key].title` then threw,
white-screening the app (there is no error boundary). Reachable in normal operation
as soon as the first single-part save runs; invisible in dev where defaults exist.
**Fix:** `withDefaults()` at the single read boundary in `persistence.ts` coalesces
missing `cards` to `DEFAULT_CARDS` and merges `pages` over `DEFAULT_PAGES`. Covers
first load, live remote updates, and discard/reload.
**Prevention:** 6 regression tests in `persistence.test.ts` exercise partial docs
through both read paths. See KNOWN_FAILURES KF-6.
**Verified:** `npm run verify` → 28 tests pass; build OK.

---

## Audit 2026-06-25 — confirmed findings (open, not yet fixed)

An adversarially-verified audit (32 confirmed of 34) surfaced the following. Fixed
items are tracked above (BL-4). The rest are **open**; several need a product or
security decision (flagged ⚖️) and were intentionally not changed.

**High**
- 🔴 ⚖️ **Concurrent lost-update** (`ContentContext.tsx`): while a user has unsaved
  edits, a remote change to the *same* page is only flagged, not merged; Save then
  overwrites the other user's whole page (whole-object write, no version check).
  Needs a conflict-resolution decision (block save / merge / re-read & warn).
- 🔴 ⚖️ **World-writable Storage rules** (`storage.rules`): `allow write: if true`
  with no auth anywhere in the app — anyone can upload arbitrary files to the prod
  bucket (billing/abuse, content injection). Needs auth + size/type limits.
- 🔴 **No env validation** (`firebase.ts`): missing `VITE_FIREBASE_*` on Vercel
  boots a silently-broken app (the committed `dist` was built with all six = `void 0`).
  Safe autofix available: validate config at startup and fail loud / log.
- 🔴 **No keyboard access on clickable `div`s** (`Landing.tsx` FeatureCard): cards
  navigate on click but aren't buttons (no role/tabindex/Enter). a11y. Safe autofix.

**Medium** (safe autofixes unless flagged ⚖️)
- 🟠 `discardChanges` races the live listener and can crash on a partial doc
  (same root cause as BL-4; the listener path is now safe, `loadContent` is too).
- 🟠 `savePage` empty `catch {}` retries `setDoc` for *any* error (permission,
  network), masking real failures. Fix: only fall back on `code === 'not-found'`.
- 🟠 ⚖️ **Section stale-state on reorder/remove** (`ContentPage.tsx`): sections are
  keyed by array index, so a mid-edit `EditableText` can write its draft into the
  wrong section. Fix: stable per-section id keys (needs a `Section.id` field).
- 🟠 `Header` Logo + icon-only edit buttons lack accessible names (a11y). Safe.
- 🟠 ⚖️ Card-image editing is non-functional: `Landing` renders from a static
  `CARD_IMAGES` map and `CardImageEditor` is never mounted (see BL-2 / KF-5).

**Low** — `ExportDialog` unguarded clipboard write; `EditableImage` file input not
reset (same-file re-pick is a no-op); `renderMarkdown` drops bold containing an
interior `*`; `uploadImage` has no size/type limits or error context; `isLoading`
never resolves if the first snapshot is suppressed; `EditableText` silently discards
emptied fields; `saveContent` is dead in the app path; carousel/lightbox fixed-size
layout quirks; card title `whitespace-nowrap` can overflow on small screens.

> **Rejected (2):** a claimed `/trimble` bare-path rewrite gap and a "fragile cp
> post-build step" — both refuted on verification.

---

## BL-1 🟠 Latent: type errors invisible because nothing typechecked — 2026-06-25
**Status:** Fixed (tooling) / hardened.
**Root cause:** No `typescript` dependency and no `tsc` step existed; the Vite build
strips types without checking them. 14 type errors (untyped `import.meta.env`,
untyped `figma:asset/*` modules, missing `@types/react-dom`) sat undetected.
**Fix:** Added `typescript`, `@types/react`, `@types/react-dom`, a `vite-env.d.ts`
with the needed ambient declarations, and a `typecheck` script. `tsc --noEmit` is
now 0 errors and part of `npm run verify`.
**Prevention:** `npm run typecheck` in the verify chain + RELEASE_CHECKLIST. See
KNOWN_FAILURES KF-1.

---

## BL-2 🟡 Dead code: `CardImageEditor` defined but never rendered — 2026-06-25
**Status:** Open (needs product decision — see KNOWN_FAILURES KF-5).
**Root cause:** `src/app/components/Landing.tsx` defines a `CardImageEditor`
upload control and the landing render uses a static `CARD_IMAGES` map instead of
the editable `card.image`. The editor was never mounted (flagged by ESLint
`no-unused-vars`).
**Impact:** Editing a card image in the CMS has no visible effect; dead code.
**Fix:** Deferred — either wire `card.image` + mount the editor, or delete the dead
control. Not changed without product intent.
**Prevention:** ESLint `no-unused-vars` now flags unused declarations; logged here.

---

## BL-3 🟡 Minor: unused imports/args — 2026-06-25
**Status:** Open (low priority).
**Root cause:** `ContentSection.tsx` imports `Loader2` but never uses it;
`EditableImage.tsx` has an unused `src` argument. Surfaced by the new ESLint gate.
**Impact:** None at runtime; minor noise / slightly larger surface.
**Fix:** Deferred to a focused cleanup (kept as warnings, not errors, so the lint
gate stays green and changes stay small/inspectable).
**Prevention:** ESLint now reports these as warnings on every `npm run lint`.

---
<!-- Add new entries above this line. -->
