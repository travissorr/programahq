import { doc, getDoc, onSnapshot, updateDoc, setDoc, type Unsubscribe } from "firebase/firestore";
import { db } from "../firebase";
import type { LandingCard, PageContent } from "../content";

const CONTENT_DOC = doc(db, "content", "main");

export interface ContentData {
  cards: LandingCard[];
  pages: Record<string, PageContent>;
}

// ── One-time load (kept for initial hydration fallback) ──────────────

export async function loadContent(): Promise<ContentData | null> {
  try {
    const snap = await getDoc(CONTENT_DOC);
    if (!snap.exists()) return null;
    const data = snap.data() as ContentData;
    return { cards: data.cards, pages: data.pages };
  } catch (e) {
    console.error("Failed to load content from Firestore:", e);
    return null;
  }
}

// ── Real-time listener ───────────────────────────────────────────────

export function subscribeContent(
  onData: (data: ContentData) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    CONTENT_DOC,
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as ContentData;
      onData({ cards: data.cards, pages: data.pages });
    },
    (error) => {
      console.error("Firestore listener error:", error);
      onError?.(error);
    },
  );
}

// ── Granular saves ───────────────────────────────────────────────────

/** Save only the landing cards */
export async function saveCards(cards: LandingCard[]): Promise<void> {
  const clean = JSON.parse(JSON.stringify({ cards }));
  await updateDoc(CONTENT_DOC, {
    ...clean,
    savedAt: new Date().toISOString(),
  });
}

/** Save a single page by key */
export async function savePage(pageKey: string, page: PageContent): Promise<void> {
  const clean = JSON.parse(JSON.stringify(page));
  await updateDoc(CONTENT_DOC, {
    [`pages.${pageKey}`]: clean,
    savedAt: new Date().toISOString(),
  });
}

/** Save everything (used when changes span cards + multiple pages) */
export async function saveContent(
  cards: LandingCard[],
  pages: Record<string, PageContent>,
): Promise<void> {
  const clean = JSON.parse(JSON.stringify({ cards, pages }));
  // Use merge to avoid wiping fields we don't know about
  await setDoc(CONTENT_DOC, {
    ...clean,
    savedAt: new Date().toISOString(),
  }, { merge: true });
}
