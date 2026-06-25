import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Firebase boundary so no network/SDK init happens in tests.
vi.mock("../firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(() => ({ __ref: "content/main" })),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
}));

import { setDoc, updateDoc } from "firebase/firestore";
import { saveCards, savePage, saveContent } from "./persistence";
import type { PageContent } from "../content";

const setDocMock = vi.mocked(setDoc);
const updateDocMock = vi.mocked(updateDoc);

beforeEach(() => {
  setDocMock.mockClear();
  updateDocMock.mockClear();
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
