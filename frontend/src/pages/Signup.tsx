import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Droplets, UserPlus } from "lucide-react";

export default function Signup() {
  const [gmail, setGmail] = useState("");
  const [confirmGmail, setConfirmGmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmail.endsWith("@gmail.com")) {
      toast({ title: "Invalid Email", description: "Only @gmail.com addresses are allowed.", variant: "destructive" });
      return;
    }
    if (gmail !== confirmGmail) {
      toast({ title: "Emails Don't Match", description: "Please make sure both emails are the same.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.register(gmail);
      toast({ title: "Success!", description: "Your password has been sent to your Gmail." });
    } catch (err: any) {
      toast({ title: "Signup Failed", description: err.message, variant: "destructive" });
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up for Water Billing AI</CardDescription>
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
              <Label htmlFor="confirm-gmail">Confirm Gmail</Label>
              <Input
                id="confirm-gmail"
                type="email"
                placeholder="Confirm your Gmail"
                value={confirmGmail}
                onChange={(e) => setConfirmGmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
