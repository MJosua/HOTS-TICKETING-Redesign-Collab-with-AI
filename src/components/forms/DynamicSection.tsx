// DynamicSection.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicField } from "./DynamicField";
import { StructuredRowGroup } from "./StructuredRowGroup";
import { FormField, RowGroup } from "@/types/formTypes";

interface DynamicSectionProps {
  section: any;
  form: any;
  watchedValues: Record<string, any>;
  selectedObjects: Record<string, any>;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  setGlobalValues: React.Dispatch<React.SetStateAction<Record<string, any>>>; // 🧩 added
  globalValues: Record<string, any>; // 🧩 added
  setSelectedObjects: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  handleUpdateRowGroup?: (groupId: string, updatedRows: any[]) => void;
}

/**
 * DynamicSection
 * Handles rendering of grouped fields or rowgroups under a single visual card.
 */
export const DynamicSection: React.FC<DynamicSectionProps> = ({
  section,
  form,
  watchedValues,
  selectedObjects,
  setConfig,
  setGlobalValues,
  globalValues,
  setSelectedObjects,
  handleUpdateRowGroup,
}) => {
  const fields = section.fields || [];
  const title = section.title || "Section";

  // 🧩 unified handler for updating field value
  const handleFieldChange = (fieldName: string, value: any, fullOption?: any) => {
    form.setValue(fieldName, value);

    // 🔹 update global state
    setGlobalValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // 🔹 track selected objects
    setSelectedObjects((p) => ({
      ...p,
      [fieldName]:
        fullOption && typeof fullOption === "object"
          ? fullOption
          : { value },
    }));

    // 🔹 update config JSON for persistence
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.data?.name === fieldName
          ? { ...item, data: { ...item.data, value } }
          : item
      ),
    }));
  };

  const handleFieldBlur = (fieldName: string) => {
    setSelectedObjects((prev) => ({
      ...prev,
      __lastBlurField: fieldName,
    }));
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fields.map((f: FormField | RowGroup, i: number) => {
            const key =
              (f as FormField).name ||
              f.label?.toLowerCase()?.replace(/[^a-z0-9]/g, "_") ||
              `field_${i}`;

            // 🔹 If this is a field
            if ((f as FormField).type && (f as FormField).type !== "rowgroup") {
              const field = f as FormField;

              return (
                <DynamicField
                  key={field.name || i}
                  field={field}
                  value={globalValues[field.name] ?? field.value ?? ""}
                  globalValues={globalValues}
                  setGlobalValues={setGlobalValues}
                  setConfig={setConfig}
                  onChange={(val, full) => handleFieldChange(field.name, val, full)}
                  onBlur={() => handleFieldBlur(field.name)}
                  watchedValues={watchedValues}
                />
              );
            }

            // 🔹 If this is a rowgroup inside the section
            if ((f as RowGroup).type === "rowgroup") {
              const rg = f as RowGroup;
              return (
                <div key={rg.id || `rg_${i}`} className="col-span-3">
                  <StructuredRowGroup
                    rowGroup={rg}
                    rowGroupId={rg.id}
                    form={form}
                    watchedValues={watchedValues}
                    selectedObjects={selectedObjects}
                    currentFieldCount={0}
                    maxTotalFields={50}
                    globalValues={globalValues}
                    setGlobalValues={setGlobalValues}
                    onUpdateRowGroup={handleUpdateRowGroup || (() => {})}
                  />
                </div>
              );
            }

            return null;
          })}
        </div>
      </CardContent>
    </Card>
  );
};
