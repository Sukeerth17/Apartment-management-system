import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Droplets, LogIn } from "lucide-react";

export default function Login() {
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmail.endsWith("@gmail.com")) {
      toast({ title: "Invalid Email", description: "Only @gmail.com addresses are allowed.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { token } = await api.login(gmail, password);
      login(token);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Droplets className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Water Billing account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gmail">Gmail</Label>
              <Input
                id="gmail"
                type="email"
                placeholder="you@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Signing in..." : "Login"}
            </Button>
            <div className="flex justify-between text-sm">
              <Link to="/signup" className="text-primary hover:underline">Create Account</Link>
              <Link to="/forgot-password" className="text-muted-foreground hover:underline">Forgot Password?</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
