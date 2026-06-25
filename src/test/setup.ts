// Vitest global setup. Registers jest-dom matchers (toBeInTheDocument, etc.)
// and tears down the rendered DOM between tests so component tests stay
// isolated.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
