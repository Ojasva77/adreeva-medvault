import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Document, Page, pdfjs } from "react-pdf";
import PdfToolbar from "@/components/pdf/PdfToolbar";
import PdfSidebar, { BookmarkItem, NoteItem } from "@/components/pdf/PdfSidebar";
import PdfHighlightLayer, { HighlightRect } from "@/components/pdf/PdfHighlightLayer";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const BookViewer = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState<Tables<"books"> | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);

  const [highlightMode, setHighlightMode] = useState(false);
  const [highlights, setHighlights] = useState<HighlightRect[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("bookmarks");

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch book + PDF
  useEffect(() => {
    if (!id || !user) return;
    let isActive = true;
    let objectUrl: string | null = null;

    const fetchBook = async () => {
      setLoading(true);
      setPdfUrl(null);
      setErrorMessage(null);

      const { data, error: bookError } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (bookError || !data) {
        navigate("/library");
        return;
      }
      if (isActive) setBook(data);

      const { data: fileData, error: fileError } = await supabase.storage
        .from("books")
        .download(data.file_path);

      if (fileError || !fileData) {
        if (isActive) {
          setErrorMessage("Unable to load PDF.");
          setLoading(false);
        }
        return;
      }

      objectUrl = URL.createObjectURL(fileData);
      if (isActive) {
        setPdfUrl(objectUrl);
        setLoading(false);
      }

      void supabase.from("activity_logs").insert({
        user_id: user.id,
        book_id: id,
        action: "view",
      });
    };

    void fetchBook();
    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, user, navigate]);

  // Load annotations
  useEffect(() => {
    if (!id || !user) return;

    const loadAnnotations = async () => {
      const [highlightsRes, bookmarksRes, notesRes] = await Promise.all([
        supabase.from("book_highlights").select("*").eq("book_id", id).eq("user_id", user.id),
        supabase.from("book_bookmarks").select("*").eq("book_id", id).eq("user_id", user.id),
        supabase.from("book_notes").select("*").eq("book_id", id).eq("user_id", user.id),
      ]);

      if (highlightsRes.data) {
        setHighlights(
          highlightsRes.data.map((h) => {
            const pos = h.position_data as { x: number; y: number; width: number; height: number };
            return {
              id: h.id,
              x: pos.x,
              y: pos.y,
              width: pos.width,
              height: pos.height,
              color: h.color,
              page_number: h.page_number,
            };
          })
        );
      }
      if (bookmarksRes.data) setBookmarks(bookmarksRes.data);
      if (notesRes.data) setNotes(notesRes.data);
    };

    void loadAnnotations();
  }, [id, user]);

  // Update note input when page changes
  useEffect(() => {
    const existingNote = notes.find((n) => n.page_number === currentPage);
    setCurrentNote(existingNote?.content || "");
  }, [currentPage, notes]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
  }, []);

  const handleAddHighlight = useCallback(
    async (rect: { x: number; y: number; width: number; height: number; text: string }) => {
      if (!id || !user) return;
      const { data, error } = await supabase
        .from("book_highlights")
        .insert({
          user_id: user.id,
          book_id: id,
          page_number: currentPage,
          color: "#FFEB3B",
          selected_text: rect.text || null,
          position_data: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to save highlight");
        return;
      }
      if (data) {
        setHighlights((prev) => [
          ...prev,
          { id: data.id, x: rect.x, y: rect.y, width: rect.width, height: rect.height, color: data.color, page_number: currentPage },
        ]);
        toast.success("Highlight saved");
      }
    },
    [id, user, currentPage]
  );

  const handleDeleteHighlight = useCallback(async (highlightId: string) => {
    const { error } = await supabase.from("book_highlights").delete().eq("id", highlightId);
    if (!error) {
      setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    }
  }, []);

  const handleToggleBookmark = useCallback(async () => {
    if (!id || !user) return;
    const existing = bookmarks.find((b) => b.page_number === currentPage);
    if (existing) {
      const { error } = await supabase.from("book_bookmarks").delete().eq("id", existing.id);
      if (!error) {
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
        toast.success("Bookmark removed");
      }
    } else {
      const { data, error } = await supabase
        .from("book_bookmarks")
        .insert({ user_id: user.id, book_id: id, page_number: currentPage })
        .select()
        .single();
      if (!error && data) {
        setBookmarks((prev) => [...prev, data]);
        toast.success("Page bookmarked");
      }
    }
  }, [id, user, currentPage, bookmarks]);

  const handleDeleteBookmark = useCallback(async (bmId: string) => {
    const { error } = await supabase.from("book_bookmarks").delete().eq("id", bmId);
    if (!error) setBookmarks((prev) => prev.filter((b) => b.id !== bmId));
  }, []);

  const handleSaveNote = useCallback(
    async (page: number, content: string) => {
      if (!id || !user || !content.trim()) return;
      const existing = notes.find((n) => n.page_number === page);
      if (existing) {
        const { error } = await supabase
          .from("book_notes")
          .update({ content })
          .eq("id", existing.id);
        if (!error) {
          setNotes((prev) => prev.map((n) => (n.id === existing.id ? { ...n, content } : n)));
          toast.success("Note updated");
        }
      } else {
        const { data, error } = await supabase
          .from("book_notes")
          .insert({ user_id: user.id, book_id: id, page_number: page, content })
          .select()
          .single();
        if (!error && data) {
          setNotes((prev) => [...prev, data]);
          toast.success("Note saved");
        }
      }
    },
    [id, user, notes]
  );

  const handleDeleteNote = useCallback(async (noteId: string) => {
    const { error } = await supabase.from("book_notes").delete().eq("id", noteId);
    if (!error) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    }
  }, []);

  const isCurrentPageBookmarked = bookmarks.some((b) => b.page_number === currentPage);
  const currentPageHighlights = highlights.filter((h) => h.page_number === currentPage);

  // Disable right click
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PdfToolbar
        title={book?.title}
        author={book?.author}
        currentPage={currentPage}
        totalPages={totalPages}
        scale={scale}
        isBookmarked={isCurrentPageBookmarked}
        highlightMode={highlightMode}
        sidebarOpen={sidebarOpen}
        onPageChange={setCurrentPage}
        onZoomIn={() => setScale((s) => Math.min(s + 0.2, 3))}
        onZoomOut={() => setScale((s) => Math.max(s - 0.2, 0.5))}
        onToggleBookmark={handleToggleBookmark}
        onToggleHighlight={() => setHighlightMode((h) => !h)}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        onOpenNotes={() => {
          setSidebarOpen(true);
          setSidebarTab("notes");
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <PdfSidebar
            bookmarks={bookmarks}
            notes={notes}
            currentPage={currentPage}
            currentNote={currentNote}
            onGoToPage={setCurrentPage}
            onDeleteBookmark={handleDeleteBookmark}
            onDeleteNote={handleDeleteNote}
            onSaveNote={handleSaveNote}
            onCurrentNoteChange={setCurrentNote}
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
          />
        )}

        <div ref={containerRef} className="flex-1 overflow-auto bg-muted">
          {pdfUrl ? (
            <div className="flex justify-center py-4">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                  </div>
                }
              >
                <div className="relative">
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                  <PdfHighlightLayer
                    highlights={currentPageHighlights}
                    highlightMode={highlightMode}
                    scale={scale}
                    onAddHighlight={handleAddHighlight}
                    onDeleteHighlight={handleDeleteHighlight}
                  />
                </div>
              </Document>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>{errorMessage ?? "Unable to load PDF."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookViewer;
