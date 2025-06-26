import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { resolveSystemVariable, useSystemVariableContext } from '@/utils/systemVariableResolver';

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
  note?: string;
  systemVariable?: string;
}

interface DynamicFieldProps {
  field: FormField;
  form: UseFormReturn<any>;
  fieldKey: string;
  onValueChange?: (value: any) => void;
  onFileUpload?: (files: FileList | null) => Promise<number[]>;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  form,
  fieldKey,
  onValueChange,
  onFileUpload
}) => {
  const systemContext = useSystemVariableContext();
  // Check if field is required - either explicitly set or has asterisk in label
  const isRequired = field.required === true || field.label.includes('*');
  const hasAsterisk = field.label.includes('*');
  const cleanLabel = field.label.replace(/\*+$/, '');

  // Resolve system variables in default value and options
  const resolvedDefault = React.useMemo(() => {
    if (field.default) {
      const resolved = resolveSystemVariable(field.default, systemContext);
      return Array.isArray(resolved) ? resolved[0] : resolved;

    }
    return field.value || '';
  }, [field.default, field.value, systemContext]);

  const resolvedOptions = React.useMemo(() => {
    if (!field.options) return [];

    return field.options.map(option => {
      const resolved = resolveSystemVariable(option, systemContext);
      return Array.isArray(resolved) ? resolved : [resolved];
    }).flat().filter(Boolean);
  }, [field.options, systemContext]);

  // Set default value when component mounts or resolved default changes
  useEffect(() => {
    if (resolvedDefault && !form.getValues(fieldKey)) {
      form.setValue(fieldKey, resolvedDefault);
      onValueChange?.(resolvedDefault);
    }
  }, [resolvedDefault, fieldKey, form, onValueChange]);

  const renderFieldContent = () => {
    switch (field.type?.trim()) {
      case 'text':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            defaultValue={resolvedDefault}
            {...form.register(fieldKey, {
              required: isRequired ? `${cleanLabel} is required` : false
            })}
            onChange={(e) => {
              form.setValue(fieldKey, e.target.value);
              onValueChange?.(e.target.value);
            }}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            readOnly={field.readonly}
            defaultValue={resolvedDefault}
            {...form.register(fieldKey, {
              required: isRequired ? `${cleanLabel} is required` : false
            })}
            onChange={(e) => {
              form.setValue(fieldKey, e.target.value);
              onValueChange?.(e.target.value);
            }}
          />
        );

      case 'select':
        return (
          <Select onValueChange={(value) => {
            form.setValue(fieldKey, value);
            onValueChange?.(value);
          }}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${cleanLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {resolvedOptions.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            onValueChange={(value) => {
              form.setValue(fieldKey, value);
              onValueChange?.(value);
            }}
            defaultValue={resolvedDefault}
          >
            <div className="flex flex-col space-y-2">
              {resolvedOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${fieldKey}-${index}`} />
                  <label htmlFor={`${fieldKey}-${index}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'toggle':
        return (
          <Switch
            onCheckedChange={(checked) => {
              form.setValue(fieldKey, checked);
              onValueChange?.(checked);
            }}
            defaultChecked={Boolean(
              (typeof field.default === 'string' && (
                field.default === 'on' ||
                field.default === 'true' ||
                field.default === 'yes'
              )) ||
              (typeof field.default === 'boolean' && field.default)
            )}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            onCheckedChange={(checked) => {
              form.setValue(fieldKey, checked);
              onValueChange?.(checked);
            }}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            {...form.register(fieldKey, {
              required: isRequired ? `${cleanLabel} is required` : false
            })}
            onChange={(e) => {
              form.setValue(fieldKey, e.target.value);
              onValueChange?.(e.target.value);
            }}
          />
        );

      case 'file':
        return (
          <div className="space-y-2">
            {/* Show uploaded file names */}
            {form.watch(fieldKey)?.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                {(form.watch(`${fieldKey}_raw`) ? Array.from(form.watch(`${fieldKey}_raw`) as FileList) : []).map((file: File, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="truncate max-w-xs">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>

                    <button
                      type="button"
                      className="text-red-500 text-xs"
                      onClick={() => {
                        const rawFiles = form.watch(`${fieldKey}_raw`) ? Array.from(form.watch(`${fieldKey}_raw`) as FileList) : [];
                        const uploadedUrls = Array.from(form.watch(fieldKey) || []);

                        // Remove both preview and submitted value
                        rawFiles.splice(i, 1);
                        uploadedUrls.splice(i, 1);

                        const dt = new DataTransfer();
                        rawFiles.forEach((f) => dt.items.add(f));

                        form.setValue(`${fieldKey}_raw`, dt.files);
                        form.setValue(fieldKey, uploadedUrls);
                      }}
                    >
                      Remove
                    </button>

                    {file.type.startsWith('image/') && (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    {field.accept && (
                      <p className="text-xs text-gray-500">{field.accept.join(', ')}</p>
                    )}
                    {field.maxSizeMB && (
                      <p className="text-xs text-gray-500">Max size: {field.maxSizeMB}MB</p>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept={field.accept?.join(',')}
                    multiple={field.multiple}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files?.length) return;

                      // 1. Set raw files for preview
                      form.setValue(`${fieldKey}_raw`, files);

                      // 2. Upload the files
                      if (onFileUpload) {
                        try {
                          const uploadedData = await onFileUpload(files);
                          const uploadedUrls = uploadedData.map((f: any) => f.url || f);

                          // 3. Store the URLs (for submission)
                          form.setValue(fieldKey, uploadedUrls);

                          onValueChange?.(uploadedUrls);
                        } catch (uploadError) {
                          console.error('File upload error:', uploadError);
                        }
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {field.note && (
              <p className="text-xs text-muted-foreground">{field.note}</p>
            )}
          </div>
        );

      default:
        return (
          <Input
            placeholder={field.placeholder}
            defaultValue={resolvedDefault}
            {...form.register(fieldKey, {
              required: isRequired ? `${cleanLabel} is required` : false
            })}
          />
        );
    }
  };

  return (
    <FormField
      control={form.control}
      name={fieldKey}
      render={() => (
        <FormItem>
          <FormLabel className={isRequired ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
            {cleanLabel}
          </FormLabel>
          <FormControl>
            {renderFieldContent()}
          </FormControl>
          <FormMessage />
          {field.note && !field.note.includes('size') && (
            <FormDescription>{field.note}</FormDescription>
          )}
        </FormItem>
      )}
    />
  );
};
