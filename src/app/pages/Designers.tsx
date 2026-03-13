import ContentPage from "../components/ContentPage";
import { useContent } from "../../editor/ContentContext";

export default function Designers() {
  const { pages } = useContent();
  const page = pages["designers"];
  return <ContentPage pageKey="designers" title={page.title} sections={page.sections} />;
}
