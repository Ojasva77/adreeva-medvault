import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const BookViewer = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<Tables<"books"> | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    let objectUrl: string | null = null;
    let isActive = true;

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

      if (isActive) {
        setBook(data);
      }

      const { data: fileData, error: fileError } = await supabase.storage
        .from("books")
        .download(data.file_path);

      if (fileError || !fileData) {
        if (isActive) {
          setErrorMessage("Unable to load PDF. The file may not be available.");
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
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, user, navigate]);

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
      <div className="flex items-center gap-4 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">{book?.title}</h2>
          <p className="text-xs text-muted-foreground">{book?.author}</p>
        </div>
      </div>

      <div className="flex-1 bg-muted">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            className="h-full w-full border-0"
            title={book?.title}
            style={{ userSelect: "none" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>{errorMessage ?? "Unable to load PDF. The file may not be available."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookViewer;
