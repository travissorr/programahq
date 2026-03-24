import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  CARDS as DEFAULT_CARDS,
  PAGES as DEFAULT_PAGES,
  type LandingCard,
  type PageContent,
  type Section,
} from "../content";
import { subscribeContent, saveContent, loadContent, type ContentData } from "./persistence";

// ─── Context value shape ─────────────────────────────────────────────

interface ContentContextValue {
  // State
  cards: LandingCard[];
  pages: Record<string, PageContent>;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  hasRemoteUpdate: boolean;

  // Edit mode
  toggleEditing: () => void;
  setEditing: (editing: boolean) => void;

  // Card mutations
  updateCard: (index: number, updates: Partial<LandingCard>) => void;
  addCard: (card: LandingCard) => void;
  removeCard: (index: number) => void;

  // Page mutations
  updatePageTitle: (pageKey: string, title: string) => void;

  // Section mutations
  updateSection: (pageKey: string, sectionIndex: number, updates: Partial<Section>) => void;
  addSection: (pageKey: string, afterIndex: number) => void;
  removeSection: (pageKey: string, sectionIndex: number) => void;
  moveSection: (pageKey: string, fromIndex: number, direction: "up" | "down") => void;

  // Image mutations (within a section's carousel)
  addImage: (pageKey: string, sectionIndex: number, url: string) => void;
  removeImage: (pageKey: string, sectionIndex: number, imageIndex: number) => void;
  updateImage: (pageKey: string, sectionIndex: number, imageIndex: number, url: string) => void;

  // Persistence
  save: () => void;
  discardChanges: () => void;
  exportAsJson: () => string;
}

const ContentContext = createContext<ContentContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within <ContentProvider>");
  return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function cloneDefaults() {
  return {
    cards: structuredClone(DEFAULT_CARDS),
    pages: structuredClone(DEFAULT_PAGES),
  };
}

const DEFAULT_SECTION: Section = {
  heading: "New Section",
  byline: "Section byline",
  description: "Add your content here.",
};

// ─── Provider ────────────────────────────────────────────────────────

