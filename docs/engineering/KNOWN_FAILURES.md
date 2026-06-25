# Known Failures & Recurring Traps

Things that have bitten (or will bite) on this stack: production-only issues,
wrong assumptions, and recurring mistakes — with how to avoid repeating them.
Read this before shipping.

---

### KF-1 — `npm run build` does NOT typecheck
**Trap:** Vite/esbuild strips types without checking them. A green production
build says nothing about type correctness. When `tsc` was first wired up (2026-06-25)
it immediately found **14 pre-existing type errors** the build had been ignoring
(untyped `import.meta.env`, untyped `figma:asset/*` imports, missing react-dom types).
**Avoid:** always run `npm run typecheck` (or `npm run verify`) — never rely on the
build alone.

---

### KF-2 — Firebase config is build-time env vars; missing ones fail silently in prod
**Trap:** `src/firebase.ts` reads `import.meta.env.VITE_FIREBASE_*`. These are
inlined **at build time**. If any is unset/typo'd in the Vercel project,
`initializeApp` does **not** throw — the app loads, but every Firestore/Storage
call fails at runtime. The CMS appears to work locally (where `.env` exists) but
saves silently fail and content never persists in production. Classic
"works locally, broken in prod."
**Avoid:** confirm all `VITE_FIREBASE_*` vars exist in Vercel for every environment
before relying on persistence; see RELEASE_CHECKLIST. Consider a startup
validation that logs/surfaces missing config (tracked in BUG_LOG).

---

### KF-3 — Firestore rejects `undefined`
**Trap:** Writing an object containing `undefined` (e.g. a `Section` with no
`buttonUrl`/`images`) throws `FirebaseError: Unsupported field value: undefined`.
This already caused a production save crash (fixed in commit `4bd34ff`).
**Avoid:** the persistence helpers round-trip through `JSON.parse(JSON.stringify())`
to strip `undefined`. Keep doing that for any new write path. Guarded by
`src/editor/persistence.test.ts`.

---

### KF-4 — Real-time listener can clobber unsaved edits
**Trap:** `ContentContext` subscribes to Firestore via `onSnapshot`. The logic that
ignores local write echoes (`hasPendingWrites`) and protects unsaved local edits
(`hasRemoteUpdate`) is subtle and has been the source of multiple past fixes
(`0d21dc4`, `f1892f3`). A regression here means another user's edit silently
overwrites yours, or false "remote update" banners appear.
**Avoid:** when touching the snapshot/save/dirty-tracking flow, manually test with
two browser tabs. Add coverage if you change this path.

---

### KF-5 — Landing card images are static, not CMS-driven
**Trap:** `src/app/components/Landing.tsx` resolves card backgrounds from a static
`CARD_IMAGES` map keyed by route path, falling back to the company image — it does
**not** read the editable `card.image` field, and the `CardImageEditor` upload
control is defined but never rendered. So "changing a card image" in the CMS has no
effect on the landing page. This may be intentional (commit `6d2646c` switched to
local blurred images), but it's a CMS-vs-render mismatch to be aware of.
**Avoid:** if card-image editing is meant to work, wire `card.image` into the render
and mount `CardImageEditor`; otherwise remove the dead control. Needs a product call.

---
<!-- Add new entries above this line. Keep them specific and actionable. -->
