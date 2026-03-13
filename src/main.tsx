import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { ContentProvider } from "./editor/ContentContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <ContentProvider>
    <App />
  </ContentProvider>
);
