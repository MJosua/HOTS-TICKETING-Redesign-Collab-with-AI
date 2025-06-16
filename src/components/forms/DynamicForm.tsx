
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import ProgressionBar from '@/components/ui/ProgressionBar';
import { DynamicField } from './DynamicField';
import { RowGroupField } from './RowGroupField';
import { RepeatingSection } from './RepeatingSection';
import { FormConfig, FormField, RowGroup } from '@/types/formTypes';

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

  const renderRowGroups = (rowGroups: RowGroup[]) => {
    return rowGroups.map((rowGroup, index) => (
      <RowGroupField
        key={`rowgroup-${index}`}
        rowGroup={rowGroup.rowGroup}
        form={form}
        groupIndex={index}
        onValueChange={(fieldKey, value) => {
          setWatchedValues(prev => ({ ...prev, [fieldKey]: value }));
        }}
      />
    ));
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
            {section.fields && renderFields(section.fields)}
            {section.rowGroups && renderRowGroups(section.rowGroups)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        {config.description && (
          <p className="text-sm text-muted-foreground">{config.description}</p>
        )}
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
            
            {config.rowGroups && (
              <div className="space-y-4">
                {renderRowGroups(config.rowGroups)}
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
