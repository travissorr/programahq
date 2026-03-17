import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { LandingCard, PageContent } from "../content";

const CONTENT_DOC = doc(db, "content", "main");

export async function loadContent(): Promise<{
  cards: LandingCard[];
  pages: Record<string, PageContent>;
} | null> {
  try {
    const snap = await getDoc(CONTENT_DOC);
    if (!snap.exists()) return null;
    const data = snap.data() as {
      cards: LandingCard[];
      pages: Record<string, PageContent>;
    };
    return { cards: data.cards, pages: data.pages };
  } catch (e) {
    console.error("Failed to load content from Firestore:", e);
    return null;
  }
}

export async function saveContent(
  cards: LandingCard[],
  pages: Record<string, PageContent>,
): Promise<void> {
  await setDoc(CONTENT_DOC, {
    cards,
    pages,
    savedAt: new Date().toISOString(),
  });
}

export async function clearContent(): Promise<void> {
  await deleteDoc(CONTENT_DOC);
}
