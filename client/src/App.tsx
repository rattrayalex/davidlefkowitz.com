import { Suspense, lazy, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Eagerly load Home page since it's the landing page
import Home from "@/pages/home";

// Lazy load other routes for better performance
const About = lazy(() => import("@/pages/about"));
const Compositions = lazy(() => import("@/pages/compositions"));
const CompositionDetail = lazy(() => import("@/pages/composition-detail"));
const Recordings = lazy(() => import("@/pages/recordings"));
const RecordingDetail = lazy(() => import("@/pages/recording-detail"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const Media = lazy(() => import("@/pages/media"));
const Contact = lazy(() => import("@/pages/contact"));
const FYC = lazy(() => import("@/pages/fyc"));
const ListenNow = lazy(() => import("@/pages/listennow"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component for code splitting
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);


function usePageTitle(location: string) {
  useEffect(() => {
    const seg = location.split("/").filter(Boolean);
    const names: Record<string, string> = {
      "": "David S. Lefkowitz — Composer", about: "About", compositions: "Compositions",
      recordings: "Recordings", blog: "Blog", media: "Media", contact: "Contact",
      fyc: "For Your Consideration",
    };
    let title = "David S. Lefkowitz — Composer";
    if (seg.length === 1 && names[seg[0]]) title = `${names[seg[0]]} — David S. Lefkowitz`;
    else if (seg.length >= 2) title = `${decodeURIComponent(seg[1]).replace(/_/g, " ")} — David S. Lefkowitz`;
    document.title = title;
  }, [location]);
}

function Router() {
  const [location] = useLocation();
  usePageTitle(location);
  const isFYCPage = location === '/fyc' || location === '/fyc/listennow';
  
  return (
    <div className={`min-h-screen flex flex-col ${isFYCPage ? 'fyc-animated-background' : ''}`}>
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/compositions" component={Compositions} />
            <Route path="/compositions/:slug" component={CompositionDetail} />
            <Route path="/recordings" component={Recordings} />
            <Route path="/recordings/:id" component={RecordingDetail} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:id" component={BlogPost} />
            <Route path="/media" component={Media} />
            <Route path="/contact" component={Contact} />
            <Route path="/fyc" component={FYC} />
            <Route path="/fyc/listennow" component={ListenNow} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
    </div>
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
