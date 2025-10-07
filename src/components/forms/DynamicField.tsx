
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
    if (!Array.isArray(memoizedSuggestions) || !Array.isArray(suggestions)) return;

    const changed =
      memoizedSuggestions.length !== suggestions.length ||
      memoizedSuggestions.some((v, i) => v !== suggestions[i]);

    if (changed) {
      setSuggestions(memoizedSuggestions);
    }
  }, [memoizedSuggestions, suggestions]);

  const handleChange = (newValue: any) => {
    setLocalValue(newValue);
    onChange(newValue);

    console.log('📝 [Field Change]:', {
      fieldName: field.name,
      fieldAttribute: field,
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
      case 'text': {
        return (
          <Input
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            className={error ? 'border-red-500' : ''}
          />
        )
      }
      case 'number': {
        const maxValue = field.maxnumber !== undefined ? field.maxnumber : undefined;
        const rounding = field.rounding || false;

        const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value;
          handleChange(val);
        };

        const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value;
          let numVal = Number(val);
          let opcalweek = field.weekopcal !== undefined ? localStorage.getItem("current_delv_week") : false;


          if (!isNaN(numVal)) {
            if (maxValue !== undefined && numVal > maxValue) {
              numVal = maxValue;
            }
            if (rounding) {
              numVal = Math.round(numVal / 25) * 25;
            }
            if (opcalweek && numVal < opcalweek) {
              numVal = opcalweek
            }

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
          <Select value={localValue} onValueChange={handleChange} disabled={field.readonly}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              {filteredOptions.map((option, index) => {
                if (!option) return null;
                try {
                  const parsed = JSON.parse(option);
                  return (
                    <SelectItem key={index} value={parsed.plan_id ?? option}>
                      {parsed.label || parsed.name || parsed.item_name || option}
                    </SelectItem>
                  );
                } catch {
                  let key = `option-${index}`;
                  let value = '';
                  let label = '';

                  if (typeof option === 'object' && option !== null) {
                    const objOption = option as any;

                    value =
                      objOption.value ||
                      objOption.label ||
                      objOption.item_name || // ✅ Added here
                      objOption.name ||
                      objOption.product_name_complete ||
                      objOption.description ||
                      JSON.stringify(objOption);

                    label =
                      objOption.label ||
                      objOption.item_name || // ✅ Added here
                      objOption.name ||
                      objOption.product_name_complete ||
                      objOption.description ||
                      value;

                    key = `${value}-${index}`;
                  } else {
                    try {
                      const parsed = JSON.parse(option);
                      value = parsed.plan_id ?? parsed.label ?? parsed.name ?? parsed.item_name ?? option;
                      label = parsed.label ?? parsed.name ?? parsed.item_name ?? option;
                      key = `${value}-${index}`;
                    } catch {
                      value = option;
                      label = option;
                      key = `fallback-${index}`;
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
            suggestions={filteredOptions}
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
