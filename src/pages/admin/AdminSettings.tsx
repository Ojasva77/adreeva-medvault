import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Users, BookOpen } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> System Info</CardTitle>
          <CardDescription>Adreeva MedVault administration panel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• To promote a user to Admin, update their role in the user_roles table via Cloud → Database.</p>
          <p>• Books are stored securely in Cloud Storage with signed URLs for access.</p>
          <p>• All student access is controlled through book permissions by year group.</p>
          <p>• Activity logs track every book access for audit purposes.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
