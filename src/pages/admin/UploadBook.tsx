import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";
import { Upload } from "lucide-react";

const categoryLabels: Record<string, string> = {
  anatomy: "Anatomy", physiology: "Physiology", biochemistry: "Biochemistry",
  pharmacology: "Pharmacology", pathology: "Pathology", microbiology: "Microbiology",
  forensic_medicine: "Forensic Medicine", community_medicine: "Community Medicine",
  surgery: "Surgery", medicine: "Medicine", pediatrics: "Pediatrics",
  obstetrics_gynecology: "OB/GYN", ophthalmology: "Ophthalmology", ent: "ENT",
  dermatology: "Dermatology", psychiatry: "Psychiatry", radiology: "Radiology",
  anesthesiology: "Anesthesiology", orthopedics: "Orthopedics", other: "Other",
};

const groupLabels: Record<string, string> = {
  year_1: "Year 1", year_2: "Year 2", year_3: "Year 3", year_4: "Year 4", year_5: "Year 5",
};

const UploadBook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const toggleGroup = (group: string) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !user) return;
    setLoading(true);

    try {
      // Upload PDF
      const pdfPath = `${Date.now()}-${pdfFile.name}`;
      const { error: pdfError } = await supabase.storage.from("books").upload(pdfPath, pdfFile);
      if (pdfError) throw pdfError;

      // Upload cover if provided
      let coverUrl: string | null = null;
      if (coverFile) {
        const coverPath = `${Date.now()}-${coverFile.name}`;
        const { error: coverError } = await supabase.storage.from("covers").upload(coverPath, coverFile);
        if (!coverError) {
          const { data: urlData } = supabase.storage.from("covers").getPublicUrl(coverPath);
          coverUrl = urlData.publicUrl;
        }
      }

      // Insert book record
      const { data: book, error: bookError } = await supabase.from("books").insert({
        title,
        author,
        subject: subject || null,
        category: category as any,
        year: year ? parseInt(year) : null,
        description: description || null,
        file_path: pdfPath,
        file_size: pdfFile.size,
        cover_url: coverUrl,
        uploaded_by: user.id,
      }).select().single();

      if (bookError) throw bookError;

      // Insert permissions
      if (book && selectedGroups.length > 0) {
        const perms = selectedGroups.map((g) => ({
          book_id: book.id,
          student_group: g as any,
        }));
        await supabase.from("book_permissions").insert(perms);
      }

      toast({ title: "Book uploaded successfully!" });
      navigate("/admin/books");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }

    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Upload Book</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Book Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Author *</Label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.book_category.map((c) => (
                    <SelectItem key={c} value={c}>{categoryLabels[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>PDF File *</Label>
              <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} required />
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>Access Permissions</Label>
              <div className="grid grid-cols-3 gap-2">
                {Constants.public.Enums.student_group.map((g) => (
                  <label key={g} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={selectedGroups.includes(g)} onCheckedChange={() => toggleGroup(g)} />
                    {groupLabels[g]}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Uploading..." : "Upload Book"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadBook;
