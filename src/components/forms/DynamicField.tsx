import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/types/formTypes';
import { SuggestionInsertInput } from './SuggestionInsertInput';
import { compareValues } from '@/utils/dependencyResolver'; // 🆕 add this import

interface DynamicFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any, fullOption?: any) => void; // <-- second optional param
  watchedValues?: Record<string, any>;
  error?: string;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  watchedValues = {},
  error
}) => {
  const [localValue, setLocalValue] = useState(value ?? '');
  const [filteredOptions, setFilteredOptions] = useState<any[]>(field.options || []);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const resolvedOptions = useMemo(() => {
    if (!Array.isArray(field.options)) return [];
    return field.options.filter(Boolean);
  }, [field.options]);

  const getDefaultValue = () => {
    if (field.default) {
      return Array.isArray(field.default)
        ? field.default.join(', ')
        : field.default;
    }
    return '';
  };

  useEffect(() => {
    if (!value && field.default) {
      const defaultValue = getDefaultValue();
      if (localValue !== defaultValue) {
        setLocalValue(defaultValue);
        onChange(defaultValue);
      }
    }
  }, [field.default, value, localValue]);

  useEffect(() => {
    if (JSON.stringify(filteredOptions) !== JSON.stringify(resolvedOptions)) {
      setFilteredOptions(resolvedOptions);
    }
  }, [resolvedOptions]);

  useEffect(() => {
    if (field.type === 'suggestion-insert') {
      const optArray = Array.isArray(filteredOptions) ? filteredOptions.map(opt => {
        if (typeof opt === 'object') return opt.item_name ?? opt.label ?? opt.name ?? JSON.stringify(opt);
        return opt;
      }) : [];
      setSuggestions(optArray);
    }
  }, [field.type, filteredOptions]);

  const handleChange = (newValue: any, fullOption?: any) => {
    setLocalValue(newValue);
    onChange(newValue, fullOption);
    console.log('📝 [Field Change]:', {
      fieldName: field.name,
      newValue,
      dependsOn: field.dependsOn,
      fullOption
    });
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'number': {
        const maxValue = field.maxnumber;
        const rounding = field.rounding || false;

        const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          handleChange(e.target.value);
        };

        const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value;
          let numVal = Number(val);
          let opcalweek = field.weekopcal
            ? Number(localStorage.getItem('current_delv_week'))
            : false;

          if (!isNaN(numVal)) {
            if (maxValue && numVal > maxValue) numVal = maxValue;
            if (rounding) numVal = Math.round(numVal / 25) * 25;
            if (opcalweek && numVal < opcalweek) numVal = opcalweek;
            val = numVal.toString();
          }

          handleChange(val);
        };

        return (
          <Input
            type="number"
            value={localValue}
            onChange={handleNumberChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            max={maxValue}
            readOnly={field.readonly}
            className={error ? 'border-red-500' : ''}
          />
        );
      }

      case 'textarea':
        return (
          <Textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'select':
        return (
          <Select
            value={localValue}
            onValueChange={(newVal) => {
              const foundOption = filteredOptions.find(opt => compareValues(opt, newVal));
              handleChange(newVal, foundOption);
            }}
            disabled={field.readonly}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              {filteredOptions.map((option, index) => {
                let value = '';
                let label = '';

                if (typeof option === 'object' && option !== null) {
                  value =
                    option.value ??
                    option.item_name ??
                    option.label ??
                    option.name ??
                    JSON.stringify(option);
                  label =
                    option.label ??
                    option.item_name ??
                    option.name ??
                    value;
                } else {
                  value = String(option);
                  label = String(option);
                }

                return (
                  <SelectItem key={`${value}-${index}`} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );

      case 'suggestion-insert':
        return (
          <SuggestionInsertInput
            suggestions={filteredOptions}
            placeholder={field.placeholder || 'Type or select a value'}
            readOnly={field.readonly}
            defaultValue={localValue}
            onChange={(val, full) => handleChange(val, full)}
            onEnter={(val, full) => handleChange(val, full)}
          />
        );

      case 'radio':
        return (
          <RadioGroup
            value={localValue}
            onValueChange={(val) => {
              const foundOption = filteredOptions.find(opt => compareValues(opt, val));
              handleChange(val, foundOption);
            }}
            disabled={field.readonly}
          >
            {filteredOptions.map((option, index) => {
              const label =
                typeof option === 'object'
                  ? option.label || option.item_name || option.name || JSON.stringify(option)
                  : option;
              const value =
                typeof option === 'object'
                  ? option.value || option.item_name || option.label || option.name || JSON.stringify(option)
                  : option;

              return (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`${field.name}-${index}`} />
                  <Label htmlFor={`${field.name}-${index}`}>{label}</Label>
                </div>
              );
            })}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={!!localValue}
              onCheckedChange={(v) => handleChange(v)}
              disabled={field.readonly}
            />
            <Label>{field.placeholder}</Label>
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!localValue}
              onCheckedChange={(v) => handleChange(v)}
              disabled={field.readonly}
            />
            <Label>{field.placeholder}</Label>
          </div>
        );

      case 'date':
      case 'time':
        return (
          <Input
            type={field.type}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={field.readonly}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleChange(file.name, file);
            }}
            accept={field.accept?.join(',')}
            multiple={field.multiple}
            disabled={field.readonly}
            className={error ? 'border-red-500' : ''}
          />
        );

      default:
        return (
          <Input
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div
      className={`space-y-2 ${field.columnSpan === 2
        ? 'col-span-2'
        : field.columnSpan === 3
          ? 'col-span-3'
          : 'col-span-1'
        }`}
    >
      <Label htmlFor={field.name} className="flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
        {field.dependsOn && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            🔗 Linked: {field.dependsOn}
          </span>
        )}
      </Label>
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {field.note && <p className="text-sm text-gray-500">{field.note}</p>}
    </div>
  );
};
