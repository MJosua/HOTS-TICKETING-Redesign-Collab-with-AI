
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
import { FormConfig } from "@/types/formTypes";
import TokenExpiredModalWrapper from "@/components/modals/TokenExpiredModalWrapper";
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

// IT Support form configuration
const itSupportConfig: FormConfig = {
  url: "/it-support",
  title: "IT Support Request",
  fields: [
    {
      label: "Type of Support*",
      name: "support_type",
      placeholder: "Select Type of Support",
      type: "select",
      options: ["Hardware", "Account", "Software"],
      required: true,
      columnSpan: 2
    },
    {
      label: "Priority",
      name: "priority",
      type: "select",
      options: ["High", "Medium", "Low"],
      required: true,
      columnSpan: 1
    },
    {
      label: "Issue Description",
      name: "issue_description",
      placeholder: "Please provide a detailed description of the issues you're experiencing",
      type: "textarea",
      required: true,
      columnSpan: 3
    },
    {
      label: "Attachment",
      name: "attachment",
      type: "file",
      accept: ["image/*", "pdf", "docx"],
      columnSpan: 3
    }
  ],
  approval: {
    steps: ["Supervisor", "IT Team"],
    mode: "sequential" as const
  }
};

const assetRequest: FormConfig = {
  url: "/asset-request",
  title: "Laptop Asset Request",
  fields: [
    {
      label: "Job Description**",
      name: "job_description",
      placeholder: "Please describe your specific part of the job for why you need another laptop",
      type: "textarea",
      required: true,
      columnSpan: 3
    },
    {
      label: "Laptop Specification *",
      name: "laptop_specification",
      type: "radio",
      required: true,
      options: ["Standard", "Analyst", "Marketing"],
      columnSpan: 2
    },
    {
      label: "Current Asset",
      name: "has_current_asset",
      type: "toggle",
      default: "off",
      columnSpan: 1
    },
    {
      label: "Date of Acquisition of the Used Asset *",
      name: "acquisition_date",
      type: "date",
      required: true,
      uiCondition: "show if toggle is on",
      columnSpan: 2
    },
    {
      label: "Used Laptop Specification**",
      name: "used_laptop_spec",
      type: "select",
      options: ["Standard", "Analyst", "Marketing"],
      required: false,
      uiCondition: "show if toggle is on",
      columnSpan: 1
    }
  ],
  approval: {
    steps: ["Supervisor", "IT Team"],
    mode: "sequential" as const
  }
};

const ideaBank: FormConfig = {
  url: "/idea-bank",
  title: "Idea Bank",
  fields: [
    {
      label: "Issue Detail*",
      name: "issue_detail",
      placeholder: "Please provide a detailed description of the issues you're experiencing",
      type: "textarea",
      required: true,
      columnSpan: 3
    },
    {
      label: "Issue Solution*",
      name: "issue_solution",
      placeholder: "You may not have any solution, but if you have, please provide a detailed description of solution you're thinking",
      type: "textarea",
      required: true,
      columnSpan: 3
    },
    {
      label: "Attachment*",
      name: "attachment",
      note: "Attachment cannot exceed 5 MB in size.",
      type: "file",
      accept: ["image/*", "pdf", "docx"],
      columnSpan: 3
    }
  ]
};


const srForm: FormConfig = {
  url: "/sample-request-form",
  title: "Sample Request Form",
  sections: [
    {
      title: "Basic Information",
      fields: [
        {
          label: "Request By",
          name: "request_by",
          type: "text",
          readonly: true,
          value: "Yosua Gultom",
          required: true,
          columnSpan: 1
        },
        {
          label: "Division",
          name: "division",
          type: "text",
          readonly: true,
          value: "IOD",
          required: true,
          columnSpan: 1
        },
        {
          label: "Location",
          name: "location",
          type: "text",
          readonly: true,
          value: "INDOFOOD TOWER LT.23",
          required: true,
          columnSpan: 1
        },
        {
          label: "Sample Category",
          name: "sample_category",
          type: "select",
          options: [],
          required: true,
          columnSpan: 1
        },
        {
          label: "Plant",
          name: "plant",
          type: "select",
          options: [],
          required: true,
          columnSpan: 1
        },
        {
          label: "Deliver To",
          name: "deliver_to",
          type: "select",
          options: [],
          required: true,
          columnSpan: 1
        },
        {
          label: "SRF No",
          name: "srf_no",
          type: "text",
          value: "XXX",
          required: true,
          columnSpan: 1
        },
        {
          label: "Purpose",
          name: "purpose",
          type: "text",
          placeholder: "purpose",
          required: true,
          columnSpan: 2
        },
        // ... other basic fields
      ]
    },
    {
      title: "Items", // This is the repeatable section
      repeatable: true,
      fields: [
        {
          label: "Item Name",
          name: "item_name",
          type: "text",
          required: true,
          columnSpan: 2
        },
        {
          label: "Quantity",
          name: "quantity",
          type: "number",
          required: true,
          columnSpan: 1
        }
      ],
      addButton: "Add Item",
      summary: {
        label: "Total Items",
        type: "number",
        calculated: true
      }
    },
    {
      title: "Additional Information",
      fields: [
        {
          label: "Notes",
          name: "notes",
          type: "textarea",
          placeholder: "notes",
          required: false,
          columnSpan: 2
        }
        // ... other fields
      ]
    }
  ],
  submit: {
    label: "Submit",
    type: "button",
    action: "/submit-sample-request"
  }
};


const AppContent = () => {
  const { isTokenExpiredModalOpen, closeTokenExpiredModal, username } = useTokenExpiration();

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // Handle form submission logic here
  };

  return (
    <>
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
          <Route path="*" element={
            <AppLayout>
              <NotFound />
            </AppLayout>
          } />
        </Routes>
      </BrowserRouter>
      
      <TokenExpiredModal
        isOpen={isTokenExpiredModalOpen}
        onClose={closeTokenExpiredModal}
        username={username}
      />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
