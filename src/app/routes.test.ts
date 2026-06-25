import { describe, it, expect } from "vitest";
import { router } from "./routes";
import { CARDS, PAGES } from "../content";

/**
 * Guards the navigation contract: every landing-card link must resolve to a
 * real route, and every content-bearing route must have backing page data.
 * A mismatch here is a dead link / blank screen in production.
 */

const routePaths = router.routes.map((r) => r.path).filter(Boolean) as string[];

describe("routes", () => {
  it("registers the root route", () => {
    expect(routePaths).toContain("/");
  });

  it("every landing card path is a registered route", () => {
    for (const card of CARDS) {
      expect(
        routePaths,
        `card "${card.title}" links to ${card.path} which is not a registered route`,
      ).toContain(card.path);
    }
  });

  it("every content route (besides root) has a matching PAGES entry", () => {
    for (const path of routePaths) {
      if (path === "/") continue;
      const key = path.replace(/^\//, "");
      expect(
        PAGES[key],
        `route ${path} has no PAGES["${key}"] content`,
      ).toBeDefined();
    }
  });
});
