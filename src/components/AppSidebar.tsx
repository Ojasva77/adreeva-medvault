import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Library, FolderOpen, User, Shield, Upload, Activity, LogOut, Settings, BookOpen } from "lucide-react";
import adreevaLogo from "@/assets/adreeva-logo.jpeg";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const AppSidebar = () => {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const isAdmin = role === "admin";

  const studentLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/library", label: "Library", icon: Library },
    { to: "/categories", label: "Categories", icon: FolderOpen },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const adminLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/books", label: "Manage Books", icon: BookOpen },
    { to: "/admin/upload", label: "Upload Book", icon: Upload },
    { to: "/admin/logs", label: "Activity Logs", icon: Activity },
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/library", label: "Library", icon: Library },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-sidebar-border">
        <img src={adreevaLogo} alt="Adreeva Logo" className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-sidebar-foreground leading-tight">Adreeva UCHP</h1>
          <p className="text-xs text-sidebar-foreground/60">MedVault</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            {isAdmin ? <Shield className="h-4 w-4 text-sidebar-primary" /> : <User className="h-4 w-4 text-sidebar-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{role || "student"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
