# Bug Log

Bugs, regressions, and latent defects: root cause, fix, and prevention. Every
fixed bug should get a regression test. Newest first.

Severity: 🔴 high · 🟠 medium · 🟡 low

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
