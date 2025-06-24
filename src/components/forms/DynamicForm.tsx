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

    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append(`file`, file);
    });

    try {
      const result = await dispatch(uploadFiles(formData)).unwrap();
      if (result.success && result.data) {
        setUploadedFiles(prev => [...prev, ...result.data]);
        return result.data.map((f: any) => f.url);
      }
      return [];
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };

  const handleSubmit = async (data: any) => {
    console.log("rowgroup")
    if (!serviceId) {
      const mappedData = mapFormDataToTicketColumns(
        data,
        config.fields || [],
        config.rowGroups || []
      );
      toast({
        title: "TEST NO SERVICE ID",
        description: JSON.stringify(mappedData, null, 2),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Raw form data:', data);

      // Handle file uploads first
      let uploadIds: number[] = [];
      for (const [key, value] of Object.entries(data)) {
        if (value instanceof FileList && value.length > 0) {
          const fileUploadIds = await handleFileUpload(value);
          uploadIds.push(...fileUploadIds);
          // Remove the FileList from form data
          delete data[key];
        }
      }

      // Map form data to cstm_col and lbl_col structure
      const mappedData = mapFormDataToTicketColumns(
        data,
        config.fields || [],
        config.rowGroups || []
      );
      console.log('Mapped ticket data:', mappedData);

      // Create the ticket data payload
      const ticketData = {
        subject: data.subject || 'Service Request',
        upload_ids: uploadIds,
        ...mappedData
      };

      console.log('Creating ticket with data:', ticketData);

      // Create the ticket
      const result = await dispatch(createTicket({
        serviceId,
        ticketData
      })).unwrap();
      console.log("serviceId", serviceId)
      if (result.success) {
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


  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        {config.description && (
          <p className="text-sm text-muted-foreground">{config.description}</p>
        )}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
