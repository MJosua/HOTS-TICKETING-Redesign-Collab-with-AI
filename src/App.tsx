
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DynamicForm } from "@/components/forms/DynamicForm";
import Index from "./pages/Index";
import ServiceCatalog from "./pages/ServiceCatalog";
import TaskList from "./pages/TaskList";
import MyTickets from "./pages/MyTickets";
import GoodsRequest from "./pages/GoodsRequest";
import SystemSettings from "./pages/admin/SystemSettings";
import UserManagement from "./pages/admin/UserManagement";
import DivisionManagement from "./pages/admin/DivisionManagement";
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

// IT Support form configuration
const itSupportConfig = {
  url: "/it-support",
  title: "IT Support Request",
  fields: [
    {
      label: "Type of Support*",
      placeholder: "Select Type of Support",
      type: "select",
      options: ["Hardware", "Account", "Software"],
      required: true
    },
    {
      label: "Issue Description",
      placeholder: "Please provide a detailed description of the issues you're experiencing",
      type: "textarea",
      required: true
    },
    {
      label: "Attachment",
      type: "file",
      accept: ["image/*", "pdf", "docx"]
    }
  ],
  approval: {
    steps: ["Supervisor", "IT Team"],
    mode: "sequential" as const
  }
};

const App = () => {
  const handleITSupportSubmit = (data: any) => {
    console.log('IT Support form submitted:', data);
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
              <Route path="/asset-request" element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="text-center py-12">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Asset Request Form</h1>
                      <p className="text-gray-600">This form is under development</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/it-support" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DynamicForm 
                      config={itSupportConfig}
                      onSubmit={handleITSupportSubmit}
                    />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
