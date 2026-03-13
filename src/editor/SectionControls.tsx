import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useContent } from "./ContentContext";

interface SectionControlsProps {
  pageKey: string;
  sectionIndex: number;
  totalSections: number;
}

export function SectionControls({ pageKey, sectionIndex, totalSections }: SectionControlsProps) {
  const { isEditing, addSection, removeSection, moveSection } = useContent();

  if (!isEditing) return null;

  const buttonStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "var(--radius)",
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    color: "var(--muted-foreground)",
    cursor: "pointer" as const,
    display: "flex",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    transition: "all 150ms ease",
  };

  const disabledStyle = {
    ...buttonStyle,
    opacity: 0.3,
    cursor: "not-allowed" as const,
  };

  return (
    <div
      className="flex items-center justify-center gap-2"
      style={{ padding: "8px 0" }}
    >
      {/* Divider line */}
      <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />

      {/* Move up */}
      <button
        onClick={() => sectionIndex > 0 && moveSection(pageKey, sectionIndex, "up")}
        style={sectionIndex > 0 ? buttonStyle : disabledStyle}
        title="Move section up"
        disabled={sectionIndex === 0}
      >
        <ArrowUp size={14} />
      </button>

      {/* Move down */}
      <button
        onClick={() =>
          sectionIndex < totalSections - 1 && moveSection(pageKey, sectionIndex, "down")
        }
        style={sectionIndex < totalSections - 1 ? buttonStyle : disabledStyle}
        title="Move section down"
        disabled={sectionIndex === totalSections - 1}
      >
        <ArrowDown size={14} />
      </button>

      {/* Add section after this one */}
      <button
        onClick={() => addSection(pageKey, sectionIndex)}
        style={{ ...buttonStyle, backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "1px solid rgba(229,225,146,0.8)" }}
        title="Add section below"
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(0.95)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1)"; }}
      >
        <Plus size={16} />
      </button>

      {/* Remove section */}
      <button
        onClick={() => {
          if (totalSections <= 1) return;
          if (window.confirm("Remove this section?")) {
            removeSection(pageKey, sectionIndex);
          }
        }}
        style={totalSections > 1 ? { ...buttonStyle, color: "#dc2626" } : disabledStyle}
        title={totalSections > 1 ? "Remove section" : "Can't remove the last section"}
        disabled={totalSections <= 1}
      >
        <Trash2 size={14} />
      </button>

      {/* Divider line */}
      <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
    </div>
  );
}
