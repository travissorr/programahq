import { createBrowserRouter } from "react-router";
import Landing from "./components/Landing";
import Designers from "./pages/Designers";
import Brands from "./pages/Brands";
import Forecast from "./pages/Forecast";

/*
 * ── Routes ───────────────────────────────────────────────────────────
 *
 * To add a new page:
 *   1. Create a new file in src/app/pages/ (copy Brands.tsx as a template)
 *   2. Import it here and add a route below
 *   3. Add a matching card in src/app/components/Landing.tsx CARDS array
 */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/designers",
    Component: Designers,
  },
  {
    path: "/brands",
    Component: Brands,
  },
  {
    path: "/company-update",
    Component: Forecast,
  },
], { basename: "/trimble" });