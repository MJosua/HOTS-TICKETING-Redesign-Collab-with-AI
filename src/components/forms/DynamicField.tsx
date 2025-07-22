
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/types/formTypes';
import { resolveSystemVariable } from '@/utils/systemVariableResolver';
import { useSystemVariableContext } from '@/utils/systemVariableDefinitions/systemVariableDefinitions';
import { SuggestionInsertInput } from './SuggestionInsertInput';

interface DynamicFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
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
  const [localValue, setLocalValue] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState<string[]>(field.options || []);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const systemContext = useSystemVariableContext();

  // Memoize resolvedOptions to avoid recalculations and infinite loops
  const resolvedOptions = useMemo(() => {
    if (!field.options) return [];
    return field.options.map((option, index) => {
      if (!option) return '';

      const resolved = resolveSystemVariable(option, systemContext);

      if (Array.isArray(resolved)) {
        return resolved;
      }
      return [resolved];
    }).flat().filter(Boolean);
  }, [field.options, systemContext]);

  // Enhanced chain link filtering with proper data value filtering
  useEffect(() => {
    if (!field.options) {
      if (filteredOptions.length !== 0) {
        setFilteredOptions([]);
      }
      return;
    }

    const parentValue = watchedValues?.[field.dependsOn || ''];

    // When filterOptionsBy is present, perform advanced filtering
    if (parentValue && field.dependsOn && field.filterOptionsBy) {
      const key = field.filterOptionsBy;

      console.log('🔍 [Chain Link] Advanced filtering with key:', key);

      const filtered = resolvedOptions.filter((option, index) => {
        if (!option) return false;

        let dataValue: any;

        // Handle different option formats
        if (typeof option === 'object' && option !== null) {
          dataValue = (option as any)[key];
        } else if (typeof option === 'string') {
          try {
            const parsed = JSON.parse(option);
            dataValue = parsed[key];
          } catch {
            dataValue = option;
          }
        }

        const match = String(dataValue || '')
          .trim()
          .toLowerCase()
          .includes(String(parentValue).trim().toLowerCase());

        console.log(`🔍 [Chain Link] Filter Check[${index}]:`, {
          option: typeof option === 'string' ? option.substring(0, 50) + '...' : option,
          extractedValue: dataValue,
          parentValue: parentValue,
          match: match
        });

        return match;
      });

      console.log('🔗 [Chain Link] Filtering complete:', {
        original: resolvedOptions.length,
        filtered: filtered.length
      });

      if (JSON.stringify(filtered) !== JSON.stringify(filteredOptions)) {
        setFilteredOptions(filtered);
      }
      return;
    }

    // Fallback filtering for simple string matching
    if (parentValue && field.dependsOn) {
      console.log('🔗 [Chain Link] Simple filtering fallback');

      const fallbackFiltered = resolvedOptions.filter(option => {
        if (!option) return false;

        if (typeof option === 'string') {
          return option.toLowerCase().includes(String(parentValue).toLowerCase());
        }
        if (typeof option === 'object' && option !== null && typeof (option as any).label === 'string') {
          return (option as any).label.toLowerCase().includes(String(parentValue).toLowerCase());
        }
        return false;
      });

      if (JSON.stringify(fallbackFiltered) !== JSON.stringify(filteredOptions)) {
        setFilteredOptions(fallbackFiltered);
      }
    } else {
      if (JSON.stringify(resolvedOptions) !== JSON.stringify(filteredOptions)) {
        setFilteredOptions(resolvedOptions);
      }
    }
  }, [resolvedOptions, watchedValues?.[field.dependsOn || ''], field.dependsOn, field.filterOptionsBy]);

  // Memoize suggestions to avoid unnecessary updates
  const memoizedSuggestions = useMemo(() => {
    if (field.type === 'suggestion-insert') {
      if (field.suggestions) {
        return resolveOptions(field.suggestions);
      } else if (filteredOptions.length > 0) {
        return filteredOptions;
      }
    }
    return [];
  }, [field.type, field.suggestions, filteredOptions]);

  useEffect(() => {
    if (JSON.stringify(memoizedSuggestions) !== JSON.stringify(suggestions)) {
      setSuggestions(memoizedSuggestions);
    }
  }, [memoizedSuggestions, suggestions]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);

    console.log('📝 [Field Change]:', {
      fieldName: field.name,
      newValue: newValue,
      hasChainLink: !!field.dependsOn
    });
  };

  const getDefaultValue = () => {
    if (field.default) {
      const resolved = resolveSystemVariable(field.default, systemContext);
      console.log('🔧 [Default Value] Resolution:', {
        original: field.default,
        resolved: resolved
      });
      return Array.isArray(resolved) ? resolved.join(', ') : resolved;
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

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <Input
            type={field.type}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            className={error ? 'border-red-500' : ''}
          />
        );

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
          <Select value={localValue} onValueChange={handleChange} disabled={field.readonly}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              {filteredOptions.map((option, index) => {
                if (!option) return null;

                try {
                  const parsed = JSON.parse(option);
                  console.log("parsed", parsed)
                  return (
                    <SelectItem key={index} value={parsed.plan_id ?? option}>
                      { parsed.label ||parsed.name || option}
                    </SelectItem>
                  );
                } catch {

                  let key = `option-${index}`;
                  let value = ''; let label = '';

                  if (typeof option === 'object' && option !== null) {
                    const objOption = option as any;
                    value = objOption.value || objOption.label || objOption.description || JSON.stringify(objOption);
                    label = objOption.label || objOption.description || value;
                    key = `${value}-${index}`;
                  } else {
                    try {
                      const parsed = JSON.parse(option);
                      value = parsed.plan_id ?? parsed.label ?? parsed.name ?? option;
                      label = parsed.label ?? parsed.name ?? option;
                      key = `${value}-${index}`;
                    } catch {
                      value = option;
                      label = option;
                      key = `fallback-${index}`; // 👈 unique fallback key
                    }
                  }

                  return (
                    <SelectItem key={key} value={value}>
                      {label}
                    </SelectItem>
                  );
                }
              })}
            </SelectContent>
          </Select>
        );

      case 'suggestion-insert':
        return (
          <SuggestionInsertInput
            suggestions={suggestions.map(s => s && (typeof s === 'object' && s !== null ? (s as any).label || (s as any).name || JSON.stringify(s) : s)).filter(Boolean)}
            placeholder={field.placeholder || "Type or select from suggestions"}
            readOnly={field.readonly}
            defaultValue={localValue}
            onChange={handleChange}
            onEnter={handleChange}
          />
        );

      case 'radio':
        return (
          <RadioGroup value={localValue} onValueChange={handleChange} disabled={field.readonly}>
            {filteredOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.name}-${index}`} />
                <Label htmlFor={`${field.name}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={localValue}
              onCheckedChange={handleChange}
              disabled={field.readonly}
            />
            <Label>{field.placeholder}</Label>
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={localValue}
              onCheckedChange={handleChange}
              disabled={field.readonly}
            />
            <Label>{field.placeholder}</Label>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={field.readonly}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
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
              if (file) {
                handleChange(file.name);
              }
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
    <div className={`space-y-2 ${field.columnSpan === 2 ? 'col-span-2' : field.columnSpan === 3 ? 'col-span-3' : 'col-span-1'}`}>
      <Label htmlFor={field.name} className="flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
        {field.dependsOn && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            🔗 Linked to: {field.dependsOn}
          </span>
        )}
      </Label>
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {field.note && <p className="text-sm text-gray-500">{field.note}</p>}
    </div>
  );
};
