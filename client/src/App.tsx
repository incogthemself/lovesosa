import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Customize from "@/pages/Customize";
import EditProfile from "@/pages/EditProfile";
import BrowseProfiles from "@/pages/BrowseProfiles";
import ProfileView from "@/pages/ProfileView";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/customize" component={Customize} />
      <Route path="/browse" component={BrowseProfiles} />
      <Route path="/:username/edit" component={EditProfile} />
      <Route path="/:username" component={ProfileView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
