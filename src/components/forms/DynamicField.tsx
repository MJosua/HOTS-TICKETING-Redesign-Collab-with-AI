
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
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

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

  // Handle chain link filtering
  useEffect(() => {
    if (field.dependsOn && field.options && watchedValues) {
      const parentValue = watchedValues[field.dependsOn];
      
      console.log('🔗 Chain Link Debug - Starting filter process:', {
        childField: field.name,
        parentField: field.dependsOn,
        parentValue: parentValue,
        filterProperty: field.filterOptionsBy,
        totalOptions: field.options.length,
        originalOptions: field.options
      });

      if (parentValue) {
        let filtered = field.options;

        if (field.filterOptionsBy) {
          // Complex filtering with property path
          filtered = field.options.filter(option => {
            try {
              // Try to parse as JSON first
              const optionObj = JSON.parse(option);
              const filterPath = field.filterOptionsBy!.split('.');
              let optionValue = optionObj;
              
              // Navigate through nested properties
              for (const prop of filterPath) {
                optionValue = optionValue[prop];
                if (optionValue === undefined) break;
              }
              
              const matches = String(optionValue).toLowerCase().includes(String(parentValue).toLowerCase());
              
              console.log('🔍 Chain Link Debug - Option filter check:', {
                option: option,
                parsedOption: optionObj,
                filterPath: filterPath,
                extractedValue: optionValue,
                parentValue: parentValue,
                matches: matches
              });
              
              return matches;
            } catch (e) {
              // If not JSON, treat as simple string
              const matches = option.toLowerCase().includes(String(parentValue).toLowerCase());
              
              console.log('🔍 Chain Link Debug - Simple string filter:', {
                option: option,
                parentValue: parentValue,
                matches: matches
              });
              
              return matches;
            }
          });
        } else {
          // Simple string matching
          filtered = field.options.filter(option =>
            option.toLowerCase().includes(String(parentValue).toLowerCase())
          );
          
          console.log('🔍 Chain Link Debug - Default string matching:', {
            parentValue: parentValue,
            filteredCount: filtered.length,
            filteredOptions: filtered
          });
        }

        console.log('🎯 Chain Link Debug - Filter result:', {
          childField: field.name,
          parentField: field.dependsOn,
          parentValue: parentValue,
          originalCount: field.options.length,
          filteredCount: filtered.length,
          filteredOptions: filtered
        });

        setFilteredOptions(filtered);
        
        // Clear current value if it's not in filtered options
        if (value && !filtered.includes(value)) {
          console.log('🧹 Chain Link Debug - Clearing invalid value:', {
            currentValue: value,
            reason: 'not in filtered options'
          });
          onChange('');
          setLocalValue('');
        }
      } else {
        console.log('🔗 Chain Link Debug - No parent value, showing all options:', {
          childField: field.name,
          parentField: field.dependsOn,
          allOptionsCount: field.options.length
        });
        setFilteredOptions(field.options);
      }
    } else {
      setFilteredOptions(field.options || []);
    }
  }, [field.dependsOn, field.filterOptionsBy, field.options, watchedValues, field.name, value, onChange]);

  // Handle suggestion-insert type
  useEffect(() => {
    if (field.type === 'suggestion-insert') {
      if (field.suggestions) {
        setSuggestions(field.suggestions);
      } else if (filteredOptions.length > 0) {
        // Use filtered options as suggestions
        setSuggestions(filteredOptions);
      }
    }
  }, [field.type, field.suggestions, filteredOptions]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);
    
    console.log('📝 Field value changed:', field.name, newValue);
    if (field.dependsOn) {
      console.log('🔗 Chain Link field changed:', {
        fieldName: field.name,
        newValue: newValue,
        parentField: field.dependsOn,
        parentValue: watchedValues[field.dependsOn]
      });
    }
  };

  const getDefaultValue = () => {
    if (field.default) {
      return resolveSystemVariable(field.default, {});
    }
    return '';
  };

  useEffect(() => {
    if (!value && field.default) {
      const defaultValue = getDefaultValue();
      setLocalValue(defaultValue);
      onChange(defaultValue);
    }
  }, [field.default]);

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
                try {
                  const optionObj = JSON.parse(option);
                  return (
                    <SelectItem key={index} value={option}>
                      {optionObj.label || optionObj.name || option}
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
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={field.placeholder || "Type or select from suggestions"}
                readOnly={field.readonly}
                className={error ? 'border-red-500' : ''}
              />
              {suggestions.length > 0 && (
                <Select onValueChange={(selectedValue) => {
                  try {
                    const optionObj = JSON.parse(selectedValue);
                    handleChange(optionObj.label || optionObj.name || selectedValue);
                  } catch {
                    handleChange(selectedValue);
                  }
                }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Suggestions" />
                  </SelectTrigger>
                  <SelectContent>
                    {suggestions.map((suggestion, index) => {
                      try {
                        const suggestionObj = JSON.parse(suggestion);
                        return (
                          <SelectItem key={index} value={suggestion}>
                            {suggestionObj.label || suggestionObj.name || suggestion}
                          </SelectItem>
                        );
                      } catch {
                        return (
                          <SelectItem key={index} value={suggestion}>
                            {suggestion}
                          </SelectItem>
                        );
                      }
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
            {field.dependsOn && (
              <div className="text-xs text-blue-600">
                Suggestions filtered by: {field.dependsOn} = {watchedValues[field.dependsOn]}
              </div>
            )}
          </div>
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
