import React, { useEffect, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RowGroup } from "@/types/formTypes";
import { useToast } from "@/hooks/use-toast";
import { resolveSystemVariable } from "@/utils/systemVariableResolver";
import { useSystemVariableContext } from "@/utils/systemVariableDefinitions/systemVariableDefinitions";
import { SuggestionInsertInput } from "./SuggestionInsertInput";
import { NumberField } from "./NumberField";
import { compareValues } from "@/utils/dependencyResolver"; // 🧩 add safe comparator

export interface RowData {
  id: string;
  firstValue: string;
  secondValue: string;
  thirdValue: string;
}

interface StructuredRowGroupProps {
  rowGroup: RowGroup;
  rowGroupId: string;
  form: UseFormReturn<any>;
  groupIndex: number;
  maxTotalFields: number;
  currentFieldCount: number;
  onFieldCountChange: (count: number) => void;
  onUpdateRowGroup: (groupId: string, updatedRows: RowData[]) => void;
  onRowValueChange?: (groupId: string, rowValues: RowData[]) => void;
}

export const StructuredRowGroup: React.FC<StructuredRowGroupProps> = ({
  rowGroup,
  rowGroupId,
  form,
  groupIndex,
  maxTotalFields,
  currentFieldCount,
  watchedValues,
  onUpdateRowGroup,
  onRowValueChange,
}) => {
  const { toast } = useToast();
  const systemContext = useSystemVariableContext();

  // 🧠 ensure stable rows with fallback row
  const [rows, setRows] = useState<RowData[]>(() =>
    Array.isArray(rowGroup.rowGroup) && rowGroup.rowGroup.length > 0
      ? (rowGroup.rowGroup as RowData[])
      : [{ id: Date.now().toString(), firstValue: "", secondValue: "", thirdValue: "" }]
  );

  const structure = rowGroup.structure;
  if (!structure) return null;

  // 🧠 Resolve suggestions/options safely
  const resolvedSuggestions = useMemo(() => {
    return (structure.firstColumn?.options || []).map(opt =>
      resolveSystemVariable(opt, systemContext)
    ).flat().filter(Boolean);
  }, [structure.firstColumn?.options, systemContext]);

  const resolvedThirdOptions = useMemo(() => {
    return (structure.thirdColumn?.options || []).map(opt =>
      resolveSystemVariable(opt, systemContext)
    ).flat().filter(Boolean);
  }, [structure.thirdColumn?.options, systemContext]);

  const syncToParent = (newRows: RowData[]) => {
    setRows(newRows);
    onUpdateRowGroup(rowGroupId, newRows);
  };

  const addRow = () => {
    const newRow = { id: `row_${Date.now()}`, firstValue: "", secondValue: "", thirdValue: "" };
    const updated = [...rows, newRow];
    syncToParent(updated);
  };

  const removeRow = (rowId: string) => {
    const updated = rows.filter((r) => r.id !== rowId);
    if (updated.length === 0) return;
    syncToParent(updated);
  };

  const updateLocalRow = (rowId: string, field: keyof RowData, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)));
  };

  const confirmRowUpdate = (rowId: string, field: keyof RowData, value: string) => {
    const updated = rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r));
    onUpdateRowGroup(rowGroupId, updated);
    onRowValueChange?.(rowGroupId, updated); // 🔥 send to parent DynamicForm
  };

  const totalPcs = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const isPcs = r.thirdValue.toLowerCase().includes("pcs");
        const num = Number(r.secondValue);
        return sum + (isPcs && !isNaN(num) ? num : 0);
      }, 0),
    [rows]
  );

  const totalCtns = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const isCtn = r.thirdValue.toLowerCase().includes("ctn");
        const num = Number(r.secondValue);
        return sum + (isCtn && !isNaN(num) ? num : 0);
      }, 0),
    [rows]
  );

  useEffect(() => {
    if (rowGroup.structure.firstColumn.dependsOn) {
      const parentVal = watchedValues?.[rowGroup.structure.firstColumn.dependsOn];
      // Refilter options dynamically when parent changes
    }
  }, [watchedValues, rowGroup.structure.firstColumn.dependsOn]);

  
  // 🧩 unified renderer
  const renderField = (
    column: "firstColumn" | "secondColumn" | "thirdColumn",
    value: string,
    onChange: (val: string) => void,
    onCommit?: (val: string) => void
  ) => {
    const col = structure[column];

    switch (col.type) {
      case "suggestion-insert":
        return (
          <SuggestionInsertInput
            suggestions={resolvedSuggestions}
            placeholder={col.placeholder}
            defaultValue={value}
            onChange={(val, full) => onChange(val)}
            onEnter={(val, full) => onCommit?.(val)}
            onBlur={(val) => onCommit?.(val)}
          />
        );

      case "number":
        return (
          <NumberField
            value={value}
            onChange={(v) => {
              onChange(v);
              onCommit?.(v);
            }}
            placeholder={col.placeholder}
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(v) => {
              const matched = resolvedThirdOptions.find(opt => compareValues(opt, v));
              const display = typeof matched === "object"
                ? matched.item_name ?? matched.label ?? matched.name ?? String(v)
                : String(v);
              onChange(display);
              onCommit?.(display);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={col.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {resolvedThirdOptions.map((o, i) => {
                const text =
                  typeof o === "object"
                    ? o.label ?? o.item_name ?? o.name ?? JSON.stringify(o)
                    : String(o);
                return (
                  <SelectItem key={i} value={String(text)}>
                    {text}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onCommit?.(e.target.value)}
            placeholder={col.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-6 gap-4">
              <div className="col-span-3">
                {renderField(
                  "firstColumn",
                  r.firstValue,
                  (v) => updateLocalRow(r.id, "firstValue", v),
                  (v) => confirmRowUpdate(r.id, "firstValue", v)
                )}
              </div>
              <div className="col-span-1">
                {renderField(
                  "secondColumn",
                  r.secondValue,
                  (v) => updateLocalRow(r.id, "secondValue", v),
                  (v) => confirmRowUpdate(r.id, "secondValue", v)
                )}
              </div>
              <div className="col-span-2 flex items-center gap-2">
                {renderField(
                  "thirdColumn",
                  r.thirdValue,
                  (v) => updateLocalRow(r.id, "thirdValue", v),
                  (v) => confirmRowUpdate(r.id, "thirdValue", v)
                )}
                {rows.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeRow(r.id)}
                    className="h-[38px]"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-4 text-sm">
            <span>Total Pcs: {totalPcs}</span>
            <span>Total Ctns: {totalCtns}</span>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
};
