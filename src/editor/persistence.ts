import type { LandingCard, PageContent } from "../content";

const STORAGE_KEY = "programa-cms-content";

interface StoredContent {
  cards: LandingCard[];
  pages: Record<string, PageContent>;
  savedAt: string;
}

export function loadContent(): { cards: LandingCard[]; pages: Record<string, PageContent> } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: StoredContent = JSON.parse(raw);
    return { cards: data.cards, pages: data.pages };
  } catch {
    return null;
  }
}

export function saveContent(cards: LandingCard[], pages: Record<string, PageContent>): void {
  const data: StoredContent = { cards, pages, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearContent(): void {
  localStorage.removeItem(STORAGE_KEY);
}
