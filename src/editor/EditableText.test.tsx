import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// EditableText calls useContent() for the global `isEditing` flag. Mock it so
// we can drive view vs. edit mode without standing up the Firestore provider.
const { useContentMock } = vi.hoisted(() => ({ useContentMock: vi.fn() }));
vi.mock("./ContentContext", () => ({ useContent: () => useContentMock() }));

import { EditableText } from "./EditableText";

beforeEach(() => useContentMock.mockReset());

describe("EditableText — markdown rendering (view mode)", () => {
  beforeEach(() => useContentMock.mockReturnValue({ isEditing: false }));

  it("renders **bold** markers as <strong> (regression for bold markdown support)", () => {
    render(<EditableText value="Hello **world**" onChange={vi.fn()} />);
    const bold = screen.getByText("world");
    expect(bold.tagName).toBe("STRONG");
  });

  it("renders plain text without a <strong> when there are no markers", () => {
    const { container } = render(
      <EditableText value="just text" onChange={vi.fn()} />,
    );
    expect(container.textContent).toBe("just text");
    expect(container.querySelector("strong")).toBeNull();
  });
});

describe("EditableText — editing behavior", () => {
  beforeEach(() => useContentMock.mockReturnValue({ isEditing: true }));

  it("commits the trimmed draft on Enter (single line)", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableText value="old" onChange={onChange} />);

    await user.click(screen.getByText("old"));
    const input = await screen.findByRole("textbox");
    await user.clear(input);
    await user.type(input, "  new value  {Enter}");

    expect(onChange).toHaveBeenCalledWith("new value");
  });

  it("does not call onChange when the value is unchanged", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableText value="same" onChange={onChange} />);

    await user.click(screen.getByText("same"));
    const input = await screen.findByRole("textbox");
    await user.type(input, "{Enter}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("cancels on Escape without committing", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EditableText value="keep me" onChange={onChange} />);

    await user.click(screen.getByText("keep me"));
    const input = await screen.findByRole("textbox");
    await user.clear(input);
    await user.type(input, "discard{Escape}");

    expect(onChange).not.toHaveBeenCalled();
  });
});
