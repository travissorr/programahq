import { describe, it, expect } from "vitest";
import { CARDS, PAGES, type PageContent } from "./content";

/**
 * These guard the documented content contract in content.ts:
 *   "Route path — must match a route in routes.ts"
 *   "Edit a page section → update an object in the page's `sections`"
 *
 * A card pointing at a page key that doesn't exist renders a blank page in
 * production, and a section missing required text breaks layout. Both are
 * the kind of "passes the build, looks fine locally, broken in prod" bug
 * these tests exist to catch.
 */

const pageKeyForCard = (path: string) => path.replace(/^\//, "");

describe("landing cards", () => {
  it("has at least one card", () => {
    expect(CARDS.length).toBeGreaterThan(0);
  });

  it("every card has non-empty title, description, image and path", () => {
    for (const card of CARDS) {
      expect(card.title.trim()).not.toBe("");
      expect(card.description.trim()).not.toBe("");
      expect(card.image.trim()).not.toBe("");
      expect(card.path.startsWith("/")).toBe(true);
    }
  });

  it("every card path maps to an existing page in PAGES", () => {
    for (const card of CARDS) {
      const key = pageKeyForCard(card.path);
      expect(
        PAGES[key],
        `card "${card.title}" links to /${key} but PAGES has no "${key}" entry`,
      ).toBeDefined();
    }
  });

  it("has no duplicate card paths", () => {
    const paths = CARDS.map((c) => c.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("page content", () => {
  const entries = Object.entries(PAGES) as [string, PageContent][];

  it("every page has a non-empty title and at least one section", () => {
    for (const [key, page] of entries) {
      expect(page.title.trim(), `page "${key}" title`).not.toBe("");
      expect(page.sections.length, `page "${key}" sections`).toBeGreaterThan(0);
    }
  });

  it("every section has the required heading, byline and description", () => {
    for (const [key, page] of entries) {
      page.sections.forEach((section, i) => {
        const where = `${key}.sections[${i}]`;
        expect(typeof section.heading, `${where}.heading`).toBe("string");
        expect(typeof section.byline, `${where}.byline`).toBe("string");
        expect(section.description.trim(), `${where}.description`).not.toBe("");
      });
    }
  });

  it("any section with a buttonUrl uses an absolute or root-relative URL", () => {
    for (const [key, page] of entries) {
      page.sections.forEach((section, i) => {
        if (section.buttonUrl !== undefined) {
          expect(
            /^(https?:\/\/|\/)/.test(section.buttonUrl),
            `${key}.sections[${i}].buttonUrl "${section.buttonUrl}" should be absolute or root-relative`,
          ).toBe(true);
        }
      });
    }
  });
});
