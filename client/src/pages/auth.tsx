import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { setUser } = useAuth();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (user) => {
      setUser(user);
      toast({
        title: "Success",
        description: "Successfully logged in!",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: (user) => {
      setUser(user);
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Signup failed",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      signupMutation.mutate({ email, password });
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="card-shadow">
          <CardContent className="p-8">
            {/* Auth Header */}
            <div className="text-center mb-8">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg w-fit mx-auto mb-4">
                <i className="fas fa-walking text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Welcome to HealthStep</h2>
              <p className="text-muted-foreground">Start tracking your health journey today</p>
            </div>

            {/* Toggle Buttons */}
            <div className="flex bg-muted rounded-lg p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-signin-tab"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-signup-tab"
              >
                Sign Up
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                  data-testid="input-email"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  className="w-full"
                  data-testid="input-password"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full"
                    data-testid="input-confirm-password"
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isLogin
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                }`}
                disabled={loginMutation.isPending || signupMutation.isPending}
                data-testid={isLogin ? "button-signin-submit" : "button-signup-submit"}
              >
                {loginMutation.isPending || signupMutation.isPending
                  ? "Processing..."
                  : isLogin
                  ? "Sign In to Dashboard"
                  : "Create Account"}
              </Button>
            </form>

            {/* Demo Access */}
            <div className="mt-6 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setLocation("/dashboard")}
                className="w-full text-muted-foreground hover:text-foreground py-2 text-sm transition-colors"
                data-testid="button-view-demo"
              >
                <i className="fas fa-eye mr-2"></i>
                View Dashboard Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
