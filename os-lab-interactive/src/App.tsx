import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Topics from "./pages/Topics";
import Docs from "./pages/Docs";
import Progress from "./pages/Progress";
import ReportBug from "./pages/ReportBug";
import Auth from "./pages/Auth";
import FCFS from "./pages/topics/FCFS";
import SJF from "./pages/topics/SJF";
import SRTF from "./pages/topics/SRTF";
import RR from "./pages/topics/RR";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/report-bug" element={<ReportBug />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* CPU Scheduling */}
              <Route path="/topics/cpu/fcfs" element={<FCFS />} />
              <Route path="/topics/cpu/sjf" element={<SJF />} />
              <Route path="/topics/cpu/srtf" element={<SRTF />} />
              <Route path="/topics/cpu/rr" element={<RR />} />
              
              {/* Placeholders for other algorithms */}
              <Route path="/topics/memory/*" element={<ComingSoon type="Memory Management" />} />
              <Route path="/topics/disk/*" element={<ComingSoon type="Disk Scheduling" />} />
              <Route path="/topics/sync/*" element={<ComingSoon type="Synchronization" />} />
              <Route path="/topics/process/*" element={<ComingSoon type="Process Management" />} />
              <Route path="/topics/threads/*" element={<ComingSoon type="Threads" />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <footer className="border-t py-6">
            <div className="container text-center text-sm text-muted-foreground">
              <p>OS VLab - Interactive Operating System Virtual Laboratory</p>
            </div>
          </footer>
        </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const ComingSoon = ({ type }: { type: string }) => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="text-center">
      <h1 className="mb-4 text-4xl font-bold">{type}</h1>
      <p className="text-lg text-muted-foreground">
        This simulator is coming soon. Check back later!
      </p>
    </div>
  </div>
);

export default App;
