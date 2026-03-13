import Header from "./Header";
import ContentSection from "./ContentSection";
import type { Section } from "../../content";
import { useContent } from "../../editor/ContentContext";
import { EditableText } from "../../editor/EditableText";
import { SectionControls } from "../../editor/SectionControls";

interface ContentPageProps {
  pageKey: string;
  title: string;
  sections: Section[];
}

export default function ContentPage({ pageKey, title, sections }: ContentPageProps) {
  const { updatePageTitle } = useContent();

  return (
    <div className="bg-background min-h-screen w-full" data-name="CONTENT PAGE">
      <Header />

      {/* Page title */}
      <div
        className="mx-auto"
        style={{
          maxWidth: '1200px',
          padding: '0 var(--spacing-20)',
          marginTop: '150px',
        }}
      >
        <EditableText
          as="h2"
          value={title}
          onChange={(newTitle) => updatePageTitle(pageKey, newTitle)}
          style={{
            color: 'var(--foreground)',
            fontFamily: 'Rhymes Display Trial Unlicensed, serif',
            fontSize: 'calc(var(--text-h2) * 0.8)',
            fontWeight: '300',
            lineHeight: '1.3',
            marginBottom: '0',
          }}
        />
      </div>

      {/* Content sections */}
      <div className="flex flex-col" style={{ gap: 'var(--spacing-80, 80px)', marginTop: '50px' }}>
        {sections.map((section, index) => (
          <div key={index}>
            <ContentSection
              pageKey={pageKey}
              sectionIndex={index}
              sectionHeading={section.heading}
              sectionByline={section.byline}
              description={section.description}
              buttonUrl={section.buttonUrl}
              buttonLabel={section.buttonLabel}
              images={section.images}
            />
            <SectionControls
              pageKey={pageKey}
              sectionIndex={index}
              totalSections={sections.length}
            />
          </div>
        ))}
      </div>

      <div style={{ height: '80px' }} />
    </div>
  );
}
