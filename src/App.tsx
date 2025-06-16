
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CatalogFormLoader } from "@/components/forms/CatalogFormLoader";
import Index from "./pages/Index";
import ServiceCatalog from "./pages/ServiceCatalog";
import TaskList from "./pages/TaskList";
import MyTickets from "./pages/MyTickets";
import GoodsRequest from "./pages/GoodsRequest";
import SystemSettings from "./pages/admin/SystemSettings";
import UserManagement from "./pages/admin/UserManagement";
import DivisionManagement from "./pages/admin/DivisionManagement";
import ServiceCatalogAdmin from "./pages/admin/ServiceCatalogAdmin";
import ServiceFormEditor from "./pages/admin/ServiceFormEditor";
import NotFound from "./pages/NotFound";
import Login from "./pages/login/Loginpage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TicketDetail from "./pages/TicketDetail";
import RecoveryForm from "./pages/login/form/Recoveryform";

// Create QueryClient instance outside of component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // Handle form submission logic here
  };

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />

              <Route path="/forgot-password/:token" element={<RecoveryForm />} />

              <Route path="/service-catalog" element={
                <ProtectedRoute>
                  <ServiceCatalog />
                </ProtectedRoute>
              } />

              <Route path="/service-catalog/asset-request" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CatalogFormLoader
                      servicePath="asset-request"
                      onSubmit={handleFormSubmit}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/service-catalog/it-support" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CatalogFormLoader
                      servicePath="it-support"
                      onSubmit={handleFormSubmit}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/service-catalog/idea-bank" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CatalogFormLoader
                      servicePath="idea-bank"
                      onSubmit={handleFormSubmit}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/service-catalog/sample-request-form" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CatalogFormLoader
                      servicePath="sample-request-form"
                      onSubmit={handleFormSubmit}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/task-list" element={
                <ProtectedRoute>
                  <TaskList />
                </ProtectedRoute>
              } />
              <Route path="/my-tickets" element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              } />
              <Route path="/ticket/:id" element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              } />
              <Route path="/goods-request" element={
                <ProtectedRoute>
                  <AppLayout>
                    <GoodsRequest />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <SystemSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/divisions" element={
                <ProtectedRoute>
                  <DivisionManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/service-catalog" element={
                <ProtectedRoute>
                  <ServiceCatalogAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/service-catalog/create" element={
                <ProtectedRoute>
                  <ServiceFormEditor />
                </ProtectedRoute>
              } />
              <Route path="/admin/service-catalog/edit/:id" element={
                <ProtectedRoute>
                  <ServiceFormEditor />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
