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
import { mapFormDataToTicketColumns } from '@/utils/formFieldMapping';
import { useAppDispatch } from '@/hooks/useAppSelector';
import { createTicket, uploadFiles } from '@/store/slices/ticketsSlice';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DynamicFormProps {
  config: FormConfig;
  onSubmit: (data: any) => void;
  serviceId?: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ config, onSubmit, serviceId }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm();
  const [watchedValues, setWatchedValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return [];

    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append(`files`, file);
    });

    try {
      const result = await dispatch(uploadFiles(formData)).unwrap();
      if (result.success && result.files) {
        setUploadedFiles(prev => [...prev, ...result.files]);
        return result.files.map((f: any) => f.upload_id);
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
    if (!serviceId) {
      toast({
        title: "Error",
        description: "Service ID is required",
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
      const mappedData = mapFormDataToTicketColumns(data, config.fields || []);
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
      console.log("serviceId",serviceId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Your request has been submitted successfully!",
          variant: "default",
        });

        // Navigate to tickets page or call the original onSubmit
        navigate('/my-tickets');
      } else {
        throw new Error(result.message || 'Failed to create ticket');
      }
    } catch (error: any) {
      console.error('Ticket creation error:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const getColSpanClass = (columnSpan: number) => {
    switch (columnSpan) {
      case 1:
        return 'col-span-1';
      case 2:
        return 'col-span-1 md:col-span-2';
      case 3:
        return 'col-span-1 md:col-span-3';
      default:
        return 'col-span-1';
    }
  };

  const renderFieldsInRows = (fields: FormField[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map((field, fieldIndex) => {
          const fieldKey = field.name || field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');

          if (!shouldShowField(field, watchedValues)) {
            return null;
          }

          return (
            <div key={fieldKey} className={getColSpanClass(field.columnSpan || 1)}>
              <DynamicField
                field={field}
                form={form}
                fieldKey={fieldKey}
                onValueChange={(value) => {
                  setWatchedValues(prev => ({ ...prev, [fieldKey]: value }));
                }}
                onFileUpload={handleFileUpload}
              />
            </div>
          );
        })}
      </div>
    );
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
                {renderFieldsInRows(config.fields)}
              </div>
            )}

            {config.rowGroups && (
              <div className="space-y-4">
                {config.rowGroups.map((rowGroup, index) => (
                  <RowGroupField
                    key={`rowgroup-${index}`}
                    rowGroup={rowGroup.rowGroup}
                    form={form}
                    groupIndex={index}
                    onValueChange={(fieldKey, value) => {
                      setWatchedValues(prev => ({ ...prev, [fieldKey]: value }));
                    }}
                  />
                ))}
              </div>
            )}

            {config.sections && config.sections.map((section: FormSection, sectionIndex) => (
              <div key={`section-${sectionIndex}`} className="mb-6">
                <h3 className="text-lg font-semibold mb-4">{section.title}</h3>

                {section.repeatable ? (
                  <RepeatingSection
                    section={section}
                    form={form}
                  />
                ) : (
                  <div className="space-y-4">
                    {section.fields && renderFieldsInRows(section.fields)}
                    {section.rowGroups && section.rowGroups.map((rowGroup, index) => (
                      <RowGroupField
                        key={`rowgroup-${index}`}
                        rowGroup={rowGroup.rowGroup}
                        form={form}
                        groupIndex={index}
                        onValueChange={(fieldKey, value) => {
                          setWatchedValues(prev => ({ ...prev, [fieldKey]: value }));
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? 'Submitting...' : (config.submit?.label || 'Submit')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
