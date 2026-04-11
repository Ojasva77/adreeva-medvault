import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Constants } from "@/integrations/supabase/types";
import { BookOpen, Stethoscope, Brain, Pill, Microscope, Heart, Bone, Eye, Ear, Activity } from "lucide-react";

const categoryLabels: Record<string, string> = {
  anatomy: "Anatomy", physiology: "Physiology", biochemistry: "Biochemistry",
  pharmacology: "Pharmacology", pathology: "Pathology", microbiology: "Microbiology",
  forensic_medicine: "Forensic Medicine", community_medicine: "Community Medicine",
  surgery: "Surgery", medicine: "Medicine", pediatrics: "Pediatrics",
  obstetrics_gynecology: "OB/GYN", ophthalmology: "Ophthalmology", ent: "ENT",
  dermatology: "Dermatology", psychiatry: "Psychiatry", radiology: "Radiology",
  anesthesiology: "Anesthesiology", orthopedics: "Orthopedics", other: "Other",
};

const categoryIcons: Record<string, typeof BookOpen> = {
  anatomy: Bone, physiology: Heart, biochemistry: Microscope,
  pharmacology: Pill, pathology: Microscope, microbiology: Microscope,
  forensic_medicine: Activity, community_medicine: Stethoscope,
  surgery: Stethoscope, medicine: Stethoscope, pediatrics: Heart,
  obstetrics_gynecology: Heart, ophthalmology: Eye, ent: Ear,
  dermatology: Activity, psychiatry: Brain, radiology: Activity,
  anesthesiology: Stethoscope, orthopedics: Bone, other: BookOpen,
};

const categoryColors = [
  "from-primary/15 to-primary/5",
  "from-secondary/15 to-secondary/5",
  "from-accent to-accent/30",
];

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse medical textbooks by specialty</p>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Constants.public.Enums.book_category.map((cat, i) => {
          const Icon = categoryIcons[cat] || BookOpen;
          const gradient = categoryColors[i % categoryColors.length];
          return (
            <Link key={cat} to={`/library?category=${cat}`}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 group border-border/60">
                <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{categoryLabels[cat]}</h3>
                  <p className="text-xs text-muted-foreground">{counts[cat] || 0} book{(counts[cat] || 0) !== 1 ? "s" : ""}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;
