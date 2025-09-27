import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Steps } from "@shared/schema";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stepsInput, setStepsInput] = useState("");
  const [dateInput, setDateInput] = useState(getTodayDate());

  // Fetch user's steps data
  const { data: stepsData = [], isLoading } = useQuery<Steps[]>({
    queryKey: ["/api/steps", user?.email],
    enabled: !!user?.email,
  });

  const addStepsMutation = useMutation({
    mutationFn: async (data: { userEmail: string; steps: number; date: string }) => {
      const response = await apiRequest("POST", "/api/steps", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/steps", user?.email] });
      toast({
        title: "Success",
        description: `Successfully added ${stepsInput} steps!`,
      });
      setStepsInput("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add steps",
        variant: "destructive",
      });
    },
  });

  const handleAddSteps = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Please log in to add steps",
        variant: "destructive",
      });
      return;
    }

    const steps = parseInt(stepsInput);
    if (isNaN(steps) || steps < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of steps",
        variant: "destructive",
      });
      return;
    }

    addStepsMutation.mutate({
      userEmail: user.email,
      steps,
      date: dateInput,
    });
  };

  const quickAddSteps = (stepCount: number) => {
    setStepsInput(stepCount.toString());
  };

  // Calculate stats
  const todaySteps = stepsData.find((s: Steps) => s.date === getTodayDate())?.steps || 0;
  const weeklySteps = stepsData.slice(0, 7);
  const weeklyAverage = weeklySteps.length > 0 
    ? Math.round(weeklySteps.reduce((sum: number, s: Steps) => sum + s.steps, 0) / weeklySteps.length)
    : 0;
  const goalProgress = Math.round((todaySteps / 10000) * 100);

  return (
    <div className="bg-muted min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                <i className="fas fa-chart-bar text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Health Dashboard</h1>
                <p className="text-muted-foreground" data-testid="text-user-email">
                  {user?.email || "Guest User"}
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <i className="fas fa-calendar text-primary"></i>
                <span>Today: {new Date().toLocaleDateString()}</span>
              </div>
              {user && (
                <Button variant="outline" onClick={logout} data-testid="button-logout">
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Steps</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-today-steps">
                    {todaySteps.toLocaleString()}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                  <i className="fas fa-walking"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Average</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-weekly-average">
                    {weeklyAverage.toLocaleString()}
                  </p>
                </div>
                <div className="bg-secondary/10 text-secondary p-3 rounded-lg">
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Goal Progress</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-goal-progress">
                    {goalProgress}%
                  </p>
                </div>
                <div className="bg-accent/10 text-accent p-3 rounded-lg">
                  <i className="fas fa-target"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="text-total-entries">
                    {stepsData.length}
                  </p>
                </div>
                <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                  <i className="fas fa-fire"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Steps Section (Blue Box) */}
          <div className="bg-primary text-primary-foreground p-8 rounded-lg card-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white/20 p-3 rounded-lg">
                <i className="fas fa-plus text-xl"></i>
              </div>
              <h2 className="text-2xl font-bold">Add Today's Steps</h2>
            </div>
            
            <form onSubmit={handleAddSteps} className="space-y-6">
              <div>
                <Label htmlFor="steps-input" className="block text-sm font-medium mb-3 text-blue-100">
                  Step Count
                </Label>
                <Input
                  type="number"
                  id="steps-input"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full px-4 py-4 rounded-lg text-foreground bg-white border-0 focus:ring-2 focus:ring-white/50 text-lg font-medium"
                  placeholder="Enter your steps (e.g., 8500)"
                  min="0"
                  max="100000"
                  data-testid="input-steps"
                />
              </div>
              
              <div>
                <Label htmlFor="date-input" className="block text-sm font-medium mb-3 text-blue-100">
                  Date
                </Label>
                <Input
                  type="date"
                  id="date-input"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-4 py-4 rounded-lg text-foreground bg-white border-0 focus:ring-2 focus:ring-white/50"
                  data-testid="input-date"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-primary py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-md"
                disabled={addStepsMutation.isPending}
                data-testid="button-save-steps"
              >
                <i className="fas fa-save mr-2"></i>
                {addStepsMutation.isPending ? "Saving..." : "Save Steps"}
              </Button>
            </form>

            {/* Quick Add Buttons */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-sm text-blue-100 mb-3">Quick Add:</p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => quickAddSteps(5000)}
                  className="bg-white/20 hover:bg-white/30 py-2 px-3 rounded-lg text-sm transition-colors"
                  data-testid="button-quick-5000"
                >
                  5,000
                </Button>
                <Button
                  onClick={() => quickAddSteps(7500)}
                  className="bg-white/20 hover:bg-white/30 py-2 px-3 rounded-lg text-sm transition-colors"
                  data-testid="button-quick-7500"
                >
                  7,500
                </Button>
                <Button
                  onClick={() => quickAddSteps(10000)}
                  className="bg-white/20 hover:bg-white/30 py-2 px-3 rounded-lg text-sm transition-colors"
                  data-testid="button-quick-10000"
                >
                  10,000
                </Button>
              </div>
            </div>
          </div>

          {/* View Steps Section (Green Box) */}
          <div className="bg-secondary text-secondary-foreground p-8 rounded-lg card-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <i className="fas fa-history text-xl"></i>
                </div>
                <h2 className="text-2xl font-bold">Recent Activity</h2>
              </div>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/steps", user?.email] })}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                data-testid="button-refresh-steps"
              >
                <i className="fas fa-refresh"></i>
              </Button>
            </div>

            {/* Steps History */}
            <div className="space-y-4 mb-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-2xl mb-4"></i>
                  <p>Loading your step history...</p>
                </div>
              ) : stepsData.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-walking text-4xl mb-4 opacity-50"></i>
                  <p>No steps recorded yet</p>
                  <p className="text-sm text-green-100">Add your first steps entry to get started!</p>
                </div>
              ) : (
                stepsData.slice(0, 5).map((step: Steps) => (
                  <div key={step.id} className="bg-white/10 p-4 rounded-lg" data-testid={`step-entry-${step.id}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">{step.steps.toLocaleString()} steps</p>
                        <p className="text-sm text-green-100">
                          {new Date(step.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
                          Goal: {Math.round((step.steps / 10000) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Weekly Summary */}
            {weeklySteps.length > 0 && (
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">This Week's Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-100">Total Steps</p>
                    <p className="font-semibold text-lg" data-testid="text-weekly-total">
                      {weeklySteps.reduce((sum: number, s: Steps) => sum + s.steps, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-100">Daily Average</p>
                    <p className="font-semibold text-lg" data-testid="text-weekly-avg">
                      {weeklyAverage.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Dashboard Elements */}
        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* Progress Chart Placeholder */}
          <div className="lg:col-span-2">
            <Card className="card-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Weekly Progress</h3>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <i className="fas fa-chart-bar text-4xl mb-4"></i>
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Track your daily progress over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goal Setting */}
          <Card className="card-shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Daily Goal</h3>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary mb-2">10,000</div>
                <p className="text-muted-foreground">Steps per day</p>
              </div>
              <Button className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors" data-testid="button-update-goal">
                Update Goal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
