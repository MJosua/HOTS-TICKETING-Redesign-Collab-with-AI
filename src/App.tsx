
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
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
import Registerpage from "./pages/login/Registerpage";

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

import { fetchDepartments } from "@/store/slices/userManagementSlice";
import { fetchSRF } from "./store/slices/srf_slice";
import { fetchsku } from "./store/slices/SKUslice";
import { fetchMyTickets } from '@/store/slices/ticketsSlice';

import { fetchTaskList, fetchTaskCount } from '@/store/slices/ticketsSlice';

import { AppDispatch } from './store';
import { useAppSelector } from "./hooks/useAppSelector";
import { fetchSrf_Puprose } from "./store/slices/srf_purpose";
import { SidebarProvider } from "./components/ui/sidebar";

const queryClient = new QueryClient();



const AppContentInner = () => {


  const dispatch = useDispatch<AppDispatch>();

  const { taskCount } = useAppSelector(state => state.tickets);



  




  const handleServiceSubmit = useCallback((data: any) => {
    // console.log("Service form submitted:", data);
  }, []);

  const dynamicServiceRoutes = useDynamicServiceRoutes(handleServiceSubmit);

  return (
    <Router basename="/hots">
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<Registerpage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/service-catalog" element={<ProtectedRoute><ServiceCatalog /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
          <Route path="/task-list" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
          <Route path="/help-center" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
          <Route path="/help/user-guide" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
          <Route path="/help/faq" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />
          <Route path="/user-guide" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />
          <Route path="/faq" element={<ProtectedRoute><UserGuide /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/service-catalog" element={<ProtectedRoute><ServiceCatalogAdmin /></ProtectedRoute>} />
          <Route path="/admin/service-catalog/new" element={<ProtectedRoute><ServiceFormEditor /></ProtectedRoute>} />
          <Route path="/admin/service-catalog/create" element={<ProtectedRoute><ServiceFormEditor /></ProtectedRoute>} />
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

const AppContent = () => <AppContentInner />;

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
