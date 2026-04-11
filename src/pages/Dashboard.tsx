import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BookCard from "@/components/BookCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const initials = (profile?.full_name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome banner */}
      <Card className="bg-gradient-to-r from-primary to-secondary border-0 text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-card/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <CardContent className="flex items-center gap-5 p-6 relative z-10">
          <Avatar className="h-16 w-16 border-2 border-primary-foreground/30 shadow-lg">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name || "Student"}!</h1>
              <Sparkles className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-primary-foreground/80 mt-1">
              {isAdmin ? "Manage your medical library" : "Continue your medical studies"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Books", value: stats.totalBooks, icon: BookOpen, color: "text-primary" },
          { label: "Recently Viewed", value: stats.recentlyViewed, icon: Clock, color: "text-secondary" },
          { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "text-accent-foreground" },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
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
