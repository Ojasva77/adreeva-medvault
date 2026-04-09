import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const categoryLabels: Record<string, string> = {
  anatomy: "Anatomy", physiology: "Physiology", biochemistry: "Biochemistry",
  pharmacology: "Pharmacology", pathology: "Pathology", microbiology: "Microbiology",
  forensic_medicine: "Forensic Medicine", community_medicine: "Community Medicine",
  surgery: "Surgery", medicine: "Medicine", pediatrics: "Pediatrics",
  obstetrics_gynecology: "OB/GYN", ophthalmology: "Ophthalmology", ent: "ENT",
  dermatology: "Dermatology", psychiatry: "Psychiatry", radiology: "Radiology",
  anesthesiology: "Anesthesiology", orthopedics: "Orthopedics", other: "Other",
};

const ManageBooks = () => {
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    setBooks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleDelete = async (book: Tables<"books">) => {
    if (!confirm(`Delete "${book.title}"?`)) return;

    // Delete file from storage
    await supabase.storage.from("books").remove([book.file_path]);
    
    const { error } = await supabase.from("books").delete().eq("id", book.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Book deleted" });
      fetchBooks();
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manage Books</h1>
        <Button asChild>
          <Link to="/admin/upload"><Plus className="mr-2 h-4 w-4" /> Upload Book</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell><Badge variant="secondary">{categoryLabels[book.category]}</Badge></TableCell>
                  <TableCell>{formatSize(book.file_size)}</TableCell>
                  <TableCell>{book.year || "—"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(book)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {books.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No books uploaded yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageBooks;
