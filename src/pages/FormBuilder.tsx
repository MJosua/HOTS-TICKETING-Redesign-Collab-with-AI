
import React from 'react';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FormBuilder = () => {
  const formConfigs = [
    {
      "url": "/it-support",
      "title": "IT Support Request",
      "fields": [
        {
          "label": "Type of Support*",
          "placeholder": "Select Type of Support",
          "type": "select",
          "options": ["Hardware", "Account", "Software"],
          "required": true
        },
        {
          "label": "Issue Description",
          "placeholder": "Please provide a detailed description of the issues you're experiencing",
          "type": "textarea",
          "required": true
        },
        {
          "label": "Attachment",
          "type": "file",
          "accept": ["image/*", "pdf", "docx"]
        }
      ],
      "approval": {
        "steps": ["Supervisor", "IT Team"],
        "mode": "sequential" as const
      }
    },
    {
      "url": "/asset-request",
      "title": "Laptop Asset Request",
      "fields": [
        {
          "label": "Job Description**",
          "placeholder": "Please describe your specific part of the job for why you need another laptop",
          "type": "textarea",
          "required": true
        },
        {
          "label": "Laptop Specification *",
          "type": "radio",
          "required": true,
          "options": ["Standard", "Analyst", "Marketing"]
        },
        {
          "label": "Do you have an Indofood asset PC/Laptop that you are currently using?",
          "type": "toggle",
          "default": "off"
        },
        {
          "label": "Date of Acquisition of the Used Asset *",
          "type": "date",
          "required": true,
          "uiCondition": "show if toggle is on"
        },
        {
          "label": "Used Laptop Specification**",
          "type": "select",
          "options": ["Standard", "Analyst", "Marketing"],
          "required": false,
          "uiCondition": "show if toggle is on"
        }
      ],
      "approval": {
        "steps": ["Supervisor", "IT Team"],
        "mode": "sequential" as const
      }
    },
    {
      "url": "/idea-bank",
      "title": "IDEA BANK",
      "fields": [
        {
          "label": "Issue Detail*",
          "placeholder": "Please provide a detailed description of the issues you're experiencing",
          "type": "textarea",
          "required": true
        },
        {
          "label": "Issue Solution*",
          "placeholder": "You may not have any solution, but if you have, please provide a detailed description of solution you're thinking",
          "type": "textarea",
          "required": true
        },
        {
          "label": "Attachment*",
          "note": "Attachment cannot exceed 5 MB in size.",
          "type": "file",
          "accept": ["image/*", "pdf", "docx"]
        }
      ]
    },
    {
      "url": "/sample-request-form",
      "title": "Sample Request Form",
      "sections": [
        {
          "title": "Data",
          "fields": [
            { "label": "Request By", "type": "text", "readonly": true, "value": "Yosua Gultom", "required": true },
            { "label": "Division", "type": "text", "readonly": true, "value": "IOD", "required": true },
            { "label": "Location", "type": "text", "readonly": true, "value": "INDOFOOD TOWER LT.23", "required": true },
            { "label": "Sample Category", "type": "select", "options": ["Category 1", "Category 2", "Category 3"], "required": true },
            { "label": "Plant", "type": "select", "options": ["Plant A", "Plant B", "Plant C"], "required": true },
            { "label": "Deliver To", "type": "select", "options": ["Location 1", "Location 2", "Location 3"], "required": true },
            { "label": "SRF No", "type": "text", "value": "XXX", "required": true },
            { "label": "Purpose", "type": "text", "placeholder": "purpose", "required": true }
          ]
        },
        {
          "title": "Item",
          "repeatable": true,
          "fields": [
            { "label": "Item Name", "type": "text", "required": true },
            { "label": "Quantity", "type": "number", "required": true }
          ],
          "addButton": "Add Item",
          "summary": {
            "label": "Total",
            "type": "number",
            "calculated": true
          }
        },
        {
          "title": "Notes",
          "fields": [
            { "label": "Notes", "type": "textarea", "placeholder": "notes", "required": false }
          ]
        },
        {
          "title": "Upload",
          "fields": [
            {
              "label": "Upload Files",
              "type": "file",
              "accept": ["image/*", "pdf", "docx"],
              "maxSizeMB": 5,
              "multiple": true
            }
          ]
        }
      ],
      "submit": {
        "label": "Submit",
        "type": "button",
        "action": "/submit-sample-request"
      }
    }
  ];

  const handleFormSubmit = (formData: any, formTitle: string) => {
    console.log(`${formTitle} submitted:`, formData);
    // Here you would typically send the data to your backend
    alert(`${formTitle} submitted successfully! Check console for details.`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dynamic Form Builder</CardTitle>
          <CardDescription>
            Generated forms based on JSON configurations with approval flows, conditional fields, and validation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="0" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {formConfigs.map((config, index) => (
            <TabsTrigger key={index} value={index.toString()}>
              {config.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {formConfigs.map((config, index) => (
          <TabsContent key={index} value={index.toString()} className="mt-8">
            <DynamicForm
              config={config}
              onSubmit={(data) => handleFormSubmit(data, config.title)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FormBuilder;
