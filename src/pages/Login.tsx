import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Lock, Mail } from "lucide-react";
import adreevaLogo from "@/assets/adreeva-logo.jpeg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-secondary/5 rounded-full" />
        
        <div className="relative z-10 text-center space-y-8 max-w-md">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/20">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-primary-foreground">MedVault</h2>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Your secure gateway to medical knowledge. Access textbooks, research papers, and educational resources anytime, anywhere.
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">500+</div>
              <div className="text-sm text-primary-foreground/60">Books</div>
            </div>
            <div className="w-px h-10 bg-primary-foreground/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">20+</div>
              <div className="text-sm text-primary-foreground/60">Categories</div>
            </div>
            <div className="w-px h-10 bg-primary-foreground/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">24/7</div>
              <div className="text-sm text-primary-foreground/60">Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4">
            <img
              src={adreevaLogo}
              alt="Adreeva University College of Health Professions"
              className="h-20 w-20 rounded-2xl object-cover shadow-lg ring-2 ring-border"
            />
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-foreground">
                Adreeva University College
              </h1>
              <p className="text-sm text-muted-foreground">
                College of Health Professions
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-xl bg-card">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Sign in to access your medical library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@adreeva.edu"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Create account
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Adreeva University. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
