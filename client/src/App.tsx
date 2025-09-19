import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import About from "@/pages/about";
import Compositions from "@/pages/compositions";
import CompositionDetail from "@/pages/composition-detail";
import Recordings from "@/pages/recordings";
import RecordingDetail from "@/pages/recording-detail";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Media from "@/pages/media";
import Contact from "@/pages/contact";
import FYC from "@/pages/fyc";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
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
          <Route component={NotFound} />
        </Switch>
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
