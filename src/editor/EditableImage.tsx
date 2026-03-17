import { useRef, useState, type ReactNode } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { useContent } from "./ContentContext";
import { uploadImage } from "./uploadImage";

interface EditableImageProps {
  src: string;
  onChangeSrc: (newSrc: string) => void;
  children: ReactNode;
  onRemove?: () => void;
}

export function EditableImage({ src, onChangeSrc, children, onRemove }: EditableImageProps) {
  const { isEditing } = useContent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isEditing) return <>{children}</>;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      onChangeSrc(url);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group/editable-image">
      {children}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hover overlay */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover/editable-image:opacity-100 cursor-pointer"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          transition: "opacity 150ms ease",
          borderRadius: "inherit",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          fileInputRef.current?.click();
        }}
      >
        <div className="flex flex-col items-center gap-1 text-white">
          {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
          <span style={{ fontSize: "12px", fontFamily: "Inter, sans-serif" }}>
            {isUploading ? "Uploading..." : "Click to replace"}
          </span>
        </div>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          className="absolute top-2 right-2 z-20 flex items-center justify-center opacity-0 group-hover/editable-image:opacity-100 cursor-pointer"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "var(--radius)",
            backgroundColor: "rgba(220, 38, 38, 0.9)",
            border: "none",
            color: "white",
            transition: "opacity 150ms ease",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove image"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
