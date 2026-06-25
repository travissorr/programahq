import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

// Replace the Firestore persistence layer so the real ContentProvider mounts
// without any Firebase SDK init or network. The provider falls back to the
// bundled default content (CARDS) for its initial state.
vi.mock("../../editor/persistence", () => ({
  subscribeContent: () => () => {},
  loadContent: vi.fn().mockResolvedValue(null),
  saveCards: vi.fn(),
  savePage: vi.fn(),
  saveContent: vi.fn(),
}));

import Landing from "./Landing";
import { ContentProvider } from "../../editor/ContentContext";
import { CARDS } from "../../content";

function renderLanding() {
  return render(
    <ContentProvider>
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    </ContentProvider>,
  );
}

describe("Landing (route smoke test)", () => {
  it("renders every default card title", () => {
    renderLanding();
    for (const card of CARDS) {
      expect(screen.getByText(card.title)).toBeInTheDocument();
    }
  });

  it("renders one card per entry in CARDS", () => {
    renderLanding();
    const descriptions = screen.getAllByText(/Organize every room/);
    expect(descriptions).toHaveLength(CARDS.length);
  });
});
