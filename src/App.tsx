
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import ServiceCatalog from "./pages/ServiceCatalog";
import TaskList from "./pages/TaskList";
import GoodsRequest from "./pages/GoodsRequest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/service-catalog" element={
            <AppLayout>
              <ServiceCatalog />
            </AppLayout>
          } />
          <Route path="/task-list" element={
            <AppLayout>
              <TaskList />
            </AppLayout>
          } />
          <Route path="/goods-request" element={
            <AppLayout>
              <GoodsRequest />
            </AppLayout>
          } />
          <Route path="/asset-request" element={
            <AppLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Asset Request Form</h1>
                <p className="text-gray-600">This form is under development</p>
              </div>
            </AppLayout>
          } />
          <Route path="/it-support" element={
            <AppLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">IT Support Request</h1>
                <p className="text-gray-600">This form is under development</p>
              </div>
            </AppLayout>
          } />
          <Route path="/my-tickets" element={
            <AppLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">My Tickets</h1>
                <p className="text-gray-600">This page is under development</p>
              </div>
            </AppLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
