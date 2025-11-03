import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Upload } from "./components/Upload";
import { Camera } from "./components/Camera";
import { History } from "./components/History";
import { Settings } from "./components/Settings";
import { Results } from "./components/Results";
import { Dashboard } from "./components/Dashboard";
import { Flashcards } from "./components/Flashcards";
import { StudyGroups } from "./components/StudyGroups";
import { Achievements } from "./components/Achievements";
import { DailyChallenge } from "./components/DailyChallenge";
import { StudyBuddyAI } from "./components/StudyBuddyAI";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/study-groups" element={<StudyGroups />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/daily-challenge" element={<DailyChallenge />} />
          <Route path="/study-buddy" element={<StudyBuddyAI />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
