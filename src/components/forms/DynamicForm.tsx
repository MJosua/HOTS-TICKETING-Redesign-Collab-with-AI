import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DynamicField } from './DynamicField';
import { RowGroupComponent } from './RowGroup';
import { FormConfig, FormField as FormFieldType, RowGroup } from '@/types/formTypes';
import { useToast } from '@/hooks/use-toast';
import { useFormSystemData } from '@/hooks/useFormSystemData';
import { EnhancedStructuredRowGroup } from './EnhancedStructuredRowGroup';

const formSchema = z.object({});

interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: any) => void;
  serviceId?: string;
  initialData?: any;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  onSubmit,
  serviceId,
  initialData = {}
}) => {
  const systemData = useFormSystemData();
  
  const [totalFieldCount, setTotalFieldCount] = useState(config.fields?.length || 0);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
    mode: "onChange"
  });

  const handleFileUpload = async (files: FileList | null): Promise<number[]> => {
    if (!files) return [];

    const uploadedIds: number[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        // const response = await axios.post('/api/upload', formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // });

        // if (response.data && response.data.fileId) {
        //   uploadedIds.push(response.data.fileId);
        // }
        console.log('Uploaded', file.name);
        uploadedIds.push(i + 1); // Mock IDs
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
    return uploadedIds;
  };

  const onSubmitHandler = (values: any) => {
    console.log('Form values:', values);
    onSubmit(values);
  };

  // Show loading indicator while system data is loading
  if (systemData.isLoading && !systemData.isReady) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading form data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{config.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.fields && config.fields.map((field, index) => (
              <DynamicField
                key={field.name}
                field={field}
                form={form}
                fieldKey={field.name}
                onFileUpload={handleFileUpload}
                onValueChange={(value) => {
                  console.log(`Field ${field.name} changed to:`, value);
                }}
              />
            ))}
          </CardContent>
        </Card>

        {/* Enhanced Row Groups Section */}
        {config.rowGroups && config.rowGroups.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Dynamic Sections</h3>
            {config.rowGroups.map((rowGroup, index) => {
              if (rowGroup.isStructuredInput) {
                // Calculate starting column index based on previous fields and row groups
                const previousFieldCount = (config.fields?.length || 0) + 
                  config.rowGroups.slice(0, index).reduce((sum, rg) => 
                    sum + (rg.isStructuredInput ? 1 : rg.rowGroup.length), 0
                  );
                
                return (
                  <div key={index} className="space-y-4">
                    <h4 className="font-medium">
                      {rowGroup.structure?.firstColumn?.label || `Section ${index + 1}`}
                    </h4>
                    <EnhancedStructuredRowGroup
                      rowGroup={rowGroup}
                      form={form}
                      groupIndex={index}
                      maxTotalFields={16}
                      currentFieldCount={totalFieldCount}
                      onFieldCountChange={(count) => {
                        // Update total field count
                        const newTotal = (config.fields?.length || 0) + 
                          config.rowGroups.reduce((sum, rg, rgIndex) => 
                            sum + (rgIndex === index ? count : (rg.isStructuredInput ? 1 : rg.rowGroup.length)), 0
                          );
                        setTotalFieldCount(newTotal);
                      }}
                      startingColumnIndex={previousFieldCount + 1}
                    />
                  </div>
                );
              }
              
              return (
                <RowGroupComponent
                  key={index}
                  rowGroup={rowGroup}
                  form={form}
                  groupIndex={index}
                  serviceId={serviceId || 'default'}
                />
              );
            })}
          </div>
        )}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
