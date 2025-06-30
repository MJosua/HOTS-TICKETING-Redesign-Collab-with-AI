
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Code, FileText, Settings, Zap } from 'lucide-react';

const AdminGuide = () => {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Administration Guide</h1>
            <p className="text-muted-foreground">Complete guide for system administrators</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="custom-functions">Custom Functions</TabsTrigger>
            <TabsTrigger value="widgets">Widget System</TabsTrigger>
            <TabsTrigger value="forms">Form Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>The HOTS administration panel provides comprehensive tools for managing your helpdesk system:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Catalog:</strong> Create and manage service forms</li>
                  <li><strong>User Management:</strong> Control user access and roles</li>
                  <li><strong>Custom Functions:</strong> Add business logic with JavaScript</li>
                  <li><strong>Widget System:</strong> Enhance forms and tickets with reusable components</li>
                  <li><strong>Workflow Management:</strong> Configure approval processes</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-functions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Custom Functions Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">Creating Custom Functions</h4>
                <p>Custom functions allow you to add business logic to your forms and workflows.</p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Function Structure:</h5>
                  <pre className="text-sm bg-white p-3 rounded border">
{`function customFunction(context) {
  // Access form data
  const { formData, userData, serviceId } = context;
  
  // Your business logic here
  if (formData.amount > 1000) {
    return {
      success: false,
      message: "Amount exceeds limit"
    };
  }
  
  return {
    success: true,
    data: processedData
  };
}`}
                  </pre>
                </div>

                <h4 className="font-semibold">Available Context:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><code>formData</code> - Current form field values</li>
                  <li><code>userData</code> - Current user information</li>
                  <li><code>serviceId</code> - Service being processed</li>
                  <li><code>ticketId</code> - Ticket ID (if applicable)</li>
                </ul>

                <h4 className="font-semibold">Function Types:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Validation:</strong> Runs before form submission</li>
                  <li><strong>Processing:</strong> Runs after form submission</li>
                  <li><strong>Calculation:</strong> Runs on field changes</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="widgets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Widget System Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Widgets are reusable components that enhance your forms and ticket details.</p>
                
                <h4 className="font-semibold">Widget Configuration:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm">
{`{
  "id": "my-widget",
  "name": "My Custom Widget",
  "description": "Widget description",
  "category": "Display",
  "applicableTo": ["form", "ticket_detail"],
  "dataRequirements": ["formData", "userData"],
  "props": {
    "title": "Default Title",
    "showDetails": true
  }
}`}
                  </pre>
                </div>

                <h4 className="font-semibold">Widget Types:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Display Widgets:</strong> Show information to users</li>
                  <li><strong>Input Widgets:</strong> Collect additional data</li>
                  <li><strong>Chart Widgets:</strong> Visualize data</li>
                  <li><strong>Action Widgets:</strong> Perform operations</li>
                </ul>

                <h4 className="font-semibold">Assigning Widgets:</h4>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Go to Service Catalog Admin</li>
                  <li>Click "Configure Widgets" for a service</li>
                  <li>Select widgets from available categories</li>
                  <li>Save configuration</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Builder Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">Form Structure:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Basic Fields:</strong> Individual form inputs</li>
                  <li><strong>Sections:</strong> Group related fields together</li>
                  <li><strong>Repeating Sections:</strong> Allow multiple entries</li>
                </ul>

                <h4 className="font-semibold">Field Types:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Text, Textarea, Number</li>
                  <li>Select, Radio, Checkbox</li>
                  <li>Date, File Upload</li>
                  <li>Toggle switches</li>
                </ul>

                <h4 className="font-semibold">Advanced Features:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Conditional Display:</strong> Show fields based on conditions</li>
                  <li><strong>System Variables:</strong> Auto-populate with user data</li>
                  <li><strong>Validation Rules:</strong> Ensure data quality</li>
                  <li><strong>Drag & Drop:</strong> Reorder fields easily</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminGuide;
