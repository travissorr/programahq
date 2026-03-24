import svgButtonPaths from "../../imports/svg-gx5rao0x51";
import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Plus, Loader2 } from "lucide-react";
import { useContent } from "../../editor/ContentContext";
import { EditableText } from "../../editor/EditableText";
import { EditableImage } from "../../editor/EditableImage";
import { uploadImage } from "../../editor/uploadImage";

interface ContentSectionProps {
  pageKey: string;
  sectionIndex: number;
  sectionHeading: string;
  sectionByline: string;
  description: string;
  buttonUrl?: string;
  buttonLabel?: string;
  images?: string[];
}

const SLIDE_WIDTH_DESKTOP = 1160;
const SLIDE_GAP = 12;

function useSlideWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
      ? window.innerWidth - 32
      : SLIDE_WIDTH_DESKTOP
  );

  useEffect(() => {
    const update = () => {
      setWidth(window.innerWidth < 768 ? window.innerWidth - 32 : SLIDE_WIDTH_DESKTOP);
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return width;
}

export default function ContentSection({
  pageKey,
  sectionIndex,
  sectionHeading,
  sectionByline,
  description,
  buttonUrl,
  buttonLabel = "Open Prototype",
  images: imagesProp,
}: ContentSectionProps) {
  const { isEditing, updateSection, addImage, removeImage, updateImage } = useContent();
  const SLIDE_WIDTH = useSlideWidth();

  const images = imagesProp && imagesProp.length > 0 ? imagesProp : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Clamp currentIndex when images change
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(Math.max(0, images.length - 1));
    }
  }, [images.length, currentIndex]);

  const openLightbox = useCallback(() => {
    if (!isEditing) setLightboxOpen(true);
  }, [isEditing]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || currentIndex === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, currentIndex]);

  const goToNext = useCallback(() => {
    if (isTransitioning || currentIndex === images.length - 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, currentIndex, images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, goToPrevious, goToNext]);

  const addImageInputRef = useRef<HTMLInputElement>(null);
  const touchStartRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrevious();
    }
    touchStartRef.current = null;
  }, [goToNext, goToPrevious]);

  const translateX = `calc(50vw - ${SLIDE_WIDTH / 2}px - ${currentIndex * (SLIDE_WIDTH + SLIDE_GAP)}px)`;

  return (
    <div>
      {/* Text content */}
      <div className="mx-auto" style={{ maxWidth: '1200px', padding: '0 var(--spacing-20)' }}>
        <div className="flex flex-col" style={{ gap: 'var(--spacing-20)' }}>
          <EditableText
            as="h4"
            value={sectionHeading}
            onChange={(val) => updateSection(pageKey, sectionIndex, { heading: val })}
            style={{
              color: 'var(--foreground)',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'var(--text-h4)',
              fontWeight: 'var(--font-weight-medium)',
              lineHeight: '1.5'
            }}
          />

          <div className="flex flex-col" style={{ gap: 'var(--spacing-12)' }}>
            <EditableText
              as="p"
              value={sectionByline}
              onChange={(val) => updateSection(pageKey, sectionIndex, { byline: val })}
              style={{
                color: 'var(--foreground)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: '1.5'
              }}
            />

            <EditableText
              as="p"
              value={description}
              onChange={(val) => updateSection(pageKey, sectionIndex, { description: val })}
              multiline
              style={{
                color: 'var(--muted-foreground)',
                fontFamily: 'Inter, sans-serif',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-normal)',
                lineHeight: '1.5',
                whiteSpace: 'pre-line',
              }}
            />

            {/* Button — in edit mode, clicking edits instead of navigating */}
            {buttonUrl && !isEditing && (
              <a
                href={buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex gap-[var(--spacing-8)] items-center justify-center overflow-clip rounded-[var(--radius-button)] shrink-0 cursor-pointer no-underline"
                style={{
                  backgroundColor: 'var(--primary)',
                  padding: 'var(--spacing-12)',
                  boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.2), 0px 0px 0px 1px rgba(229,225,146,0.8)',
                  marginTop: 'var(--spacing-20)',
                  alignSelf: 'flex-start',
                  transition: `filter var(--transition-duration) ease`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
              >
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: '20px',
                  color: 'var(--primary-foreground)',
                  whiteSpace: 'nowrap',
                }}>
                  {buttonLabel}
                </span>
                <div className="relative shrink-0 size-[16px]">
                  <div className="absolute inset-[12.76%]">
                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.917 11.917">
                      <path d={svgButtonPaths.p1471680} fill="var(--primary-foreground)" />
                    </svg>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0.75px_0px_0px_rgba(255,255,255,0.2)]" />
              </a>
            )}

            {/* Editable button controls in edit mode */}
            {isEditing && buttonUrl && (
              <div className="flex items-center gap-3" style={{ marginTop: 'var(--spacing-12)' }}>
                <div
                  className="inline-flex gap-[var(--spacing-8)] items-center overflow-clip rounded-[var(--radius-button)] shrink-0"
                  style={{
                    backgroundColor: 'var(--primary)',
                    padding: 'var(--spacing-12)',
                    boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.2), 0px 0px 0px 1px rgba(229,225,146,0.8)',
                  }}
                >
                  <EditableText
                    as="span"
                    value={buttonLabel}
                    onChange={(val) => updateSection(pageKey, sectionIndex, { buttonLabel: val })}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-normal)',
                      lineHeight: '20px',
                      color: 'var(--primary-foreground)',
                      whiteSpace: 'nowrap',
                    }}
                  />
                </div>
                <EditableText
                  as="span"
                  value={buttonUrl || ""}
                  onChange={(val) => updateSection(pageKey, sectionIndex, { buttonUrl: val || undefined })}
                  style={{
                    fontFamily: "Roboto Mono, monospace",
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                  }}
                />
                <button
                  onClick={() => updateSection(pageKey, sectionIndex, { buttonUrl: undefined, buttonLabel: undefined })}
                  className="flex items-center justify-center shrink-0 cursor-pointer"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: '#dc2626',
                    transition: 'all 150ms ease',
                  }}
                  title="Remove button"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {isEditing && !buttonUrl && (
              <button
                onClick={() => updateSection(pageKey, sectionIndex, { buttonUrl: 'https://example.com', buttonLabel: 'Open Prototype' })}
                className="inline-flex items-center gap-2 cursor-pointer"
                style={{
                  marginTop: 'var(--spacing-12)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  border: '1px dashed var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--foreground)'; (e.currentTarget as HTMLElement).style.color = 'var(--foreground)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'; }}
              >
                <Plus size={14} />
                Add Prototype Button
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full viewport-width carousel — hidden when no images and not editing */}
      {(images.length > 0 || isEditing) && (
      <div
        className="group/carousel relative w-screen overflow-hidden"
        style={{
          marginTop: '30px',
          marginLeft: 'calc(-50vw + 50%)',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex items-center"
          style={{
            gap: `${SLIDE_GAP}px`,
            transform: `translateX(${translateX})`,
            transition: 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
            willChange: 'transform',
          }}
        >
          {images.map((img, index) => {
            const isActive = index === currentIndex;
            const innerImage = (
              <div
                className="overflow-hidden w-full"
                style={{
                  aspectRatio: '1440 / 1024',
                  borderRadius: 'var(--radius-card)',
                  opacity: isActive ? 1 : 0.45,
                  transform: isActive ? 'scale(1)' : 'scale(0.96) scaleY(0.85)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  cursor: isActive && !isEditing ? 'pointer' : 'default',
                }}
                onClick={isActive && !isEditing ? openLightbox : undefined}
              >
                <img
                  alt=""
                  className="w-full h-full object-cover"
                  src={img}
                  draggable={false}
                />
              </div>
            );

            return (
              <div
                key={index}
                className="flex-shrink-0 self-center"
                style={{ width: `${SLIDE_WIDTH}px` }}
              >
                {isEditing ? (
                  <EditableImage
                    src={img}
                    onChangeSrc={(newUrl) => updateImage(pageKey, sectionIndex, index, newUrl)}
                    onRemove={() => removeImage(pageKey, sectionIndex, index)}
                  >
                    {innerImage}
                  </EditableImage>
                ) : (
                  innerImage
                )}
              </div>
            );
          })}

          {/* Add image card (edit mode only) */}
          {isEditing && (
            <div
              className="flex-shrink-0 self-center"
              style={{ width: `${SLIDE_WIDTH}px` }}
            >
              <input
                ref={addImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadImage(file);
                    addImage(pageKey, sectionIndex, url);
                  } catch (err) {
                    console.error("Image upload failed:", err);
                    alert("Image upload failed. Please try again.");
                  }
                  e.target.value = '';
                }}
              />
              <div
                className="overflow-hidden w-full flex items-center justify-center cursor-pointer"
                style={{
                  aspectRatio: '1440 / 1024',
                  borderRadius: 'var(--radius-card)',
                  border: '2px dashed var(--border)',
                  backgroundColor: 'rgba(0, 0, 0, 0.06)',
                  opacity: 1,
                  transition: 'opacity 150ms ease',
                }}
                onClick={() => addImageInputRef.current?.click()}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.09)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.06)'; }}
              >
                <div className="flex flex-col items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
                  <Plus size={32} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Add Image</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 z-10 cursor-pointer flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 max-md:opacity-100"
            style={{
              left: `calc(50vw - ${SLIDE_WIDTH / 2}px + var(--spacing-20))`,
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--buttons-white-blur)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              transition: `opacity var(--transition-duration) ease`,
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
        )}

        {images.length > 1 && currentIndex < images.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute top-1/2 z-10 cursor-pointer flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 max-md:opacity-100"
            style={{
              right: `calc(50vw - ${SLIDE_WIDTH / 2}px + var(--spacing-20))`,
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--buttons-white-blur)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              transition: `opacity var(--transition-duration) ease`,
            }}
            aria-label="Next image"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>
        )}
      </div>
      )}

      {/* Fullscreen lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: 'var(--spacing-12)',
          }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-0 right-0 z-10 cursor-pointer flex items-center justify-center"
            style={{
              margin: 'var(--spacing-12)',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
            }}
            aria-label="Close fullscreen"
          >
            <X size={24} strokeWidth={2} />
          </button>

          {/* Previous arrow */}
          {images.length > 1 && currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute z-10 cursor-pointer flex items-center justify-center"
              style={{
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
          )}

          {/* Next arrow */}
          {images.length > 1 && currentIndex < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute z-10 cursor-pointer flex items-center justify-center"
              style={{
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
              }}
              aria-label="Next image"
            >
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div
              className="absolute bottom-0 left-1/2 z-10"
              style={{
                transform: 'translateX(-50%)',
                marginBottom: '20px',
                padding: '6px 14px',
                borderRadius: 'var(--radius)',
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
              }}
            >
              {currentIndex + 1} / {images.length}
            </div>
          )}

          <img
            src={images[currentIndex]}
            alt=""
            className="max-w-full max-h-full object-contain"
            style={{
              borderRadius: 'var(--radius-card)',
              width: '100%',
              height: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}
