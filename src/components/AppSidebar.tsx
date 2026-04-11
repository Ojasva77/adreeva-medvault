import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Library, FolderOpen, User, Shield, Upload, Activity, LogOut, Settings, BookOpen } from "lucide-react";
import adreevaLogo from "@/assets/adreeva-logo.jpeg";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const initials = (profile?.full_name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <img src={adreevaLogo} alt="Adreeva Logo" className="h-10 w-10 rounded-lg object-cover shadow-sm" />
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-sidebar-foreground leading-tight">Adreeva UCHP</h1>
          <p className="text-xs text-sidebar-primary font-medium">MedVault</p>
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 border border-sidebar-border">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-primary text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
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
