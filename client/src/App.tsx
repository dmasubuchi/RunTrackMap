import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import HistoryPage from "@/pages/HistoryPage";
import StatsPage from "@/pages/StatsPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import BottomNavigation from "@/components/BottomNavigation";
import PrivateRoute from "@/components/PrivateRoute";
import { PlayFabAuthProvider } from "@/hooks/usePlayFabAuth";

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

  // Only show bottom navigation when not on the login page
  const showNav = location !== "/login";

  return (
    <>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/">
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        </Route>
        <Route path="/history">
          <PrivateRoute>
            <HistoryPage />
          </PrivateRoute>
        </Route>
        <Route path="/stats">
          <PrivateRoute>
            <StatsPage />
          </PrivateRoute>
        </Route>
        <Route path="/profile">
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
      {showNav && <BottomNavigation activeTab={getActiveTab()} />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlayFabAuthProvider>
        <main className="relative h-screen overflow-hidden bg-background text-foreground">
          <Router />
          <Toaster />
        </main>
      </PlayFabAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
