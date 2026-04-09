import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BookCard from "@/components/BookCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, TrendingUp, Users } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const Dashboard = () => {
  const { user, role, profile } = useAuth();
  const [recentBooks, setRecentBooks] = useState<Tables<"books">[]>([]);
  const [continueReading, setContinueReading] = useState<(Tables<"books"> & { progress: number })[]>([]);
  const [stats, setStats] = useState({ totalBooks: 0, recentlyViewed: 0, inProgress: 0 });
  const isAdmin = role === "admin";

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch books based on permissions
      const { data: books } = await supabase.from("books").select("*").order("created_at", { ascending: false }).limit(8);
      
      if (books) {
        if (!isAdmin && profile?.student_group) {
          const { data: permissions } = await supabase.from("book_permissions").select("book_id").eq("student_group", profile.student_group);
          const allowedIds = permissions?.map((p) => p.book_id) || [];
          const filtered = books.filter((b) => allowedIds.includes(b.id));
          setRecentBooks(filtered);
        } else {
          setRecentBooks(books || []);
        }
      }

      // Fetch reading progress
      const { data: progress } = await supabase.from("reading_progress").select("*, books(*)").eq("user_id", user.id).order("last_read_at", { ascending: false }).limit(4);

      if (progress) {
        const items = progress
          .filter((p: any) => p.books)
          .map((p: any) => ({
            ...p.books,
            progress: p.total_pages ? Math.round((p.current_page / p.total_pages) * 100) : 0,
          }));
        setContinueReading(items);
      }

      // Stats
      const { count: totalBooks } = await supabase.from("books").select("*", { count: "exact", head: true });
      const { count: inProgress } = await supabase.from("reading_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id);

      setStats({
        totalBooks: totalBooks || 0,
        recentlyViewed: progress?.length || 0,
        inProgress: inProgress || 0,
      });
    };

    fetchData();
  }, [user, role, profile]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name || "Student"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? "Manage your medical library" : "Continue your medical studies"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recently Viewed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentlyViewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
      </div>

      {continueReading.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Continue Reading</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {continueReading.map((book) => (
              <BookCard key={book.id} book={book} progress={book.progress} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          {isAdmin ? "Recent Uploads" : "Available for You"}
        </h2>
        {recentBooks.length > 0 ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {recentBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4" />
              <p>No books available yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
