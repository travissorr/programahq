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
  onData: (data: ContentData, isLocal: boolean) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    CONTENT_DOC,
    (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as ContentData;
      // hasPendingWrites = true means this snapshot is from our own local write
      const isLocal = snap.metadata.hasPendingWrites;
      onData({ cards: data.cards, pages: data.pages }, isLocal);
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
  // merge:true so we don't wipe pages; also creates doc if it doesn't exist
  await setDoc(CONTENT_DOC, {
    ...clean,
    savedAt: new Date().toISOString(),
  }, { merge: true });
}

/** Save a single page by key — only touches this page, leaves others intact */
export async function savePage(pageKey: string, page: PageContent): Promise<void> {
  const clean = JSON.parse(JSON.stringify(page));
  try {
    await updateDoc(CONTENT_DOC, {
      [`pages.${pageKey}`]: clean,
      savedAt: new Date().toISOString(),
    });
  } catch {
    // Doc doesn't exist yet — create it with merge
    await setDoc(CONTENT_DOC, {
      pages: { [pageKey]: clean },
      savedAt: new Date().toISOString(),
    }, { merge: true });
  }
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
