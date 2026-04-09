import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BookCard from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Constants } from "@/integrations/supabase/types";

const categoryLabels: Record<string, string> = {
  anatomy: "Anatomy", physiology: "Physiology", biochemistry: "Biochemistry",
  pharmacology: "Pharmacology", pathology: "Pathology", microbiology: "Microbiology",
  forensic_medicine: "Forensic Medicine", community_medicine: "Community Medicine",
  surgery: "Surgery", medicine: "Medicine", pediatrics: "Pediatrics",
  obstetrics_gynecology: "OB/GYN", ophthalmology: "Ophthalmology", ent: "ENT",
  dermatology: "Dermatology", psychiatry: "Psychiatry", radiology: "Radiology",
  anesthesiology: "Anesthesiology", orthopedics: "Orthopedics", other: "Other",
};

const LibraryPage = () => {
  const { user, role, profile } = useAuth();
  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [filtered, setFiltered] = useState<Tables<"books">[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const isAdmin = role === "admin";

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase.from("books").select("*").order("title");
      if (!data) return;

      if (!isAdmin && profile?.student_group) {
        const { data: perms } = await supabase.from("book_permissions").select("book_id").eq("student_group", profile.student_group);
        const ids = perms?.map((p) => p.book_id) || [];
        setBooks(data.filter((b) => ids.includes(b.id)));
      } else {
        setBooks(data);
      }
    };
    fetchBooks();
  }, [user, role, profile]);

  useEffect(() => {
    let result = books;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.subject?.toLowerCase().includes(q));
    }
    if (category && category !== "all") {
      result = result.filter((b) => b.category === category);
    }
    setFiltered(result);
  }, [books, search, category]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Library</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title, author, or subject..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Constants.public.Enums.book_category.map((c) => (
              <SelectItem key={c} value={c}>{categoryLabels[c] || c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} book{filtered.length !== 1 ? "s" : ""} found</p>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No books match your search.</p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
