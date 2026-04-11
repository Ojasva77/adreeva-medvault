import { useEffect, useRef } from "react";

export interface HighlightRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  page_number: number;
}

interface PdfHighlightLayerProps {
  highlights: HighlightRect[];
  highlightMode: boolean;
  scale: number;
  onAddHighlight: (rect: { x: number; y: number; width: number; height: number; text: string }) => void;
  onDeleteHighlight: (id: string) => void;
}

const PdfHighlightLayer = ({
  highlights,
  highlightMode,
  scale,
  onAddHighlight,
  onDeleteHighlight,
}: PdfHighlightLayerProps) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const isSelecting = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!highlightMode || !layerRef.current) return;

    const layer = layerRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      if (!highlightMode) return;
      const rect = layer.getBoundingClientRect();
      isSelecting.current = true;
      startPos.current = {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale,
      };
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isSelecting.current) return;
      isSelecting.current = false;

      const rect = layer.getBoundingClientRect();
      const endX = (e.clientX - rect.left) / scale;
      const endY = (e.clientY - rect.top) / scale;

      const x = Math.min(startPos.current.x, endX);
      const y = Math.min(startPos.current.y, endY);
      const width = Math.abs(endX - startPos.current.x);
      const height = Math.abs(endY - startPos.current.y);

      if (width > 5 && height > 5) {
        const selection = window.getSelection();
        const text = selection?.toString() || "";
        onAddHighlight({ x, y, width, height, text });
        selection?.removeAllRanges();
      }
    };

    layer.addEventListener("mousedown", handleMouseDown);
    layer.addEventListener("mouseup", handleMouseUp);

    return () => {
      layer.removeEventListener("mousedown", handleMouseDown);
      layer.removeEventListener("mouseup", handleMouseUp);
    };
  }, [highlightMode, scale, onAddHighlight]);

  return (
    <div
      ref={layerRef}
      className="pointer-events-auto absolute inset-0"
      style={{ cursor: highlightMode ? "crosshair" : "default" }}
    >
      {highlights.map((h) => (
        <div
          key={h.id}
          className="group absolute"
          style={{
            left: h.x * scale,
            top: h.y * scale,
            width: h.width * scale,
            height: h.height * scale,
            backgroundColor: h.color,
            opacity: 0.3,
            borderRadius: 2,
          }}
        >
          <button
            className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground group-hover:flex"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteHighlight(h.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default PdfHighlightLayer;
