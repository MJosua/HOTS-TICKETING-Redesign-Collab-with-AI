
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { ProgressionBar } from '@/components/ui/ProgressionBar';
import { DynamicField } from './DynamicField';
import { RepeatingSection } from './RepeatingSection';

interface FormField {
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  readonly?: boolean;
  value?: string;
  accept?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  default?: string;
  uiCondition?: string;
  note?: string;
}

interface FormSection {
  title: string;
  fields: FormField[];
  repeatable?: boolean;
  addButton?: string;
  summary?: {
    label: string;
    type: string;
    calculated: boolean;
  };
}

interface ApprovalFlow {
  steps: string[];
  mode: 'sequential' | 'parallel';
}

interface FormConfig {
  url: string;
  title: string;
  fields?: FormField[];
  sections?: FormSection[];
  approval?: ApprovalFlow;
  submit?: {
    label: string;
    type: string;
    action: string;
  };
}

interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: any) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ config, onSubmit }) => {
  const form = useForm();
  const [watchedValues, setWatchedValues] = useState<Record<string, any>>({});

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    onSubmit(data);
  };

  const shouldShowField = (field: FormField, values: Record<string, any>) => {
    if (!field.uiCondition) return true;
    
    // Simple condition parsing for "show if toggle is on"
    if (field.uiCondition.includes('toggle is on')) {
      const toggleFields = Object.keys(values).filter(key => 
        form.watch(key) === true || form.watch(key) === 'on'
      );
      return toggleFields.length > 0;
    }
    
    return true;
  };

  const renderApprovalFlow = () => {
    if (!config.approval) return null;

    const approvalSteps = config.approval.steps.map((step, index) => ({
      id: `step-${index}`,
      name: step,
      status: 'waiting' as const,
      approver: step
    }));

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Approval Flow</h3>
        <ProgressionBar 
          steps={approvalSteps} 
          showDetails={true}
          className="mb-4"
        />
      </div>
    );
  };

  const renderFields = (fields: FormField[]) => {
    return fields.map((field, index) => {
      const fieldKey = field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      if (!shouldShowField(field, watchedValues)) {
        return null;
      }

      return (
        <DynamicField
          key={`${fieldKey}-${index}`}
          field={field}
          form={form}
          fieldKey={fieldKey}
          onValueChange={(value) => {
            setWatchedValues(prev => ({ ...prev, [fieldKey]: value }));
          }}
        />
      );
    });
  };

  const renderSections = () => {
    if (!config.sections) return null;

    return config.sections.map((section, sectionIndex) => (
      <div key={`section-${sectionIndex}`} className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
        
        {section.repeatable ? (
          <RepeatingSection
            section={section}
            form={form}
          />
        ) : (
          <div className="space-y-4">
            {renderFields(section.fields)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        {renderApprovalFlow()}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {config.fields && (
              <div className="space-y-4">
                {renderFields(config.fields)}
              </div>
            )}
            
            {renderSections()}
            
            <div className="flex justify-end pt-6">
              <Button type="submit" className="min-w-32">
                {config.submit?.label || 'Submit'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
