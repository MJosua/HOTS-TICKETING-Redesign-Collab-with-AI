
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormConfig } from '@/types/formTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormPreviewPanelProps {
  config: FormConfig;
}

export const FormPreviewPanel: React.FC<FormPreviewPanelProps> = ({ config }) => {
  const renderField = (field: any, index: number) => {
    const baseProps = {
      key: index,
      placeholder: field.placeholder || field.label,
      required: field.required,
      disabled: field.readonly
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea {...baseProps} />;
      case 'select':
        return (
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string, idx: number) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input {...baseProps} type={field.type || 'text'} />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{config.title || 'Form Preview'}</h1>
          {config.description && (
            <p className="text-gray-600">{config.description}</p>
          )}
        </div>

        {config.sections?.map((section, sectionIndex) => (
          <Card key={section.id || sectionIndex} className="mb-6">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              {section.description && (
                <p className="text-sm text-gray-600">{section.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields?.map((field, fieldIndex) => (
                <div key={field.id || fieldIndex}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field, fieldIndex)}
                  {field.note && (
                    <p className="text-xs text-gray-500 mt-1">{field.note}</p>
                  )}
                </div>
              ))}

              {section.rowGroups?.map((rowGroup, rgIndex) => (
                <div key={rowGroup.id || rgIndex} className="border p-4 rounded">
                  <h4 className="font-medium mb-3">{rowGroup.title}</h4>
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-3 gap-2">
                        {rowGroup.rowGroup?.map((field, fieldIndex) => (
                          <div key={fieldIndex}>
                            {rowIndex === 0 && (
                              <label className="block text-xs font-medium mb-1">
                                {field.label}
                              </label>
                            )}
                            {renderField(field, fieldIndex)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button size="lg">Submit Form</Button>
        </div>
      </div>
    </div>
  );
};
