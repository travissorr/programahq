import ContentPage from "../components/ContentPage";
import { useContent } from "../../editor/ContentContext";

export default function Brands() {
  const { pages } = useContent();
  const page = pages["brands"];
  return <ContentPage pageKey="brands" title={page.title} sections={page.sections} />;
}