export function ContentProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<LandingCard[]>(() => structuredClone(DEFAULT_CARDS));
  const [pages, setPages] = useState<Record<string, PageContent>>(() => structuredClone(DEFAULT_PAGES));
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRemoteUpdate, setHasRemoteUpdate] = useState(false);

  // Refs so the snapshot callback can read current state without re-subscribing
  const isEditingRef = useRef(isEditing);
  const hasUnsavedRef = useRef(hasUnsavedChanges);
  const isFirstSnapshot = useRef(true);

  useEffect(() => { isEditingRef.current = isEditing; }, [isEditing]);
  useEffect(() => { hasUnsavedRef.current = hasUnsavedChanges; }, [hasUnsavedChanges]);

  // ── Real-time Firestore listener ───────────────────────────────────

  useEffect(() => {
    const unsubscribe = subscribeContent(
      (data: ContentData, isLocal: boolean) => {
        if (isFirstSnapshot.current) {
          // First snapshot = initial load
          setCards(data.cards);
          setPages(data.pages);
          setIsLoading(false);
          isFirstSnapshot.current = false;
          return;
        }

        // Ignore echoes of our own writes
        if (isLocal) return;

        // Remote change from another user
        if (hasUnsavedRef.current) {
          // User has unsaved edits — don't overwrite, just flag it
          setHasRemoteUpdate(true);
        } else {
          // No local edits — apply the remote change live
          setCards(data.cards);
          setPages(data.pages);
          setHasRemoteUpdate(false);
        }
      },
      () => {
        // On error, stop loading spinner
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // ── Edit mode ────────────────────────────────────────────────────

  const toggleEditing = useCallback(() => setIsEditing((v) => !v), []);
  const setEditing = useCallback((editing: boolean) => setIsEditing(editing), []);

  // ── Card mutations ───────────────────────────────────────────────

  const updateCard = useCallback((index: number, updates: Partial<LandingCard>) => {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, ...updates } : c)));
    setHasUnsavedChanges(true);
  }, []);

  const addCard = useCallback((card: LandingCard) => {
    setCards((prev) => [...prev, card]);
    setHasUnsavedChanges(true);
  }, []);

  const removeCard = useCallback((index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  }, []);

  // ── Page mutations ───────────────────────────────────────────────

  const updatePageTitle = useCallback((pageKey: string, title: string) => {
    setPages((prev) => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], title },
    }));
    setHasUnsavedChanges(true);
  }, []);

  // ── Section mutations ────────────────────────────────────────────

  const updateSection = useCallback(
    (pageKey: string, sectionIndex: number, updates: Partial<Section>) => {
      setPages((prev) => {
        const page = prev[pageKey];
        if (!page) return prev;
        const newSections = page.sections.map((s, i) =>
          i === sectionIndex ? { ...s, ...updates } : s,
        );
        return { ...prev, [pageKey]: { ...page, sections: newSections } };
      });
      setHasUnsavedChanges(true);
    },
    [],
  );

  const addSection = useCallback((pageKey: string, afterIndex: number) => {
    setPages((prev) => {
      const page = prev[pageKey];
      if (!page) return prev;
      const newSections = [...page.sections];
      newSections.splice(afterIndex + 1, 0, structuredClone(DEFAULT_SECTION));
      return { ...prev, [pageKey]: { ...page, sections: newSections } };
    });
    setHasUnsavedChanges(true);
  }, []);

  const removeSection = useCallback((pageKey: string, sectionIndex: number) => {
    setPages((prev) => {
      const page = prev[pageKey];
      if (!page || page.sections.length <= 1) return prev; // keep at least 1 section
      const newSections = page.sections.filter((_, i) => i !== sectionIndex);
      return { ...prev, [pageKey]: { ...page, sections: newSections } };
    });
    setHasUnsavedChanges(true);
  }, []);

  const moveSection = useCallback(
    (pageKey: string, fromIndex: number, direction: "up" | "down") => {
      setPages((prev) => {
        const page = prev[pageKey];
        if (!page) return prev;
        const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= page.sections.length) return prev;
        const newSections = [...page.sections];
        [newSections[fromIndex], newSections[toIndex]] = [newSections[toIndex], newSections[fromIndex]];
        return { ...prev, [pageKey]: { ...page, sections: newSections } };
      });
      setHasUnsavedChanges(true);
    },
    [],
  );

  // ── Image mutations ──────────────────────────────────────────────

  const updateSectionImages = useCallback(
    (pageKey: string, sectionIndex: number, updater: (images: string[]) => string[]) => {
      setPages((prev) => {
        const page = prev[pageKey];
        if (!page) return prev;
        const section = page.sections[sectionIndex];
        if (!section) return prev;
        const currentImages = section.images ?? [];
        const newImages = updater(currentImages);
        const newSections = page.sections.map((s, i) =>
          i === sectionIndex ? { ...s, images: newImages } : s,
        );
        return { ...prev, [pageKey]: { ...page, sections: newSections } };
      });
      setHasUnsavedChanges(true);
    },
    [],
  );

  const addImage = useCallback(
    (pageKey: string, sectionIndex: number, url: string) => {
      updateSectionImages(pageKey, sectionIndex, (imgs) => [...imgs, url]);
    },
    [updateSectionImages],
  );

  const removeImage = useCallback(
    (pageKey: string, sectionIndex: number, imageIndex: number) => {
      updateSectionImages(pageKey, sectionIndex, (imgs) => imgs.filter((_, i) => i !== imageIndex));
    },
    [updateSectionImages],
  );

  const updateImage = useCallback(
    (pageKey: string, sectionIndex: number, imageIndex: number, url: string) => {
      updateSectionImages(pageKey, sectionIndex, (imgs) =>
        imgs.map((img, i) => (i === imageIndex ? url : img)),
      );
    },
    [updateSectionImages],
  );

  // ── Persistence ──────────────────────────────────────────────────

  const save = useCallback(async () => {
    await saveContent(cards, pages);
    setHasUnsavedChanges(false);
    setHasRemoteUpdate(false);
  }, [cards, pages]);

  const discardChanges = useCallback(async () => {
    setHasUnsavedChanges(false);
    setHasRemoteUpdate(false);
    // Reload the last-saved version from Firestore
    try {
      const saved = await loadContent();
      if (saved) {
        setCards(saved.cards);
        setPages(saved.pages);
      } else {
        const defaults = cloneDefaults();
        setCards(defaults.cards);
        setPages(defaults.pages);
      }
    } catch {
      const defaults = cloneDefaults();
      setCards(defaults.cards);
      setPages(defaults.pages);
    }
  }, []);

  const exportAsJson = useCallback(() => {
    return JSON.stringify({ cards, pages }, null, 2);
  }, [cards, pages]);

  // ── Keyboard shortcut (Cmd+E / Ctrl+E) ──────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        toggleEditing();
      }
      if (e.key === "Escape" && isEditing) {
        e.preventDefault();
        setIsEditing(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleEditing, isEditing]);

  // ── Context value ────────────────────────────────────────────────

  const value: ContentContextValue = {
    cards,
    pages,
    isEditing,
    hasUnsavedChanges,
    isLoading,
    hasRemoteUpdate,
    toggleEditing,
    setEditing,
    updateCard,
    addCard,
    removeCard,
    updatePageTitle,
    updateSection,
    addSection,
    removeSection,
    moveSection,
    addImage,
    removeImage,
    updateImage,
    save,
    discardChanges,
    exportAsJson,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
