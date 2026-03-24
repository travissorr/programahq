import { useState } from "react";
import { Save, RotateCcw, AlertCircle } from "lucide-react";
import { useContent } from "./ContentContext";

export function EditorToolbar() {
  const { isEditing, hasUnsavedChanges, hasRemoteUpdate, save, discardChanges } = useContent();
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isEditing) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(false);
    try {
      await save();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (e) {
      console.error("Save failed:", e);
      setSaveError(true);
      setTimeout(() => setSaveError(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Discard unsaved changes and revert to the last saved version?")) {
      discardChanges();
    }
  };

  const btnBase = {
    display: "flex",
    alignItems: "center" as const,
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "var(--radius)",
    fontSize: "13px",
    fontFamily: "Inter, sans-serif",
    fontWeight: 500,
    cursor: "pointer" as const,
    transition: "all 150ms ease",
    border: "none",
  };

  return (
    <div
      className="fixed z-[99] left-1/2 -translate-x-1/2 flex items-center gap-3"
      style={{
        bottom: "16px",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "10px 16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      }}
    >
      {/* Remote update warning */}
      {hasRemoteUpdate && (
        <>
          <div className="flex items-center gap-2" style={{ marginRight: "4px" }}>
            <AlertCircle size={14} style={{ color: "#2563eb" }} />
            <span style={{
              fontSize: "12px",
              color: "#2563eb",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
            }}>
              Someone else made changes
            </span>
          </div>
          <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border)" }} />
        </>
      )}

      {/* Status dot — only visible when there are unsaved changes or just saved */}
      {!hasRemoteUpdate && (hasUnsavedChanges || justSaved || saveError) && (
        <>
          <div className="flex items-center gap-2" style={{ marginRight: "4px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: saveError ? "#dc2626" : hasUnsavedChanges ? "#f59e0b" : "#22c55e",
                transition: "background-color 200ms ease",
              }}
            />
            <span style={{
              fontSize: "12px",
              color: saveError ? "#dc2626" : "var(--muted-foreground)",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
            }}>
              {saveError ? "Save failed!" : justSaved ? "Saved!" : "Unsaved changes"}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border)" }} />
        </>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        style={{
          ...btnBase,
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <Save size={14} /> {isSaving ? "Saving..." : "Save"}
      </button>

      {/* Discard */}
      <button
        onClick={handleDiscard}
        style={{
          ...btnBase,
          backgroundColor: "transparent",
          color: "#dc2626",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(220,38,38,0.08)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
      >
        <RotateCcw size={14} /> Discard
      </button>
    </div>
  );
}
