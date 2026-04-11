import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Bookmark,
  BookmarkCheck,
  Highlighter,
  StickyNote,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PdfToolbarProps {
  title?: string;
  author?: string;
  currentPage: number;
  totalPages: number;
  scale: number;
  isBookmarked: boolean;
  highlightMode: boolean;
  sidebarOpen: boolean;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleBookmark: () => void;
  onToggleHighlight: () => void;
  onToggleSidebar: () => void;
  onOpenNotes: () => void;
}

const PdfToolbar = ({
  title,
  author,
  currentPage,
  totalPages,
  scale,
  isBookmarked,
  highlightMode,
  sidebarOpen,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onToggleBookmark,
  onToggleHighlight,
  onToggleSidebar,
  onOpenNotes,
}: PdfToolbarProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <div className="hidden min-w-0 flex-1 sm:block">
        <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
        <p className="truncate text-xs text-muted-foreground">{author}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const p = parseInt(e.target.value);
              if (p >= 1 && p <= totalPages) onPageChange(p);
            }}
            className="h-7 w-12 text-center text-xs"
          />
          <span>/ {totalPages}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut} disabled={scale <= 0.5}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn} disabled={scale >= 3}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-l border-border pl-2">
        <Button
          variant={highlightMode ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={onToggleHighlight}
          title="Highlight mode"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button
          variant={isBookmarked ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={onToggleBookmark}
          title="Bookmark page"
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenNotes} title="Notes">
          <StickyNote className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleSidebar} title="Toggle sidebar">
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default PdfToolbar;
