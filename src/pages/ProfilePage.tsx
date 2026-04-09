import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";
import { User } from "lucide-react";

const groupLabels: Record<string, string> = {
  year_1: "Year 1", year_2: "Year 2", year_3: "Year 3", year_4: "Year 4", year_5: "Year 5",
};

const ProfilePage = () => {
  const { user, profile, role, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [studentId, setStudentId] = useState(profile?.student_id || "");
  const [studentGroup, setStudentGroup] = useState(profile?.student_group || "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={role || "student"} disabled className="capitalize" />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Student ID</Label>
            <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="MED-2026-001" />
          </div>
          <div className="space-y-2">
            <Label>Year Group</Label>
            <Select value={studentGroup} onValueChange={setStudentGroup}>
              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>
                {Constants.public.Enums.student_group.map((g) => (
                  <SelectItem key={g} value={g}>{groupLabels[g]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
