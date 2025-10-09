// DynamicSection.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicField } from "./DynamicField";
import { StructuredRowGroup } from "./StructuredRowGroup";

export const DynamicSection = ({
  section,
  form,
  watchedValues,
  selectedObjects,
  setWatchedValues,
  setSelectedObjects,
  handleUpdateRowGroup,
  currentFieldCount,
  setStructuredRowCounts,
  shouldShowField,
}) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{section.label || "Section"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(section.fields || []).map((field) => (
            <DynamicField
              key={field.id}
              field={field}
              value={form.watch(field.name)}
              onChange={(v, obj) => {
                form.setValue(field.name, v);
                setWatchedValues((p) => ({ ...p, [field.name]: v }));
                setSelectedObjects((p) => ({
                  ...p,
                  [field.name]: obj || { value: v },
                }));
              }}
              watchedValues={watchedValues}
              selectedObjects={selectedObjects}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
