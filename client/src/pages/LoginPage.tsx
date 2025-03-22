import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePlayFabAuth } from "@/hooks/usePlayFabAuth";
import { initializePlayFab } from "@/lib/playfab";

const LoginPage = () => {
  const { toast } = useToast();
  const { login, isLoading: loading, error } = usePlayFabAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Initialize PlayFab on component mount
  useEffect(() => {
    initializePlayFab();
  }, []);

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
      toast({
        title: "Success",
        description: "You have successfully logged in",
        variant: "default"
      });
    } catch (err) {
      // Error is displayed via the error state from usePlayFabAuth
      toast({
        title: "Login failed",
        description: error || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleDemoLogin = async () => {
    try {
      await login("demo@example.com", "password");
      toast({
        title: "Success",
        description: "You have successfully logged in with the demo account",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Demo login failed",
        description: error || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/10 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">RunTrackMap</CardTitle>
          <CardDescription>Sign in to track your runs</CardDescription>
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
