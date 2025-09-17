import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DynamicField } from './DynamicField';
import { RowGroupField } from './RowGroupField';
import { RepeatingSection } from './RepeatingSection';
import { StructuredRowGroup } from './StructuredRowGroup';
import WidgetRenderer from '@/components/widgets/WidgetRenderer';
import { FormConfig, FormField, RowGroup, FormSection, RowData, FormItem } from '@/types/formTypes';
import { WidgetConfig } from '@/types/widgetTypes';
import { getWidgetById } from '@/registry/widgetRegistry';
import { mapFormDataToTicketColumns, getMaxFormFields } from '@/utils/formFieldMapping';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { createTicket, uploadFiles } from '@/store/slices/ticketsSlice';
import { selectServiceWidgets } from '@/store/slices/catalogSlice';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { mapUnifiedForm } from '@/utils/unifiedFormMapping';

interface DynamicFormProps {
  config: FormConfig;
  setConfig: React.Dispatch<React.SetStateAction<FormConfig>>;
  onSubmit: (data: any) => void;
  serviceId?: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ config, setConfig, onSubmit, serviceId }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm();
  const [watchedValues, setWatchedValues] = useState<Record<string, any>>({});

  // Memoize watchedValues to avoid unnecessary re-renders
  const memoizedWatchedValues = useMemo(() => watchedValues, [watchedValues]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [structuredRowCounts, setStructuredRowCounts] = useState<Record<number, number>>({});

  const { user } = useAppSelector(state => state.auth);

  const maxFields = useMemo(() => getMaxFormFields(), []);
  const [rowGroups, setRowGroups] = useState<RowGroup[]>(() => JSON.parse(JSON.stringify(config.rowGroups || [])));
  const [localFields, setLocalFields] = useState<FormField[]>(() => JSON.parse(JSON.stringify(config.fields || [])));

  React.useEffect(() => {
    setLocalFields(JSON.parse(JSON.stringify(config.fields || [])));
  }, [config.fields]);

  const serviceWidgetIds = useAppSelector(state =>
    serviceId ? selectServiceWidgets(state, parseInt(serviceId)) : []
  );

  const assignedWidgets: WidgetConfig[] = useMemo(() => {
    const ids = Array.isArray(serviceWidgetIds)
      ? serviceWidgetIds
      : serviceWidgetIds
        ? [serviceWidgetIds]
        : [];

    return ids
      .map(getWidgetById)
      .filter((widget): widget is WidgetConfig => !!widget)
      .filter(widget => widget.applicableTo.includes('form'));

  }, [serviceWidgetIds]);

  const handleUpdateRowGroup = (groupId: string, updatedRows: RowData[]) => {
    setConfig(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.type === "rowgroup" && item.id === groupId) {
          return {
            ...item,
            data: {
              ...item.data,
              rowGroup: updatedRows
            }
          };
        }
        return item;
      });

      return {
        ...prev,
        items: updatedItems
      };
    });

    
  };

  const currentFieldCount = useMemo(() => {
    return config.items.reduce((acc, item) => {
      if (item.type === "field") {
        return acc + 1;
      }
      if (item.type === "rowgroup") {
        if (item.data.isStructuredInput) {
          // count structured rows (or at least 1)
          const count = structuredRowCounts[item.id] || 1;
          return acc + count;
        }
        // count normal rowGroup length
        return acc + (Array.isArray(item.data.rowGroup) ? item.data.rowGroup.length : 0);
      }
      return acc;
    }, 0);
  }, [config.items, structuredRowCounts]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return [];
    const formData = new FormData();
    Array.from(files).forEach((file) => {
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
    if (!serviceId) {

      const mappedData = mapUnifiedForm(
        data,
        config.items || [],
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
      let uploadIds: number[] = [];
      for (const [key, value] of Object.entries(data)) {
        if (value instanceof FileList && value.length > 0) {
          const fileUploadIds = await handleFileUpload(value);
          uploadIds.push(...fileUploadIds);
          delete data[key];
        }
      }
      const mappedData = mapUnifiedForm(
        data,
        config.items || [],
      );
      const ticketData = {
        subject: data.subject || 'Service Request',
        upload_ids: uploadIds,
        ...mappedData
      };
      const result = await dispatch(createTicket({ serviceId, ticketData })).unwrap();
      if (result.success) {
        toast({
          title: "Success",
          description: "Your request has been submitted successfully!",
          variant: "default",
        });
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
    if (field.uiCondition.includes('toggle is on')) {
      const toggleFields = Object.keys(values).filter(key =>
        form.watch(key) === true || form.watch(key) === 'on'
      );
      return toggleFields.length > 0;
    }
    return true;
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

  const getNestedProperty = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const filterDependentFieldOptions = (field: FormField, dependsOnValue: any): string[] => {
    if (!field.options || !field.filterOptionsBy) {
      console.log(`[filterDependentFieldOptions] No filterOptionsBy — return original options`);
      return field.options;
    }

    console.log(`[filterDependentFieldOptions] Transforming options using filterOptionsBy for field: ${field.name}`);
    console.log(`[filterDependentFieldOptions] dependsOnValue:`, dependsOnValue);

    let optionsArray: any[] = [];

    try {
      optionsArray = typeof field.options[0] === 'string' && field.options[0].startsWith('{')
        ? field.options.map(opt => JSON.parse(opt))
        : field.options;
    } catch (error) {
      console.warn(`[filterDependentFieldOptions] Error parsing options`, error);
      optionsArray = field.options;
    }

    const result = optionsArray.map(opt => {
      if (typeof opt === 'string') return opt;

      const extracted = getNestedProperty(opt, field.filterOptionsBy!);
      console.log(`[filterDependentFieldOptions] Extracted value from object:`, {
        original: opt,
        path: field.filterOptionsBy,
        extracted
      });

      return extracted ?? JSON.stringify(opt);
    });

    console.log(`[filterDependentFieldOptions] Final mapped result:`, result);

    return result.filter(Boolean);
  };

  console.log("config", config)

  const renderFieldsInRows = (fields: FormField[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map((field, fieldIndex) => {
          const fieldKey = field.name || field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
          if (!shouldShowField(field, watchedValues)) return null;

          let fieldToRender = field;
          if (field.dependsOn && watchedValues[field.dependsOn]) {
            const filteredOptions = filterDependentFieldOptions(field, watchedValues[field.dependsOn]);
            fieldToRender = { ...field, options: filteredOptions };
          }

          return (
            <div key={fieldKey} className={getColSpanClass(field.columnSpan || 1)}>
              <DynamicField
                field={fieldToRender}
                value={form.watch(fieldKey)}
                onChange={useCallback((value) => {
                  form.setValue(fieldKey, value);
                  setWatchedValues(prev => {
                    if (prev[fieldKey] === value) {
                      return prev;
                    }
                    const newValues = { ...prev, [fieldKey]: value };
                    return newValues;
                  });

                  const updatedFields = (config.fields || []).map(f => {
                    if (f.dependsOn === field.name) {
                      const filteredOptions = filterDependentFieldOptions(f, value);
                      console.log('Updating dependent field options:', f.name, filteredOptions);
                      return { ...f, options: filteredOptions };
                    }
                    return f;
                  });

                  if (updatedFields.some(f => f.dependsOn === field.name)) {
                    console.log('Setting local fields with updated options');
                    setLocalFields(updatedFields);
                  }
                }, [field.name, config.fields, filterDependentFieldOptions, form, setLocalFields, setWatchedValues])}
                watchedValues={memoizedWatchedValues}
                error={form.formState.errors[fieldKey]?.message as string}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const isLegacyRowGroup = (rg: RowGroup): rg is RowGroup & { rowGroup: FormField[] } => {
    return !rg.isStructuredInput &&
      Array.isArray(rg.rowGroup) &&
      rg.rowGroup.length > 0 &&
      'label' in rg.rowGroup[0];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {assignedWidgets.map(widget => (
        <WidgetRenderer
          key={widget.id}
          config={widget}
          data={{
            formData: watchedValues,
            userData: user,
            serviceId,
            currentDateRange: {
              start: new Date(),
              end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          }}
        />
      ))}

      <Card>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          {config.description && !serviceId && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
          {config.description && !serviceId && (

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg text-sm">
              <span className="text-blue-800">
                <strong>Form Fields:</strong> {currentFieldCount} of {maxFields} used
              </span>
              {currentFieldCount >= maxFields && (
                <span className="text-red-600 font-medium">⚠️ Field limit reached</span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Unified rendering using items array */}
              {config.items && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => {
                      switch (item.type) {
                        case 'field':
                          const field = item.data as FormField;
                          const fieldKey = field.name || field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
                          if (!shouldShowField(field, watchedValues)) return null;

                          let fieldToRender = field;
                          if (field.dependsOn && watchedValues[field.dependsOn]) {
                            const filteredOptions = filterDependentFieldOptions(field, watchedValues[field.dependsOn]);
                            fieldToRender = { ...field, options: filteredOptions };
                          }

                          return (
                            <div key={item.id} className={getColSpanClass(field.columnSpan || 1)}>
                              <DynamicField
                                field={fieldToRender}
                                value={form.watch(fieldKey)}
                                onChange={useCallback((value) => {
                                  form.setValue(fieldKey, value);
                                  setWatchedValues(prev => {
                                    if (prev[fieldKey] === value) {
                                      return prev;
                                    }
                                    const newValues = { ...prev, [fieldKey]: value };
                                    return newValues;
                                  });
                                }, [form, setWatchedValues])}
                                watchedValues={memoizedWatchedValues}
                                error={form.formState.errors[fieldKey]?.message as string}
                              />
                            </div>
                          );

                        case 'section': {
                          const section = item.data as FormSection;
                          return (
                            <div key={item.id} className="col-span-1 md:col-span-3 space-y-4">
                              <h3 className="text-lg font-medium">{section.title}</h3>
                              {section.description && (
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                              )}
                              {section.repeatable ? (
                                <RepeatingSection section={section} form={form} />
                              ) : (
                                renderFieldsInRows(section.fields)
                              )}
                            </div>
                          );
                        }

                        case 'rowgroup': {
                          const rowGroup = item.data as RowGroup;
                          const groupIndex = config.items.findIndex(i => i.id === item.id);
                          return (
                            <div key={item.id} className="col-span-1 md:col-span-3">
                              {rowGroup.title && <h3 className="text-lg font-medium mb-2">{rowGroup.title}</h3>}
                              {rowGroup.isStructuredInput ? (
                                <StructuredRowGroup
                                  rowGroup={rowGroup}
                                  groupIndex={groupIndex}
                                  form={form}
                                  maxTotalFields={50}
                                  currentFieldCount={currentFieldCount}
                                  onFieldCountChange={(count) => setStructuredRowCounts(prev => ({ ...prev, [groupIndex]: count }))}
                                  onUpdateRowGroup={handleUpdateRowGroup}
                                />
                              ) : (
                                isLegacyRowGroup(rowGroup) ? (
                                  <RowGroupField
                                    rowGroup={rowGroup.rowGroup}
                                    form={form}
                                    groupIndex={groupIndex}
                                    onValueChange={(fieldKey, value) => {
                                      setWatchedValues(prev => ({ ...prev, [fieldKey]: value }));
                                    }}
                                  />
                                ) : null
                              )}
                            </div>
                          );
                        }

                        default:
                          return null;
                      }
                    })}
                </div>
              )}

              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={isSubmitting} className="min-w-32">
                  {isSubmitting ? 'Submitting...' : (config.submit?.label || 'Submit')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
