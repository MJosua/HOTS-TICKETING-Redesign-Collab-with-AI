
import React from 'react';
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
  // Check if field is required - either explicitly set or has asterisk in label
  const isRequired = field.required === true || field.label.includes('*');
  const hasAsterisk = field.label.includes('*');
  const cleanLabel = field.label.replace(/\*+$/, '');

  const renderFieldContent = () => {
    switch (field.type?.trim()) {
      case 'text':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            defaultValue={field.value}
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
            defaultValue={field.value}
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
              {field.options?.map((option, index) => (
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
            defaultValue={field.default}
          >
            <div className="flex flex-col space-y-2">
              {field.options?.map((option, index) => (
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
            defaultChecked={field.default === 'on'}
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
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  {field.accept && (
                    <p className="text-xs text-gray-500">
                      {field.accept.join(', ')}
                    </p>
                  )}
                  {field.maxSizeMB && (
                    <p className="text-xs text-gray-500">
                      Max size: {field.maxSizeMB}MB
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept={field.accept?.join(',')}
                  multiple={field.multiple}
                  {...form.register(fieldKey, { 
                    required: isRequired ? `${cleanLabel} is required` : false 
                  })}
                  onChange={(e) => {
                    const files = e.target.files;
                    form.setValue(fieldKey, files);
                    onValueChange?.(files);
                  }}
                />
              </label>
            </div>
            {field.note && (
              <p className="text-xs text-muted-foreground">{field.note}</p>
            )}
          </div>
        );

      default:
        return (
          <Input
            placeholder={field.placeholder}
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
