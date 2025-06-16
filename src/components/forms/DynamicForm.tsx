import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { ApprovalFlowCard } from '@/components/ui/ApprovalFlowCard';
import { DynamicField } from './DynamicField';
import { RowGroupField } from './RowGroupField';
import { RepeatingSection } from './RepeatingSection';
import { FormConfig, FormField, RowGroup, FormSection } from '@/types/formTypes';

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
    if (!config.approval || !config.approval.steps || config.approval.steps.length === 0) return null;

    const approvalSteps = config.approval.steps.map((step, index) => ({
      id: `step-${index}`,
      name: step,
      status: 'waiting' as const,
      approver: step
    }));

    return (
      <div className="mb-6">
        <ApprovalFlowCard 
          steps={approvalSteps} 
          mode={config.approval.mode}
          className="mb-4"
        />
      </div>
    );
  };

  const renderFieldsInRows = (fields: FormField[]) => {
    let currentRow: FormField[] = [];
    let currentRowSpan = 0;
    const rows: FormField[][] = [];

    fields.forEach(field => {
      const span = field.columnSpan || 1;
      
      if (currentRowSpan + span > 3) {
        if (currentRow.length > 0) {
          rows.push([...currentRow]);
        }
        currentRow = [field];
        currentRowSpan = span;
      } else {
        currentRow.push(field);
        currentRowSpan += span;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows.map((row, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {row.map((field, fieldIndex) => {
          const fieldKey = field.name || field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
          
          if (!shouldShowField(field, watchedValues)) {
            return null;
          }

          return (
            <div key={fieldKey} className={`col-span-1 md:col-span-${field.columnSpan || 1}`}>
              <DynamicField
                field={field}
                form={form}
                fieldKey={fieldKey}
                onValueChange={(value) => {
                  setWatchedValues(prev => ({ ...prev, [fieldKey]: value }));
                }}
              />
            </div>
          );
        })}
      </div>
    ));
  };

  const renderFields = (fields: FormField[]) => {
    return renderFieldsInRows(fields);
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

    return config.sections.map((section: FormSection, sectionIndex) => (
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
