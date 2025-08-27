import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { FormConfig } from '@/types/formTypes';

const FormBuilder = () => {
  const [selectedForm, setSelectedForm] = useState<FormConfig | null>(null);

  // Enhanced Asset Request Form with System Variables
  const assetRequestFormV1: FormConfig = {
    url: "/asset-request",
    title: "Asset Request Form",
    category: "IT", // Add missing category
    fields: [
      {
        name: "requestedBy",
        label: "Requested By *",
        type: "text",
        default: "${user}",
        readonly: true,
        required: true,
        columnSpan: 1
      },
      {
        name: "department",
        label: "Department *",
        type: "select",
        options: ["${departments}"],
        default: "${user.department}",
        required: true,
        columnSpan: 1
      },
      {
        name: "supervisor",
        label: "Supervisor",
        type: "select", 
        options: ["${superior}"],
        required: false,
        columnSpan: 1
      },
      {
        name: "assetType",
        label: "Asset Type *",
        type: "select",
        options: ["Laptop", "Desktop", "Monitor", "Printer", "Phone"],
        required: true,
        columnSpan: 1
      },
      {
        name: "justification",
        label: "Business Justification *",
        type: "textarea",
        placeholder: "Explain why this asset is needed",
        required: true,
        columnSpan: 3
      }
    ],
    rowGroups: [
      {
        isStructuredInput: true,
        maxRows: 10,
        structure: {
          firstColumn: {
            label: "Item Name",
            name: "item_name",
            type: "text",
            placeholder: "e.g., Glass Cup"
          },
          secondColumn: {
            label: "Quantity",
            name: "quantity", 
            type: "number",
            placeholder: "e.g., 5"
          },
          thirdColumn: {
            label: "Unit",
            name: "unit",
            type: "select",
            options: ["pieces", "units", "boxes", "sets", "packs"],
            placeholder: "Select unit"
          },
          combinedMapping: 'second_third'
        },
        rowGroup: [] // Required for interface compatibility
      }
    ],
    approval: {
      steps: ["Direct Manager", "IT Department"],
      mode: "sequential"
    }
  };

  // Sample Request Form with System Variables and Structured Input
  const sampleRequestFormV1: FormConfig = {
    url: "/sample-request-enhanced",
    title: "Enhanced Sample Request Form",
    category: "General", // Add missing category
    fields: [
      {
        label: "Request By",
        name: "request_by", 
        type: "text",
        default: "${user}",
        readonly: true,
        required: true,
        columnSpan: 1
      },
      {
        label: "Division",
        name: "division",
        type: "select",
        options: ["${divisions}"],
        default: "${user.division}",
        required: true,
        columnSpan: 1
      },
      {
        label: "Email",
        name: "email",
        type: "text",
        default: "${user.email}",
        readonly: true,
        required: true,
        columnSpan: 1
      },
      {
        label: "Purpose *",
        name: "purpose",
        type: "textarea",
        placeholder: "Describe the purpose of this request",
        required: true,
        columnSpan: 3
      }
    ],
    rowGroups: [
      {
        isStructuredInput: true,
        maxRows: 15,
        structure: {
          firstColumn: {
            label: "Sample Name",
            name: "sample_name",
            type: "text",
            placeholder: "Enter sample name"
          },
          secondColumn: {
            label: "Qty",
            name: "quantity",
            type: "number", 
            placeholder: "Amount"
          },
          thirdColumn: {
            label: "Unit",
            name: "uom",
            type: "select",
            options: ["ml", "gr", "kg", "pcs", "boxes", "liters"],
            placeholder: "Unit"
          }
        },
        rowGroup: []
      }
    ]
  };

  // Asset Request Form Configuration V2
  const assetRequestFormV2: FormConfig = {
    url: "/asset-request-v2",
    title: "Asset Request Form V2",
    category: "IT", // Add missing category
    fields: [
      {
        name: "requestedBy",
        label: "Requested By *",
        type: "text",
        placeholder: "Enter your name",
        required: true
      },
      {
        name: "division",
        label: "Division *",
        type: "select",
        options: ["IT", "HR", "Finance", "Operations"],
        required: true
      },
      {
        name: "assetType",
        label: "Asset Type *",
        type: "select",
        options: ["Laptop", "Desktop", "Monitor", "Printer", "Phone"],
        required: true
      },
      {
        name: "laptopSpecification",
        label: "Laptop Specification *",
        type: "textarea",
        placeholder: "Specify laptop requirements",
        required: true
      },
      {
        name: "justification",
        label: "Business Justification *",
        type: "textarea",
        placeholder: "Explain why this asset is needed",
        required: true
      },
      {
        name: "urgency",
        label: "Urgency Level",
        type: "select",
        options: ["Low", "Medium", "High", "Critical"],
        required: false
      },
      {
        name: "preferredDeliveryDate",
        label: "Preferred Delivery Date",
        type: "date",
        required: false
      },
      {
        name: "additionalNotes",
        label: "Additional Notes",
        type: "textarea",
        placeholder: "Any additional information",
        required: false
      },
      {
        name: "supportingDocuments",
        label: "Supporting Documents",
        type: "file",
        accept: ["pdf", "doc", "docx"],
        required: false
      }
    ],
    approval: {
      steps: ["Direct Manager", "IT Department", "Finance Team"],
      mode: "sequential"
    }
  };

  // Sample Request Form Configuration V2
 

  const itSupportForm: FormConfig = {
    url: "/it-support",
    title: "IT Support Request",
    category: "IT", // Add missing category
    fields: [
      {
        name: "requestorName",
        label: "Requestor Name *",
        type: "text",
        placeholder: "Enter your full name",
        required: true
      },
      {
        name: "email",
        label: "Email Address *",
        type: "text",
        placeholder: "your.email@company.com",
        required: true
      },
      {
        name: "department",
        label: "Department *",
        type: "select",
        options: ["IT", "HR", "Finance", "Operations", "Marketing", "Sales"],
        required: true
      },
      {
        name: "issueType",
        label: "Issue Type *",
        type: "select",
        options: ["Hardware", "Software", "Network", "Account Access", "Email", "Other"],
        required: true
      },
      {
        name: "priority",
        label: "Priority Level *",
        type: "select",
        options: ["Low", "Medium", "High", "Critical"],
        required: true
      },
      {
        name: "subject",
        label: "Subject *",
        type: "text",
        placeholder: "Brief description of the issue",
        required: true
      },
      {
        name: "description",
        label: "Detailed Description *",
        type: "textarea",
        placeholder: "Please provide detailed information about the issue",
        required: true
      },
      {
        name: "screenshots",
        label: "Screenshots/Attachments",
        type: "file",
        accept: ["image/*", "pdf", "doc", "docx"],
        multiple: true,
        required: false
      }
    ],
    approval: {
      steps: ["IT Support Team"],
      mode: "sequential"
    }
  };

  const leaveRequestForm: FormConfig = {
    url: "/leave-request",
    title: "Leave Request Form",
    category: "HR", // Add missing category
    fields: [
      {
        name: "employeeName",
        label: "Employee Name *",
        type: "text",
        placeholder: "Enter employee name",
        required: true
      },
      {
        name: "employeeId",
        label: "Employee ID *",
        type: "text",
        placeholder: "Enter employee ID",
        required: true
      },
      {
        name: "leaveType",
        label: "Leave Type *",
        type: "select",
        options: ["Annual Leave", "Sick Leave", "Personal Leave", "Maternity Leave", "Emergency Leave"],
        required: true
      },
      {
        name: "startDate",
        label: "Start Date *",
        type: "date",
        required: true
      },
      {
        name: "endDate",
        label: "End Date *",
        type: "date",
        required: true
      },
      {
        name: "reason",
        label: "Reason for Leave *",
        type: "textarea",
        placeholder: "Please explain the reason for your leave",
        required: true
      },
      {
        name: "contactDuringLeave",
        label: "Contact During Leave",
        type: "text",
        placeholder: "Phone number or alternative contact",
        required: false
      },
      {
        name: "workHandover",
        label: "Work Handover Details",
        type: "textarea",
        placeholder: "Describe how your work will be handled during your absence",
        required: false
      }
    ],
    approval: {
      steps: ["Direct Manager", "HR Department"],
      mode: "sequential"
    }
  };

  const suggestionInsertForm: FormConfig = {
    url: "/suggestion-insert-test",
    title: "Suggestion Insert Test Form",
    category: "Test",
    fields: [
      {
        name: "suggestionField",
        label: "Suggestion Insert Field",
        type: "suggestion-insert",
        placeholder: "Type or select a suggestion",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        default: "Option 1",
        required: false,
        columnSpan: 2
      }
    ]
  };

  const formOptions = [
    { id: 'asset-request-enhanced', name: 'Enhanced Asset Request (with Variables)', config: assetRequestFormV1 },
    { id: 'sample-request-enhanced', name: 'Enhanced Sample Request (Structured)', config: sampleRequestFormV1 },
    { id: 'it-support', name: 'IT Support Request', config: itSupportForm },
    { id: 'leave-request', name: 'Leave Request Form', config: leaveRequestForm },
    { id: 'suggestion-insert-test', name: 'Suggestion Insert Test Form', config: suggestionInsertForm }
  ];

  const handleFormSubmit = (data: any) => {
    alert('Form submitted successfully!');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Form Builder & Preview</h1>
          <p className="text-muted-foreground">
            Testing system variables (${'{user}'}, ${'{departments}'}) and structured row groups
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Available Forms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {formOptions.map((form) => (
                  <Button
                    key={form.id}
                    variant={selectedForm?.url === form.config.url ? "default" : "outline"}
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedForm(form.config)}
                  >
                    {form.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {selectedForm && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Features Demonstrated</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div>✅ System Variables: ${'{user}'}, ${'{departments}'}</div>
                  <div>✅ Structured Row Groups</div>
                  <div>✅ Dynamic Field Counting</div>
                  <div>✅ 16 Field Limit Enforcement</div>
                  <div>✅ Data Mapping: cstm_col + lbl_col</div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedForm ? (
              <DynamicForm 
                config={selectedForm} 
                onSubmit={handleFormSubmit}
                serviceId="demo"
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Select a Form</h3>
                    <p className="text-muted-foreground">Choose a form from the list to preview it</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FormBuilder;
