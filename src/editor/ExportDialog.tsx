import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { useContent } from "./ContentContext";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const { exportAsJson } = useContent();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const json = exportAsJson();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[200]"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      <div
        className="fixed z-[201] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--border)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
          width: "min(640px, 90vw)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}
        >
          <h3 style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--foreground)",
            margin: 0,
          }}>
            Export Content
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius)",
              backgroundColor: "transparent",
              border: "none",
              color: "var(--muted-foreground)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px", overflow: "auto", flex: 1 }}>
          <p style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            color: "var(--muted-foreground)",
            marginBottom: "12px",
          }}>
            Copy this JSON and paste it into your content configuration.
          </p>
          <pre
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "16px",
              fontSize: "12px",
              fontFamily: "Roboto Mono, monospace",
              color: "var(--foreground)",
              overflow: "auto",
              maxHeight: "400px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {json}
          </pre>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2"
          style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="cursor-pointer"
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 cursor-pointer"
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius)",
              border: "1px solid rgba(229,225,146,0.8)",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        </div>
      </div>
    </>
  );
}
