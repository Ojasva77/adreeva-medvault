import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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

interface BookCardProps {
  book: Tables<"books">;
  progress?: number;
}

const BookCard = ({ book, progress }: BookCardProps) => {
  return (
    <Link to={`/book/${book.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border-border/60 bg-card">
        <div className="aspect-[3/4] relative bg-muted overflow-hidden">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <BookOpen className="h-16 w-16 text-primary/30" />
            </div>
          )}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-foreground/60 to-transparent">
              <div className="flex items-center gap-2">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-xs font-medium text-card">{progress}%</span>
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <Badge variant="secondary" className="text-xs">{categoryLabels[book.category] || book.category}</Badge>
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">{book.title}</h3>
          <p className="text-xs text-muted-foreground">{book.author}</p>
          {book.year && <p className="text-xs text-muted-foreground">{book.year}</p>}
        </CardContent>
      </Card>
    </Link>
  );
};

export default BookCard;
