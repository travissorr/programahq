import ContentPage from "../components/ContentPage";
import { useContent } from "../../editor/ContentContext";

export default function Forecast() {
  const { pages } = useContent();
  const page = pages["company-update"];
  return <ContentPage pageKey="company-update" title={page.title} sections={page.sections} />;
}
