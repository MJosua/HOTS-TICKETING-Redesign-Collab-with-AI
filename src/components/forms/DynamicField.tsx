import React, { useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/types/formTypes";
import { SuggestionInsertInput } from "./SuggestionInsertInput";
import { compareValues } from "@/utils/dependencyResolver";

interface DynamicFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any, fullOption?: any) => void;
  onBlur?: (name?: string) => void;
  setConfig?: React.Dispatch<React.SetStateAction<any>>;
  globalValues: Record<string, any>; // 🧩 new
  setGlobalValues: React.Dispatch<React.SetStateAction<Record<string, any>>>; // 🧩 new
  watchedValues?: Record<string, any>;
  error?: string;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onBlur,
  onChange,
  setConfig,
  globalValues,
  setGlobalValues,
  currentValue,
  watchedValues = {},
  error,
}) => {
  // 🧩 get the current field value directly from global state

  // ✅ keep field options fresh
  const resolvedOptions = useMemo(() => {
    if (!Array.isArray(field.options)) return [];
    return field.options.filter(Boolean);
  }, [field.options]);

  // ✅ unified handler for any value change
  const handleChange = (newValue: any, fullOption?: any) => {
    onChange(newValue, fullOption); // let parent manage globalValues + config
  };

  // ✅ default value sync on mount if needed
  useEffect(() => {
    if (
      (globalValues[field.name] === undefined || globalValues[field.name] === "") &&
      field.default
    ) {
      const defaultValue = Array.isArray(field.default)
        ? field.default.join(", ")
        : field.default;
      onChange(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBlur = useCallback(() => {
    if (typeof onBlur === "function") onBlur(field.name);
  }, [field.name, onBlur]);

  // 🧩 input renderer
  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            value={globalValues[field.name]}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            required={field.required}
            className={error ? "border-red-500" : ""}
            onBlur={handleBlur}
          />
        );

      case "number":
        const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange(e.target.value);

        const handleNumberBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value;
          let numVal = Number(val);
          const { maxnumber, rounding, minnumber } = field;
          if (!isNaN(numVal)) {
            if (maxnumber && numVal > maxnumber) numVal = maxnumber;
            if (minnumber && numVal < minnumber) numVal = minnumber;
            if (rounding) numVal = Math.round(numVal / 25) * 25;
            // if (weekopcal) {
            //   const opcalWeek = Number(localStorage.getItem("current_delv_week"));
            //   if (numVal < opcalWeek) numVal = opcalWeek;
            // }


          }
          handleChange(numVal.toString());
        };

        return (
          <Input
            type="number"
            value={currentValue}
            onChange={handleNumberChange}
            onBlur={handleNumberBlur}
            required={field.required}
            placeholder={field.placeholder}
            readOnly={field.readonly}
            className={error ? "border-red-500" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            readOnly={field.readonly}
            className={error ? "border-red-500" : ""}
          />
        );

      case "select":
        return (
          <Select
            value={globalValues[field.name]}
            required={field.required}
            onValueChange={(newVal) => {
              const found = resolvedOptions.find((opt) => compareValues(opt, newVal));
              handleChange(newVal, found);
              handleBlur();
            }}
            disabled={field.readonly}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              {resolvedOptions.map((option, index) => {
                let value = "";
                let label = "";
                if (typeof option === "object" && option !== null) {
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

      case "suggestion-insert":
        return (
          <SuggestionInsertInput
            suggestions={resolvedOptions}
            value={currentValue}            // 👈 this comes directly from globalValues[field.name]
            readOnly={field.readonly}
            placeholder={field.placeholder}
            required={field.required}
            onChange={(val, full) => handleChange(val, full)}
            onEnter={(val, full) => {
              handleChange(val, full);
              handleBlur();
            }}
            onBlur={handleBlur}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={!!currentValue}
              onCheckedChange={(v) => handleChange(v)}
              required={field.required}
              disabled={field.readonly}
            />
            <Label>{field.placeholder}</Label>
          </div>
        );

      case "toggle":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!currentValue}
              onCheckedChange={(v) => handleChange(v)}
              required={field.required}
              disabled={field.readonly}
            />
            <Label>{field.placeholder}</Label>
          </div>
        );

      case "date":
      case "time":
        return (
          <Input
            type={field.type}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
            readOnly={field.readonly}
            className={error ? "border-red-500" : ""}
          />
        );

      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleChange(file.name, file);
            }}
            accept={field.accept?.join(",")}
            multiple={field.multiple}
            required={field.required}
            disabled={field.readonly}
            className={error ? "border-red-500" : ""}
          />
        );

      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            readOnly={field.readonly}
            className={error ? "border-red-500" : ""}
          />
        );
    }
  };

  return (
    <div
      className={`space-y-2 ${field.columnSpan === 2
        ? "col-span-2"
        : field.columnSpan === 3
          ? "col-span-3"
          : "col-span-1"
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
