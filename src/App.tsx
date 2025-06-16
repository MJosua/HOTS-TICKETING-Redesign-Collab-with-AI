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
import ServiceCatalogAdmin from "./pages/admin/ServiceCatalogAdmin";
import ServiceFormEditor from "./pages/admin/ServiceFormEditor";
import NotFound from "./pages/NotFound";
import Login from "./pages/login/Loginpage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TicketDetail from "./pages/TicketDetail";
import RecoveryForm from "./pages/login/form/Recoveryform";
import { FormConfig } from "@/types/formTypes";

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

const assetRequest: FormConfig = {
  url: "/asset-request",
  title: "Laptop Asset Request",
  fields: [
    {
      label: "Job Description**",
      placeholder: "Please describe your specific part of the job for why you need another laptop",
      type: "textarea",
      required: true
    },
    {
      label: "Laptop Specification *",
      type: "radio",
      required: true,
      options: ["Standard", "Analyst", "Marketing"]
    },
    {
      label: "Do you have an Indofood asset PC/Laptop that you are currently using?",
      type: "toggle",
      default: "off"
    },
    {
      label: "Date of Acquisition of the Used Asset *",
      type: "date",
      required: true,
      uiCondition: "show if toggle is on"
    },
    {
      label: "Used Laptop Specification**",
      type: "select",
      options: ["Standard", "Analyst", "Marketing"],
      required: false,
      uiCondition: "show if toggle is on"
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
      placeholder: "Please provide a detailed description of the issues you're experiencing",
      type: "textarea",
      required: true
    },
    {
      label: "Issue Solution*",
      placeholder: "You may not have any solution, but if you have, please provide a detailed description of solution you're thinking",
      type: "textarea",
      required: true
    },
    {
      label: "Attachment*",
      note: "Attachment cannot exceed 5 MB in size.",
      type: "file",
      accept: ["image/*", "pdf", "docx"]
    }
  ]
};

const srForm: FormConfig = {
  url: "/sample-request-form",
  title: "Sample Request Form",
  sections: [
    {
      title: "Data",
      rowGroups: [
        {
          rowGroup: [
            { label: "Request By", type: "text", readonly: true, value: "Yosua Gultom", required: true },
            { label: "Division", type: "text", readonly: true, value: "IOD", required: true },
            { label: "Location", type: "text", readonly: true, value: "INDOFOOD TOWER LT.23", required: true }
          ]
        },
        {
          rowGroup: [
            { label: "Sample Category", type: "select", options: [], required: true },
            { label: "Plant", type: "select", options: [], required: true },
            { label: "Deliver To", type: "select", options: [], required: true }
          ]
        },
        {
          rowGroup: [
            { label: "SRF No", type: "text", value: "XXX", required: true },
            { label: "Purpose", type: "text", placeholder: "purpose", required: true }
          ]
        }
      ]
    },
    {
      title: "Item",
      repeatable: true,
      fields: [
        { label: "Item Name", type: "text", required: true },
        { label: "Quantity", type: "number", required: true }
      ],
      addButton: "Add Item",
      summary: {
        label: "Total",
        type: "number",
        calculated: true
      }
    },
    {
      title: "Notes",
      fields: [
        { label: "Notes", type: "textarea", placeholder: "notes", required: false }
      ]
    },
    {
      title: "Upload",
      fields: [
        {
          label: "Upload Files",
          type: "file",
          accept: ["image/*", "pdf", "docx"],
          maxSizeMB: 5,
          multiple: true
        }
      ]
    }
  ],
  submit: {
    label: "Submit",
    type: "button",
    action: "/submit-sample-request"
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

              <Route path="/service-catalog/asset-request" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DynamicForm
                      config={assetRequest}
                      onSubmit={handleITSupportSubmit}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/service-catalog/it-support" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DynamicForm
                      config={itSupportConfig}
                      onSubmit={handleITSupportSubmit}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/service-catalog/idea-bank" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DynamicForm
                      config={ideaBank}
                      onSubmit={handleITSupportSubmit}
                    />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/service-catalog/sample-request-form" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DynamicForm
                      config={srForm}
                      onSubmit={handleITSupportSubmit}
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
