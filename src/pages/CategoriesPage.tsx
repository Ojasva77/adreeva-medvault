import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Constants } from "@/integrations/supabase/types";
import { BookOpen } from "lucide-react";

const categoryLabels: Record<string, string> = {
  anatomy: "Anatomy", physiology: "Physiology", biochemistry: "Biochemistry",
  pharmacology: "Pharmacology", pathology: "Pathology", microbiology: "Microbiology",
  forensic_medicine: "Forensic Medicine", community_medicine: "Community Medicine",
  surgery: "Surgery", medicine: "Medicine", pediatrics: "Pediatrics",
  obstetrics_gynecology: "OB/GYN", ophthalmology: "Ophthalmology", ent: "ENT",
  dermatology: "Dermatology", psychiatry: "Psychiatry", radiology: "Radiology",
  anesthesiology: "Anesthesiology", orthopedics: "Orthopedics", other: "Other",
};

const CategoriesPage = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase.from("books").select("category");
      if (!data) return;
      const map: Record<string, number> = {};
      data.forEach((b) => { map[b.category] = (map[b.category] || 0) + 1; });
      setCounts(map);
    };
    fetchCounts();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Categories</h1>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Constants.public.Enums.book_category.map((cat) => (
          <Link key={cat} to={`/library?category=${cat}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{categoryLabels[cat]}</h3>
                <p className="text-sm text-muted-foreground">{counts[cat] || 0} books</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
