import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import HistoryPage from "@/pages/HistoryPage";
import StatsPage from "@/pages/StatsPage";
import ProfilePage from "@/pages/ProfilePage";
import BottomNavigation from "@/components/BottomNavigation";
import { useState, useEffect } from "react";

function Router() {
  const [location] = useLocation();
  
  // Determine active tab based on current location
  const getActiveTab = () => {
    if (location === "/") return "home";
    if (location === "/history") return "history";
    if (location === "/stats") return "stats";
    if (location === "/profile") return "profile";
    return "home";
  };

  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/stats" component={StatsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation activeTab={getActiveTab()} />
    </>
  );
}

function App() {
  // Load user session
  useEffect(() => {
    // Check for user session on app load
    // This would typically check for a session cookie
    const checkSession = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include'
        });
        // If session exists, user will be logged in
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };
    
    checkSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="relative h-screen overflow-hidden bg-neutral-100 text-foreground">
        <Router />
        <Toaster />
      </main>
    </QueryClientProvider>
  );
}

export default App;
