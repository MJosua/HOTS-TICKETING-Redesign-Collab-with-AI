import React, { useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { SuggestionInsertInput } from "./SuggestionInsertInput";
import { NumberField } from "./NumberField";
import { compareValues, getNested } from "@/utils/dependencyResolver";
import { applyFieldRules } from "@/utils/rulingSystem/applyFieldRules";
import { useToast } from "@/hooks/use-toast";

interface RowData {
  id: string;
  firstValue: string;
  secondValue: string;
  thirdValue: string;
}

interface StructuredRowGroupProps {
  rowGroup: RowGroup;
  rowGroupId: string;
  form: UseFormReturn<any>;
  maxTotalFields: number;
  currentFieldCount: number;
  onUpdateRowGroup: (groupId: string, updatedRows: RowData[]) => void;
  watchedValues?: Record<string, any>;
  selectedObjects?: Record<string, any>;
  globalValues: Record<string, any>;
  setGlobalValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export const StructuredRowGroup: React.FC<StructuredRowGroupProps> = ({
  rowGroup,
  rowGroupId,
  form,
  onUpdateRowGroup,
  watchedValues,
  selectedObjects,
  globalValues,
  setGlobalValues,
}) => {
  const structure = rowGroup.structure;

  const {toast} = useToast();

  const rows: RowData[] = useMemo(() => {
    const currentRows = globalValues?.[rowGroupId];
    if (Array.isArray(currentRows)) {
      return [...currentRows]; // Always create new reference
    }

    const initialRow: RowData = {
      id: `row_${Date.now()}`,
      firstValue: "",
      secondValue: "",
      thirdValue: "",
    };

    setGlobalValues((prev) => ({
      ...prev,
      [rowGroupId]: [initialRow],
    }));

    return [initialRow];
  }, [globalValues, rowGroupId]);

  const syncToGlobal = (newRows: RowData[]) => {
    setGlobalValues((prev) => {
      const prevRows = prev[rowGroupId] || [];
      // Skip if a rule just reset the group and newRows is identical
      if (
        prevRows.length === 1 &&
        prevRows[0].firstValue === "" &&
        prevRows[0].secondValue === "" &&
        prevRows[0].thirdValue === "" &&
        newRows.length === 1 &&
        newRows[0].firstValue === "" &&
        newRows[0].secondValue === "" &&
        newRows[0].thirdValue === ""
      ) {
        console.log("⚠️ Skipped redundant update (already reset)");
        return prev;
      }
      return { ...prev, [rowGroupId]: newRows };
    });
    onUpdateRowGroup(rowGroupId, newRows);
  };


  const updateRowField = (rowId: string, field: keyof RowData, value: string) => {
    const updated = rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r));
    syncToGlobal(updated);
  };

  const addRow = () => {
    if (rowGroup.maxRows > rows.length) {

      const newRow: RowData = {
        id: `row_${Date.now()}`,
        firstValue: "",
        secondValue: "",
        thirdValue: "",
      };

      setGlobalValues((prev) => {
        const existing = Array.isArray(prev[rowGroupId]) ? prev[rowGroupId] : [];
        const updated = [...existing, newRow];

        console.log("➕ Adding new row:", newRow);
        return { ...prev, [rowGroupId]: updated };
      });

      onUpdateRowGroup(rowGroupId, [
        ...(globalValues?.[rowGroupId] || []),
        newRow,
      ]);

    } else {

      toast({
        title: `Can't Add More Item `,
        description:  `Failed to add item max is  ${rowGroup.maxRows}`,
        variant: "destructive",
      });

    }
  };

  const removeRow = (rowId: string) => {
    const updated = rows.filter((r) => r.id !== rowId);
    if (updated.length > 0) syncToGlobal(updated);
  };

  const getFilteredOptions = (col: any, opts: any[]) => {
    if (!col) return opts || [];
    const parentVal =
      selectedObjects?.[col.dependsOn] ?? watchedValues?.[col.dependsOn];
    const parentFilterVal =
      typeof parentVal === "object"
        ? getNested(parentVal, col.dependsOnValue || "value")
        : parentVal;
    if (!parentFilterVal) return opts || [];
    return opts.filter((opt) => {
      try {
        const val =
          col.dependsByValue && typeof opt === "object"
            ? getNested(opt, col.dependsByValue)
            : typeof opt === "object" && opt.filter !== undefined
              ? opt.filter
              : opt;
        return compareValues(val, parentFilterVal);
      } catch {
        return true;
      }
    });
  };

  const filteredFirstOptions = useMemo(() => {
    const col = structure.firstColumn;
    return getFilteredOptions(col, Array.isArray(col.options) ? col.options : []);
  }, [structure.firstColumn.options, watchedValues, selectedObjects]);

  const filteredSecondOptions = useMemo(() => {
    const col = structure.secondColumn;
    return getFilteredOptions(col, Array.isArray(col.options) ? col.options : []);
  }, [structure.secondColumn.options, watchedValues, selectedObjects]);

  const filteredThirdOptions = useMemo(() => {
    const col = structure.thirdColumn;
    return getFilteredOptions(col, Array.isArray(col.options) ? col.options : []);
  }, [structure.thirdColumn.options, watchedValues, selectedObjects]);

  const renderField = (
    column: "firstColumn" | "secondColumn" | "thirdColumn",
    value: string,
    onChange: (val: string) => void,
    rowId?: string
  ) => {
    let col = structure[column];
    col = applyFieldRules(col, {
      watchedValues: globalValues,
      selectedObjects: selectedObjects || {},
      rowContext: {
        rowGroupId,
        columnKey: column, // "firstColumn", "secondColumn", or "thirdColumn"
      },
      setGlobalValues,
      autoSetValue: (fieldName: string, value: any) => {
        const fieldKey =
          column === "firstColumn"
            ? "firstValue"
            : column === "secondColumn"
              ? "secondValue"
              : "thirdValue";

        // Normal update logic
        const updatedRows = (globalValues?.[rowGroupId] || rows || []).map((r) => ({
          ...r,
          [fieldKey]: value ?? "",
        }));

        setGlobalValues((prev) => ({
          ...prev,
          [rowGroupId]: updatedRows,
        }));

        console.log(`🧹 Cleared all '${fieldKey}' in ${rowGroupId}`);
      },
    });

    const opts =
      column === "firstColumn"
        ? filteredFirstOptions
        : column === "secondColumn"
          ? filteredSecondOptions
          : filteredThirdOptions;

    switch (col.type) {
      case "suggestion-insert":
        return (
          <SuggestionInsertInput
            suggestions={opts}
            placeholder={col.placeholder}
            required={col.required}
            value={value}
            onChange={onChange}
          />
        );
      case "number":
        return (
          <NumberField
            value={value}
            onChange={(v) => onChange(v)}
            placeholder={col.placeholder}
            rounding={col.rounding}
            maxValue={col.maxnumber}
            readOnly={col.readonly}
            required={col.required}
          />
        );
      case "select":
        return (
          <Select value={value} onValueChange={(v) => onChange(v)} disabled={col.readonly}
          required={col.required}
          
          >
            <SelectTrigger>
              <SelectValue placeholder={col.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {opts.map((o, i) => {
                const text =
                  typeof o === "object"
                    ? o.label ?? o.item_name ?? o.name ?? JSON.stringify(o)
                    : String(o);
                return (
                  <SelectItem key={i} value={text}>
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
            placeholder={col.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Item List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-6 gap-4">
              <div className="col-span-3">
                {renderField("firstColumn", r.firstValue, (v) => updateRowField(r.id, "firstValue", v), r.id)}
              </div>
              <div className="col-span-1">
                {renderField("secondColumn", r.secondValue, (v) => updateRowField(r.id, "secondValue", v), r.id)}
              </div>
              <div className="col-span-2 flex items-center gap-2">
                {renderField("thirdColumn", r.thirdValue, (v) => updateRowField(r.id, "thirdValue", v), r.id)}
                {rows.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => removeRow(r.id)} className="h-[38px]">
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};
