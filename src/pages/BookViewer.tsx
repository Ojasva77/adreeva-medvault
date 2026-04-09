import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const BookViewer = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<Tables<"books"> | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchBook = async () => {
      const { data } = await supabase.from("books").select("*").eq("id", id).single();
      if (!data) {
        navigate("/library");
        return;
      }
      setBook(data);

      // Get signed URL for the PDF
      const { data: signedData } = await supabase.storage.from("books").createSignedUrl(data.file_path, 3600);
      if (signedData?.signedUrl) {
        setPdfUrl(signedData.signedUrl);
      }

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        book_id: id,
        action: "view",
      });

      setLoading(false);
    };

    fetchBook();
  }, [id, user, navigate]);

  // Disable right-click
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate text-foreground">{book?.title}</h2>
          <p className="text-xs text-muted-foreground">{book?.author}</p>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-muted">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            title={book?.title}
            style={{ userSelect: "none" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Unable to load PDF. The file may not be available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookViewer;
