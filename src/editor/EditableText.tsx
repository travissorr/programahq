import { useState, useRef, useEffect, useCallback, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useContent } from "./ContentContext";

/** Parse **bold** markers into React nodes */
function renderMarkdown(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

interface EditableTextProps {
  value: string;
  onChange: (newValue: string) => void;
  multiline?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: "h2" | "h4" | "p" | "span";
}

export function EditableText({
  value,
  onChange,
  multiline = false,
  className = "",
  style = {},
  as: Tag = "span",
}: EditableTextProps) {
  const { isEditing } = useContent();
  const [isActive, setIsActive] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Sync draft when value changes externally
  useEffect(() => {
    if (!isActive) setDraft(value);
  }, [value, isActive]);

  // Focus input when activated
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isActive]);

  const commit = useCallback(() => {
    setIsActive(false);
    if (draft.trim() !== value) {
      onChange(draft.trim());
    }
  }, [draft, value, onChange]);

  const cancel = useCallback(() => {
    setIsActive(false);
    setDraft(value);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancel();
      } else if (e.key === "Enter" && !multiline) {
        e.preventDefault();
        commit();
      } else if (e.key === "Enter" && e.metaKey && multiline) {
        e.preventDefault();
        commit();
      }
    },
    [cancel, commit, multiline],
  );

  // Not editing → render with markdown
  if (!isEditing) {
    return <Tag className={className} style={style}>{renderMarkdown(value)}</Tag>;
  }

  // Editing but not active → render with hover outline
  if (!isActive) {
    return (
      <Tag
        className={className}
        style={{
          ...style,
          cursor: "pointer",
          outline: "2px dashed transparent",
          outlineOffset: "4px",
          borderRadius: "4px",
          transition: "outline-color 150ms ease",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsActive(true);
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.outlineColor = "rgba(59, 130, 246, 0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.outlineColor = "transparent";
        }}
        title="Click to edit"
      >
        {renderMarkdown(value)}
      </Tag>
    );
  }

  // Active editing
  const inputStyle: CSSProperties = {
    ...style,
    display: "block",
    width: "100%",
    background: "rgba(59, 130, 246, 0.06)",
    outline: "2px solid rgba(59, 130, 246, 0.5)",
    outlineOffset: "4px",
    borderRadius: "4px",
    border: "none",
    padding: "2px 4px",
    margin: "-2px -4px",
    resize: multiline ? "vertical" : "none",
    fontFamily: "inherit",
    color: "inherit",
  };

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={className}
        style={{ ...inputStyle, minHeight: "120px" }}
        rows={Math.max(4, draft.split("\n").length + 1)}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      className={className}
      style={inputStyle}
    />
  );
}
