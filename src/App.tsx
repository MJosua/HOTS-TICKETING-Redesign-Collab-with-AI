import React, { useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import TokenExpiredModalWrapper from "@/components/modals/TokenExpiredModalWrapper";

// Pages
import Index from "./pages/Index";
import ServiceCatalog from "./pages/ServiceCatalog";
import MyTickets from "./pages/MyTickets";
import TicketDetail from "./pages/TicketDetail";
import TaskList from "./pages/TaskList";
import UserGuide from "./pages/UserGuide";
import HelpCenter from "./pages/HelpCenter";
import NotFound from "./pages/NotFound";
import Loginpage from "./pages/login/Loginpage";

// Admin
import ServiceCatalogAdmin from "./pages/admin/ServiceCatalogAdmin";
import ServiceFormEditor from "./pages/admin/ServiceFormEditor";
import UserManagement from "./pages/admin/UserManagement";
import TeamManagement from "./pages/admin/TeamManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import CustomFunctionManagement from "./pages/admin/CustomFunctionManagement";
import FunctionLogsManagement from "./pages/admin/FunctionLogsManagement";
import AdminGuide from "./pages/admin/AdminGuide";

// Other
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useDynamicServiceRoutes } from "./components/routing/DynamicServiceRoutes";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

const AppContent = () => {
  const handleServiceSubmit = useCallback((data: any) => {
    console.log("Service form submitted:", data);
  }, []);

  const dynamicServiceRoutes = useDynamicServiceRoutes(handleServiceSubmit);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Loginpage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/service-catalog" element={<ProtectedRoute><ServiceCatalog /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
          <Route path="/task-list" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
          <Route path="/help/user-guide" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
          <Route path="/help-center" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
          <Route path="/help/faq" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/service-catalog" element={<ProtectedRoute><ServiceCatalogAdmin /></ProtectedRoute>} />
          <Route path="/admin/service-catalog/new" element={<ProtectedRoute><ServiceFormEditor /></ProtectedRoute>} />
          <Route path="/admin/service-catalog/edit/:id" element={<ProtectedRoute><ServiceFormEditor /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/teams" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
          <Route path="/admin/departments" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
          <Route path="/admin/divisions" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
          <Route path="/admin/custom-functions" element={<ProtectedRoute><CustomFunctionManagement /></ProtectedRoute>} />
          <Route path="/admin/function-logs" element={<ProtectedRoute><FunctionLogsManagement /></ProtectedRoute>} />
          <Route path="/admin/guide" element={<ProtectedRoute><AdminGuide /></ProtectedRoute>} />

          {/* ✅ Dynamic Service Routes (generated from catalog) */}
          {dynamicServiceRoutes}

          {/* Catch-all */}
          <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
        </Routes>

        <TokenExpiredModalWrapper />
        <Toaster />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
