import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DocumentSnapshot } from "firebase/firestore";

// Mock the Firebase boundary so no network/SDK init happens in tests.
vi.mock("../firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(() => ({ __ref: "content/main" })),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
}));

import { setDoc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import {
  saveCards,
  savePage,
  saveContent,
  subscribeContent,
  loadContent,
  type ContentData,
} from "./persistence";
import {
  CARDS as DEFAULT_CARDS,
  PAGES as DEFAULT_PAGES,
  type PageContent,
} from "../content";

const setDocMock = vi.mocked(setDoc);
const updateDocMock = vi.mocked(updateDoc);
const getDocMock = vi.mocked(getDoc);
const onSnapshotMock = vi.mocked(onSnapshot);

/** Minimal Firestore DocumentSnapshot stand-in. `data===undefined` => !exists(). */
function fakeSnap(data: unknown, hasPendingWrites = false): DocumentSnapshot {
  return {
    exists: () => data !== undefined && data !== null,
    data: () => data,
    metadata: { hasPendingWrites },
  } as unknown as DocumentSnapshot;
}

/** Make the mocked onSnapshot synchronously emit one snapshot to its listener. */
function emitSnapshot(snap: DocumentSnapshot) {
  onSnapshotMock.mockImplementation(((
    _ref: unknown,
    onNext: (s: DocumentSnapshot) => void,
  ) => {
    onNext(snap);
    return () => {};
  }) as unknown as typeof onSnapshot);
}

beforeEach(() => {
  setDocMock.mockReset();
  updateDocMock.mockReset();
  getDocMock.mockReset();
  onSnapshotMock.mockReset();
  setDocMock.mockResolvedValue(undefined);
  updateDocMock.mockResolvedValue(undefined);
});

describe("saveCards", () => {
  it("writes cards with merge:true so it never wipes pages", async () => {
    const cards = [
      { title: "A", description: "d", image: "i", path: "/a" },
    ];
    await saveCards(cards);

    expect(setDocMock).toHaveBeenCalledTimes(1);
    const [, payload, options] = setDocMock.mock.calls[0];
    expect((payload as { cards: unknown }).cards).toEqual(cards);
    expect((payload as { savedAt: string }).savedAt).toEqual(expect.any(String));
    expect(options).toEqual({ merge: true });
  });
});

describe("savePage", () => {
  // Regression: "Fix Firestore save error when sections have undefined optional
  // fields". Firestore rejects `undefined` values; the JSON round-trip in
  // persistence must strip optional fields that are undefined.
  it("strips undefined optional section fields before writing", async () => {
    const page: PageContent = {
      title: "Designers",
      sections: [
        {
          heading: "h",
          byline: "b",
          description: "desc",
          buttonUrl: undefined,
          buttonLabel: undefined,
          images: undefined,
        },
      ],
    };

    await savePage("designers", page);

    expect(updateDocMock).toHaveBeenCalledTimes(1);
    const [, payload] = updateDocMock.mock.calls[0];
    const cleanedPage = (payload as unknown as Record<string, PageContent>)[
      "pages.designers"
    ];
    const section = cleanedPage.sections[0];

    expect(section.heading).toBe("h");
    expect("buttonUrl" in section).toBe(false);
    expect("buttonLabel" in section).toBe(false);
    expect("images" in section).toBe(false);
    expect(JSON.stringify(payload)).not.toContain("undefined");
  });

  it("only targets the one page key (granular save)", async () => {
    const page: PageContent = {
      title: "Brands",
      sections: [{ heading: "h", byline: "b", description: "d" }],
    };
    await savePage("brands", page);

    const [, payload] = updateDocMock.mock.calls[0];
    expect(Object.keys(payload as object)).toEqual(["pages.brands", "savedAt"]);
  });

  it("falls back to a merge setDoc when the doc does not exist yet", async () => {
    updateDocMock.mockRejectedValueOnce(new Error("No document to update"));
    const page: PageContent = {
      title: "Designers",
      sections: [{ heading: "h", byline: "b", description: "d" }],
    };

    await savePage("designers", page);

    expect(updateDocMock).toHaveBeenCalledTimes(1);
    expect(setDocMock).toHaveBeenCalledTimes(1);
    const [, payload, options] = setDocMock.mock.calls[0];
    expect((payload as { pages: Record<string, PageContent> }).pages.designers.title).toBe(
      "Designers",
    );
    expect(options).toEqual({ merge: true });
  });
});

describe("saveContent", () => {
  it("writes cards + pages with merge:true", async () => {
    await saveContent(
      [{ title: "A", description: "d", image: "i", path: "/a" }],
      { a: { title: "A", sections: [{ heading: "h", byline: "b", description: "d" }] } },
    );

    expect(setDocMock).toHaveBeenCalledTimes(1);
    const [, , options] = setDocMock.mock.calls[0];
    expect(options).toEqual({ merge: true });
  });
});

describe("loadContent — coalesces partial documents (regression: undefined-field crash)", () => {
  it("returns null when the document does not exist", async () => {
    getDocMock.mockResolvedValue(fakeSnap(undefined));
    expect(await loadContent()).toBeNull();
  });

  it("fills in default cards when the stored doc has only pages", async () => {
    const savedPage: PageContent = {
      title: "Saved Designers",
      sections: [{ heading: "h", byline: "b", description: "d" }],
    };
    getDocMock.mockResolvedValue(fakeSnap({ pages: { designers: savedPage } }));

    const result = await loadContent();
    expect(result?.cards).toEqual(DEFAULT_CARDS);
    // the saved page overrides the default; the other default pages remain
    expect(result?.pages.designers.title).toBe("Saved Designers");
    expect(result?.pages.brands).toEqual(DEFAULT_PAGES.brands);
  });

  it("fills in default pages when the stored doc has only cards", async () => {
    const savedCards = [{ title: "X", description: "d", image: "i", path: "/x" }];
    getDocMock.mockResolvedValue(fakeSnap({ cards: savedCards }));

    const result = await loadContent();
    expect(result?.cards).toEqual(savedCards);
    expect(Object.keys(result!.pages).sort()).toEqual(
      Object.keys(DEFAULT_PAGES).sort(),
    );
  });
});

describe("subscribeContent — coalesces partial snapshots", () => {
  it("substitutes default cards when the snapshot has no cards field", () => {
    emitSnapshot(fakeSnap({ pages: {} }));
    let received: ContentData | undefined;
    subscribeContent((data) => {
      received = data;
    });

    expect(received?.cards).toEqual(DEFAULT_CARDS);
    // missing page keys fall back to defaults rather than being undefined
    expect(Object.keys(received!.pages).sort()).toEqual(
      Object.keys(DEFAULT_PAGES).sort(),
    );
  });

  it("flags local writes via metadata.hasPendingWrites", () => {
    emitSnapshot(fakeSnap({ cards: DEFAULT_CARDS, pages: DEFAULT_PAGES }, true));
    let isLocalSeen: boolean | undefined;
    subscribeContent((_data, isLocal) => {
      isLocalSeen = isLocal;
    });
    expect(isLocalSeen).toBe(true);
  });

  it("ignores snapshots when the document does not exist", () => {
    emitSnapshot(fakeSnap(undefined));
    const cb = vi.fn();
    subscribeContent(cb);
    expect(cb).not.toHaveBeenCalled();
  });
});
