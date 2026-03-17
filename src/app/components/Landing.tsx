import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import svgPaths from "../../imports/svg-igo1y9ic0d";
import arrowSvgPaths from "../../imports/svg-evp5ug6ogf";
import imgSimpleCardGrid from "figma:asset/7f12ea1300756f144a0fb5daaf68dbfc01103a46.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import Header from "./Header";
import { useContent } from "../../editor/ContentContext";
import { EditableText } from "../../editor/EditableText";
import { Camera, Loader2 } from "lucide-react";
import { uploadImage } from "../../editor/uploadImage";

function CardImageEditor({
  onChangeImage,
}: {
  onChangeImage: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      onChangeImage(url);
    } catch (err) {
      console.error("Card image upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        className="absolute z-20 flex items-center justify-center cursor-pointer"
        style={{
          top: "12px",
          right: "12px",
          width: "32px",
          height: "32px",
          borderRadius: "var(--radius)",
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          border: "none",
          color: "white",
          pointerEvents: "auto",
        }}
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        title="Change card image"
      >
        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
      </button>
    </>
  );
}

function FeatureCard({
  title,
  description,
  image,
  path,
  index,
}: {
  title: string;
  description: string;
  image: string;
  path: string;
  index: number;
}) {
  const navigate = useNavigate();
  const { isEditing, updateCard } = useContent();

  return (
    <div
      className="relative w-full overflow-hidden cursor-pointer min-w-0 flex-1 max-md:flex-none"
      style={{
        maxWidth: "380px",
        aspectRatio: "380 / 488",
        borderRadius: "var(--radius-card)",
        transition: `transform var(--transition-duration) ease-out`,
      }}
      onClick={() => {
        if (!isEditing) navigate(path);
      }}
      onMouseEnter={(e) => {
        if (!isEditing)
          e.currentTarget.style.transform = "scale(var(--hover-scale))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {/* Background layers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <img
          alt=""
          className="absolute max-w-none object-cover size-full"
          style={{ borderRadius: "var(--radius-card)" }}
          src={imgSimpleCardGrid}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <ImageWithFallback
            alt=""
            className="absolute max-w-none"
            style={{
              height: "124.68%",
              left: "-12.48%",
              top: 0,
              width: "211.71%",
            }}
            src={image}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            borderRadius: "var(--radius-card)",
            backgroundColor: "rgba(0, 0, 0, 0.35)",
          }}
        />
      </div>

      {/* Image edit button (edit mode only) */}
      {isEditing && (
        <CardImageEditor
          onChangeImage={(url) => updateCard(index, { image: url })}
        />
      )}

      {/* Content overlay */}
      <div
        className="relative flex flex-col justify-between h-full"
        style={{ padding: "var(--spacing-20)" }}
      >
        <div className="flex flex-col" style={{ gap: "var(--spacing-4)" }}>
          <EditableText
            as="p"
            value={title}
            onChange={(val) => updateCard(index, { title: val })}
            className="whitespace-nowrap"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(16px, 1.5vw, var(--text-h4))",
              fontWeight: "var(--font-weight-medium)",
              lineHeight: "1.3",
              color: "white",
            }}
          />
          <EditableText
            as="p"
            value={description}
            onChange={(val) => updateCard(index, { description: val })}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(11px, 1vw, var(--text-sm))",
              fontWeight: "var(--font-weight-normal)",
              lineHeight: "1.5",
              color: "white",
            }}
          />
        </div>

        {/* Arrow button */}
        <div
          className="flex items-center justify-center overflow-clip shrink-0"
          style={{
            width: "clamp(36px, 3.5vw, 50px)",
            height: "clamp(36px, 3.5vw, 50px)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--buttons-white-blur)",
            backdropFilter: "blur(12px)",
            padding: "var(--spacing-12)",
          }}
        >
          <div
            className="relative shrink-0"
            style={{ width: "24px", height: "24px" }}
          >
            <div className="absolute inset-0">
              <div className="absolute" style={{ inset: "21.61%" }}>
                <svg
                  className="absolute block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 13.6361 13.6364"
                >
                  <path d={arrowSvgPaths.p1818e080} fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCards() {
  const { cards } = useContent();

  return (
    <div
      className="flex w-full max-md:flex-col max-md:items-center"
      style={{
        gap: "var(--spacing-20)",
        maxWidth: "1200px",
        padding: "0 var(--spacing-20)",
      }}
    >
      {cards.map((card, index) => (
        <FeatureCard key={card.path} {...card} index={index} />
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="bg-background text-foreground relative min-h-screen w-full">
      <Header showBackButton={false} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center max-md:relative max-md:top-auto max-md:left-auto max-md:translate-x-0 max-md:translate-y-0 max-md:pt-24 max-md:pb-8">
        <FeatureCards />
      </div>

      {/* Decorative element */}
      <div className="absolute left-[-309px] top-[calc(50%+173.19px)] h-[147.388px] w-[501.934px] pointer-events-none max-md:hidden">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 506.526 151.98"
        >
          <path d={svgPaths.p2c289500} fill="var(--color-border)" />
        </svg>
      </div>
    </div>
  );
}
