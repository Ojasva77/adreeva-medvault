import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";
import type { Tables } from "@/integrations/supabase/types";
import { User, BookOpen, GraduationCap, Mail, IdCard, Calendar, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const groupLabels: Record<string, string> = {
  year_1: "Year 1", year_2: "Year 2", year_3: "Year 3", year_4: "Year 4", year_5: "Year 5",
};

const categoryLabels: Record<string, string> = {
  anatomy: "Anatomy", physiology: "Physiology", biochemistry: "Biochemistry",
  pharmacology: "Pharmacology", pathology: "Pathology", microbiology: "Microbiology",
  forensic_medicine: "Forensic Medicine", community_medicine: "Community Medicine",
  surgery: "Surgery", medicine: "Medicine", pediatrics: "Pediatrics",
  obstetrics_gynecology: "OB/GYN", ophthalmology: "Ophthalmology", ent: "ENT",
  dermatology: "Dermatology", psychiatry: "Psychiatry", radiology: "Radiology",
  anesthesiology: "Anesthesiology", orthopedics: "Orthopedics", other: "Other",
};

const ProfilePage = () => {
  const { user, profile, role, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [studentId, setStudentId] = useState(profile?.student_id || "");
  const [studentGroup, setStudentGroup] = useState(profile?.student_group || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentBooks, setCurrentBooks] = useState<(Tables<"books"> & { current_page: number; total_pages: number | null })[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setStudentId(profile.student_id || "");
      setStudentGroup(profile.student_group || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchCurrentBooks = async () => {
      const { data } = await supabase
        .from("reading_progress")
        .select("current_page, total_pages, books(*)")
        .eq("user_id", user.id)
        .order("last_read_at", { ascending: false })
        .limit(6);
      if (data) {
        const items = data
          .filter((p: any) => p.books)
          .map((p: any) => ({ ...p.books, current_page: p.current_page, total_pages: p.total_pages }));
        setCurrentBooks(items);
      }
    };
    fetchCurrentBooks();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("covers").upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("covers").getPublicUrl(filePath);
    const avatarUrl = urlData.publicUrl;

    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Photo updated!" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      student_id: studentId || null,
      student_group: (studentGroup as any) || null,
    }).eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  const initials = (profile?.full_name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-secondary" />
        <CardContent className="relative pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-card shadow-xl">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-card" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
            <div className="flex-1 pt-2 sm:pt-0 sm:pb-2">
              <h2 className="text-xl font-bold text-foreground">{profile?.full_name || "Student"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="capitalize">{role || "student"}</Badge>
                {profile?.student_group && (
                  <Badge variant="outline">{groupLabels[profile.student_group]}</Badge>
                )}
                {profile?.student_id && (
                  <Badge variant="outline" className="font-mono">{profile.student_id}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Edit Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" /> Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><IdCard className="h-3.5 w-3.5" /> Student ID</Label>
              <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="MED-2026-001" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Year Group</Label>
              <Select value={studentGroup} onValueChange={setStudentGroup}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.student_group.map((g) => (
                    <SelectItem key={g} value={g}>{groupLabels[g]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Currently Reading */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" /> Currently Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentBooks.length > 0 ? (
              <div className="space-y-4">
                {currentBooks.map((book) => {
                  const pct = book.total_pages ? Math.round((book.current_page / book.total_pages) * 100) : 0;
                  return (
                    <div key={book.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {categoryLabels[book.category] || book.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                      </div>
                      <Separator />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <BookOpen className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">No books being read yet</p>
                <p className="text-xs mt-1">Start reading from the library!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Academic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" /> Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{currentBooks.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Books in Progress</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{profile?.student_group ? groupLabels[profile.student_group] : "—"}</p>
              <p className="text-sm text-muted-foreground mt-1">Current Year</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary capitalize">{role || "student"}</p>
              <p className="text-sm text-muted-foreground mt-1">Account Type</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
