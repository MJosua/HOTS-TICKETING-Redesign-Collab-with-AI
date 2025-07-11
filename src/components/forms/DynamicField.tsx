
import React, { useState, useEffect } from 'react';
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

  // Resolve system variables for options
  const resolveOptions = (options: string[]) => {
    return options.map(option => {
      const resolved = resolveSystemVariable(option, systemContext);
      // console.log('🔧 System Variable Resolution:', {
      //   original: option,
      //   resolved: resolved,
      //   context: systemContext
      // });
      // Instead of joining arrays into a string, flatten arrays to individual options
      return Array.isArray(resolved) ? resolved : [resolved];
    }).flat();
  };
  // Handle chain link filtering
  useEffect(() => {
    if (!field.options) return setFilteredOptions([]);
  
    const parentValue = watchedValues?.[field.dependsOn];
    const resolvedOptions = resolveOptions(field.options) || [];
  
    // 🔍 When `filterOptionsBy` is present, perform filtering
    if (parentValue && field.dependsOn && field.filterOptionsBy) {
      const key = field.filterOptionsBy;
  
      console.log('🔗 [ChainLink Filter] Filtering Using filterOptionsBy');
      console.log('➡️ Field:', field.name);
      console.log('➡️ Depends on:', field.dependsOn);
      console.log('➡️ Parent Value:', parentValue);
      console.log('➡️ Filter Key:', key);
  
      const filtered = resolvedOptions.filter((option, index) => {
        let value: any;
  
        if (typeof option === 'object' && option !== null) {
          value = option[key];
        } else {
          try {
            const parsed = JSON.parse(option);
            value = parsed[key];
          } catch {
            return false;
          }
        }
  
        const match = String(value || '')
          .trim()
          .toLowerCase()
          .includes(String(parentValue).trim().toLowerCase());
  
        console.log(`🔍 [Match Check] Option[${index}]`, {
          value,
          match,
          option,
        });
  
        return match;
      });
  
      setFilteredOptions(filtered);
      return;
    }
  
    // ✅ Fallback when no filterOptionsBy (normal label match)
    if (parentValue && field.dependsOn) {
      const fallbackFiltered = resolvedOptions.filter(option => {
        if (typeof option === 'string') {
          return option.toLowerCase().includes(String(parentValue).toLowerCase());
        }
        if (typeof option === 'object' && typeof option.label === 'string') {
          return option.label.toLowerCase().includes(String(parentValue).toLowerCase());
        }
        return false;
      });
  
      setFilteredOptions(fallbackFiltered);
    } else {
      setFilteredOptions(resolvedOptions);
    }
  }, [onChange, watchedValues?.[field.dependsOn]]);
  
  




  // Handle suggestion-insert type
  useEffect(() => {
    if (field.type === 'suggestion-insert') {
      if (field.suggestions) {
        const resolvedSuggestions = resolveOptions(field.suggestions);
        setSuggestions(resolvedSuggestions);
      } else if (filteredOptions.length > 0) {
        // Use filtered options as suggestions
        setSuggestions(filteredOptions);
      }
    }
  }, [field.type, field.suggestions, filteredOptions]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);

    // console.log('📝 Field value changed:', field.name, newValue);
    if (field.dependsOn) {
      // console.log('🔗 Chain Link field changed:', {
      //   fieldName: field.name,
      //   newValue: newValue,
      //   parentField: field.dependsOn,
      //   parentValue: watchedValues[field.dependsOn]
      // });
    }
  };

  const getDefaultValue = () => {
    if (field.default) {
      const resolved = resolveSystemVariable(field.default, systemContext);
     
      return Array.isArray(resolved) ? resolved.join(', ') : resolved;
    }
    return '';
  };

  useEffect(() => {
    if (!value && field.default) {
      const defaultValue = getDefaultValue();
      setLocalValue(defaultValue);
      onChange(defaultValue);
    }
  }, [field.default, systemContext]);

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
            <SelectContent>
              {filteredOptions.map((option, index) => {
                if (typeof option === 'object' && option !== null) {
                  return (
                    <SelectItem key={option.label ?? index} value={option.label}>
                      {option.label || option.description || JSON.stringify(option)}
                    </SelectItem>
                  );
                }

                try {
                  const parsed = JSON.parse(option);
                  return (
                    <SelectItem key={index} value={parsed.plan_id ?? option}>
                      {parsed.label || parsed.name || option}
                    </SelectItem>
                  );
                } catch {
                  return (
                    <SelectItem key={index} value={option}>
                      {option}
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
            suggestions={suggestions.map(s => (typeof s === 'object' && s !== null ? s.label || s.name || JSON.stringify(s) : s))}
            placeholder={field.placeholder || "Type or select from suggestions"}
            readOnly={field.readonly}
            defaultValue={localValue}
            onChange={handleChange}
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
            Linked to: {field.dependsOn}
          </span>
        )}
      </Label>
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {field.note && <p className="text-sm text-gray-500">{field.note}</p>}
    </div>
  );
};
