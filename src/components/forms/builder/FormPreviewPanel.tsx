
import React from 'react';
import { FormConfig } from '@/types/formTypes';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { useToast } from '@/hooks/use-toast';

interface FormPreviewPanelProps {
  config: FormConfig;
}

export const FormPreviewPanel: React.FC<FormPreviewPanelProps> = ({ config }) => {
  const { toast } = useToast();

  const handlePreviewSubmit = (data: any) => {
    console.log('Form Preview Submission:', data);
    
    // Show toast with submitted data
    toast({
      title: "Form Preview Submission",
      description: `Data: ${JSON.stringify(data, null, 2)}`,
      variant: "default",
      duration: 5000
    });
  };

  return (
    <div className="p-6 bg-gray-50 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Live Form Preview</h2>
          <p className="text-sm text-blue-600">
            This is a live preview of your form. You can interact with it and submit to see the data structure.
            System variables like ${'{user.name}'} will be resolved in the actual form.
          </p>
        </div>

        <DynamicForm
          config={config}
          onSubmit={handlePreviewSubmit}
        />
      </div>
    </div>
  );
};
