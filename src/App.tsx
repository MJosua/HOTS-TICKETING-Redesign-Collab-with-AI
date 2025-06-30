
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { TokenExpiredModalWrapper } from "@/components/modals/TokenExpiredModalWrapper";

// Import pages
import Index from "./pages/Index";
import ServiceCatalog from "./pages/ServiceCatalog";
import MyTickets from "./pages/MyTickets";
import TicketDetail from "./pages/TicketDetail";
import TaskList from "./pages/TaskList";
import UserGuide from "./pages/UserGuide";
import HelpCenter from "./pages/HelpCenter";
import NotFound from "./pages/NotFound";
import Loginpage from "./pages/login/Loginpage";

// Admin pages
import ServiceCatalogAdmin from "./pages/admin/ServiceCatalogAdmin";
import ServiceFormEditor from "./pages/admin/ServiceFormEditor";
import UserManagement from "./pages/admin/UserManagement";
import TeamManagement from "./pages/admin/TeamManagement";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import CustomFunctionManagement from "./pages/admin/CustomFunctionManagement";
import FunctionLogsManagement from "./pages/admin/FunctionLogsManagement";
import AdminGuide from "./pages/admin/AdminGuide";

// Dynamic routes
import { DynamicServiceRoutes } from "./components/routing/DynamicServiceRoutes";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Loginpage />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/service-catalog" element={<ProtectedRoute><ServiceCatalog /></ProtectedRoute>} />
                <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
                <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
                <Route path="/task-list" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
                <Route path="/user-guide" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />
                <Route path="/help-center" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
                
                {/* Admin routes */}
                <Route path="/admin/service-catalog" element={<ProtectedRoute><ServiceCatalogAdmin /></ProtectedRoute>} />
                <Route path="/admin/service-catalog/new" element={<ProtectedRoute><ServiceFormEditor /></ProtectedRoute>} />
                <Route path="/admin/service-catalog/edit/:id" element={<ProtectedRoute><ServiceFormEditor /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                <Route path="/admin/teams" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
                <Route path="/admin/departments" element={<ProtectedRoute><DepartmentManagement /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
                <Route path="/admin/custom-functions" element={<ProtectedRoute><CustomFunctionManagement /></ProtectedRoute>} />
                <Route path="/admin/function-logs" element={<ProtectedRoute><FunctionLogsManagement /></ProtectedRoute>} />
                <Route path="/admin/guide" element={<ProtectedRoute><AdminGuide /></ProtectedRoute>} />
                
                {/* Dynamic service routes */}
                <Route path="/service/*" element={<ProtectedRoute><DynamicServiceRoutes /></ProtectedRoute>} />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <TokenExpiredModalWrapper />
              <Toaster />
            </div>
          </Router>
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
