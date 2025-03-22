import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const LoginPage = () => {
  const { toast } = useToast();
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Required fields",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await login(username, password);
    } catch (error) {
      // Error handling is done in the useAuth hook
    }
  };
  
  const handleDemoLogin = async () => {
    try {
      await login("demo", "password");
    } catch (error) {
      // Error handling is done in the useAuth hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/10 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Run Tracker Pro</CardTitle>
          <CardDescription>Sign in to track your activity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Demo Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;