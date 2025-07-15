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

  // Enhanced system variable resolution with logging
  const resolveOptions = (options: string[]) => {
    console.log('🔧 [System Variables] Starting resolution for options:', options);
    console.log('🔧 [System Variables] Context available:', {
      user: systemContext.user,
      departments: systemContext.departments?.length,
      factoryplants: systemContext.factoryplants?.length,
      // Log other context keys without flooding
      contextKeys: Object.keys(systemContext)
    });

    return options.map((option, index) => {
      const resolved = resolveSystemVariable(option, systemContext);
      console.log(`🔧 [System Variables] Option[${index}] Resolution:`, {
        original: option,
        resolved: resolved,
        type: Array.isArray(resolved) ? 'array' : typeof resolved,
        length: Array.isArray(resolved) ? resolved.length : 'N/A'
      });
      
      // Handle array results by flattening them
      if (Array.isArray(resolved)) {
        return resolved;
      }
      return [resolved];
    }).flat();
  };

  // Enhanced chain link filtering with proper data value filtering
  useEffect(() => {
    if (!field.options) {
      setFilteredOptions([]);
      return;
    }

    const parentValue = watchedValues?.[field.dependsOn];
    const resolvedOptions = resolveOptions(field.options) || [];
    
    console.log('🔗 [Chain Link] Processing field:', {
      fieldName: field.name,
      dependsOn: field.dependsOn,
      parentValue: parentValue,
      filterOptionsBy: field.filterOptionsBy,
      resolvedOptionsCount: resolvedOptions.length
    });

    // When filterOptionsBy is present, perform advanced filtering
    if (parentValue && field.dependsOn && field.filterOptionsBy) {
      const key = field.filterOptionsBy;
      
      console.log('🔍 [Chain Link] Advanced filtering with key:', key);
      
      const filtered = resolvedOptions.filter((option, index) => {
        let dataValue: any;
        
        // Handle different option formats
        if (typeof option === 'object' && option !== null) {
          // Direct object access
          dataValue = option[key];
        } else if (typeof option === 'string') {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(option);
            dataValue = parsed[key];
          } catch {
            // If not JSON, treat as plain string for simple matching
            dataValue = option;
          }
        }
        
        // Perform the actual filtering based on data values
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
      
      setFilteredOptions(filtered);
      return;
    }

    // Fallback filtering for simple string matching
    if (parentValue && field.dependsOn) {
      console.log('🔗 [Chain Link] Simple filtering fallback');
      
      const fallbackFiltered = resolvedOptions.filter(option => {
        if (typeof option === 'string') {
          return option.toLowerCase().includes(String(parentValue).toLowerCase());
        }
        if (typeof option === 'object' && option !== null && typeof option.label === 'string') {
          return option.label.toLowerCase().includes(String(parentValue).toLowerCase());
        }
        return false;
      });

      setFilteredOptions(fallbackFiltered);
    } else {
      // No filtering needed
      setFilteredOptions(resolvedOptions);
    }
  }, [field.options, watchedValues?.[field.dependsOn], field.dependsOn, field.filterOptionsBy, systemContext]);

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
            <SelectContent className="bg-white border shadow-lg z-50">
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
