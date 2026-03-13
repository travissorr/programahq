import { Check } from "lucide-react";
import { useContent } from "./ContentContext";

export function EditorToggle() {
  const { isEditing, toggleEditing } = useContent();

  if (!isEditing) return null;

  return (
    <button
      onClick={toggleEditing}
      className="fixed z-[100] flex items-center justify-center cursor-pointer"
      style={{
        bottom: "16px",
        right: "24px",
        width: "48px",
        height: "48px",
        borderRadius: "var(--radius-card)",
        backgroundColor: "var(--primary)",
        border: "1px solid rgba(229,225,146,0.8)",
        boxShadow: "0 0 0 3px rgba(253,255,162,0.4), 0 4px 12px rgba(0,0,0,0.15)",
        color: "var(--foreground)",
        transition: "all 200ms ease",
      }}
      title="Exit edit mode (⌘E)"
    >
      <Check size={20} strokeWidth={2} />
    </button>
  );
}
