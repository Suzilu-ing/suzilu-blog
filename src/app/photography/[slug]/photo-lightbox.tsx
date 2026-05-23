"use client";

import { PointerEvent, useCallback, useEffect, useRef, useState } from "react";

interface LightboxImage {
  src: string;
  alt: string;
}

export default function PhotoLightbox() {
  const [image, setImage] = useState<LightboxImage | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef({
    moved: false,
    pointerId: 0,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const zoomScale = 2;

  const getBounds = useCallback(() => {
    const stage = stageRef.current;
    const img = imageRef.current;

    if (!stage || !img) return { maxX: 0, maxY: 0 };

    const stageRect = stage.getBoundingClientRect();
    const imageRect = img.getBoundingClientRect();
    const renderedWidth = zoomed ? imageRect.width / zoomScale : imageRect.width;
    const renderedHeight = zoomed ? imageRect.height / zoomScale : imageRect.height;

    return {
      maxX: Math.max(0, (renderedWidth * zoomScale - stageRect.width) / 2),
      maxY: Math.max(0, (renderedHeight * zoomScale - stageRect.height) / 2),
    };
  }, [zoomed]);

  const clampOffset = useCallback((nextOffset: { x: number; y: number }) => {
    const { maxX, maxY } = getBounds();

    return {
      x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
      y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
    };
  }, [getBounds]);

  const applyRubberBand = useCallback((value: number, limit: number) => {
    if (limit === 0) return value * 0.18;
    if (Math.abs(value) <= limit) return value;

    const overflow = Math.abs(value) - limit;
    return Math.sign(value) * (limit + overflow * 0.22);
  }, []);

  const rubberBandOffset = useCallback((nextOffset: { x: number; y: number }) => {
    const { maxX, maxY } = getBounds();

    return {
      x: applyRubberBand(nextOffset.x, maxX),
      y: applyRubberBand(nextOffset.y, maxY),
    };
  }, [applyRubberBand, getBounds]);

  const closeLightbox = () => {
    setImage(null);
    setZoomed(false);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (!target.closest(".dbx-photo-hero, .dbx-post__body")) return;

      setImage({
        src: target.currentSrc || target.src,
        alt: target.alt,
      });
      setZoomed(false);
      setOffset({ x: 0, y: 0 });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
    };

    document.body.classList.add("dbx-lightbox-open");
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("dbx-lightbox-open");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [image]);

  useEffect(() => {
    if (!zoomed) return;

    const handleResize = () => {
      setOffset((current) => clampOffset(current));
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [clampOffset, zoomed]);

  if (!image) return null;

  const handleImageClick = () => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }

    setZoomed((current) => {
      if (current) {
        setOffset({ x: 0, y: 0 });
        return false;
      }

      return true;
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (!zoomed) return;

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!zoomed || !dragging || dragRef.current.pointerId !== event.pointerId) return;

    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.moved = true;
    }

    setOffset(
      rubberBandOffset({
        x: dragRef.current.originX + dx,
        y: dragRef.current.originY + dy,
      }),
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLSpanElement>) => {
    if (dragRef.current.pointerId === event.pointerId) {
      setDragging(false);
      setOffset((current) => clampOffset(current));
    }
  };

  return (
    <div
      className="dbx-lightbox"
      onClick={closeLightbox}
      role="presentation"
    >
      <span
        ref={stageRef}
        className={[
          "dbx-lightbox__stage",
          zoomed ? "dbx-lightbox__stage--zoomed" : "",
          dragging ? "dbx-lightbox__stage--dragging" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className="dbx-lightbox__pan"
          data-dragging={dragging ? "true" : "false"}
          onClick={(event) => {
            event.stopPropagation();
            handleImageClick();
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          }}
        >
          <img
            ref={imageRef}
            src={image.src}
            alt={image.alt}
            className="dbx-lightbox__img"
            draggable={false}
            style={{
              transform: zoomed ? `scale(${zoomScale})` : "scale(1)",
            }}
          />
        </span>
      </span>
    </div>
  );
}
