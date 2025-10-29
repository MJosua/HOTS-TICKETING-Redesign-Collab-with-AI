import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { DynamicField } from "./DynamicField";
import { StructuredRowGroup } from "./StructuredRowGroup";
import WidgetRenderer from "@/components/widgets/WidgetRenderer";
import { FormConfig, FormField, RowGroup } from "@/types/formTypes";
import { WidgetConfig } from "@/types/widgetTypes";
import { getWidgetById } from "@/registry/widgetRegistry";
import { mapUnifiedForm, getMaxFormFields } from "@/utils/formFieldMapping";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { createTicket } from "@/store/slices/ticketsSlice";
import { selectServiceWidgets } from "@/store/slices/catalogSlice";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { resolveSystemVariable } from "@/utils/systemVariableResolver";
import { useSystemVariableContext } from "@/utils/systemVariableDefinitions/systemVariableDefinitions";
import { compareValues, getNested } from "@/utils/dependencyResolver";
import { DynamicSection } from "./DynamicSection";
import { applyFieldRules } from "@/utils/rulingSystem/applyFieldRules";
import { ruleActions } from "@/utils/rulingSystem/ruleActions";
import { WarningDialog } from "../dialog/warningdialoguser";
import { normalizeSchema } from "@/utils/rulingSystem/schemaNormalizer";

// 🕒 Simple debounce utility
const debounce = (fn: (...args: any[]) => void, delay = 300) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const DynamicForm: React.FC<{
  config: FormConfig;
  setConfig: React.Dispatch<React.SetStateAction<FormConfig>>;
  onSubmit: (data: any) => void;
  serviceId?: string;
  handleReload?: () => void;
}> = ({ config, setConfig, onSubmit, serviceId, handleReload }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm();
  const { user } = useAppSelector((s) => s.auth);

  const [normalizedSchema, setNormalizedSchema] = useState(null); // 🧩 NEW

  // 🌍 Global Form States
  const [globalValues, setGlobalValues] = useState<Record<string, any>>({});
  const [selectedObjects, setSelectedObjects] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [externalSystemVars, setExternalSystemVars] = useState<Record<string, any>>({});
  const [systemVarsVersion, setSystemVarsVersion] = useState(0);
  const [isOpenwarning, setIsOpenwarning] = useState(false);

  const systemContext = useSystemVariableContext();
  const serviceWidgetIds = useAppSelector((s) =>
    serviceId ? selectServiceWidgets(s, parseInt(serviceId)) : []
  );

  const memoizedWatchedValues = useMemo(() => globalValues, [globalValues]);
  const maxFields = useMemo(() => getMaxFormFields(), []);

  // 🧩 Handle rowgroup updates
  const handleUpdateRowGroup = useCallback(
    (groupId: string, updatedRows) => {
      setConfig((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.type === "rowgroup" && item.id === groupId
            ? { ...item, data: { ...item.data, rowGroup: updatedRows } }
            : item
        ),
      }));
    },
    [setConfig]
  );


  useEffect(() => {
    if (config && Array.isArray(config.items)) {
      const normalized = normalizeSchema(config);
      setNormalizedSchema(normalized);
      console.log("🧩 Normalized schema loaded:", normalized);
    }
  }, [config]);

  // 🧩 Assign service widgets
  const assignedWidgets = useMemo(() => {
    const ids = Array.isArray(serviceWidgetIds)
      ? serviceWidgetIds
      : serviceWidgetIds
        ? [serviceWidgetIds]
        : [];
    return ids
      .map(getWidgetById)
      .filter((w): w is WidgetConfig => !!w)
      .filter((w) => w.applicableTo.includes("form"));
  }, [serviceWidgetIds]);

  // 🧩 Submit handler
  const handleSubmit = async (data: any) => {
    if (!serviceId) {
      const mappedData = mapUnifiedForm(globalValues, config.items, selectedObjects || []);
      toast({
        title: "TEST MODE",
        description: JSON.stringify(mappedData, null, 2),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const mappedData = mapUnifiedForm(globalValues, config.items, selectedObjects || []);
      const ticketData = { subject: data.subject || "Service Request", ...mappedData };

      console.log("ticketData", ticketData);

      const result = await dispatch(createTicket({ serviceId, ticketData })).unwrap();
      if (result.success) {
        toast({ title: "Success", description: "Submitted successfully!" });
        navigate("/my-tickets");
      } else throw new Error(result.message || "Failed");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🧩 Confirmation dialog
  const handleCancelWarning = () => setIsOpenwarning(false);

  const handlecheckvalue = useCallback(() => {
    const items = globalValues?.rowgroup_items;

    // ✅ Validate that rowgroup_items exist
    if (!Array.isArray(items) || items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item before submitting.",
        variant: "destructive",
      });
      return false;
    }

    // ✅ Check that all secondValue > 0
    const invalidRows = items.filter(
      (row) => Number(row.secondValue) <= 0 || isNaN(Number(row.secondValue))
    );

    if (invalidRows.length > 0) {
      toast({
        title: "Invalid Quantity",
        description: "Each item’s quantity (second value) must be greater than 0.",
        variant: "destructive",
      });
      return false;
    } else {
      setIsOpenwarning(true);
    }

    return true;
  }, [globalValues, toast]);
  // 🧩 Conditional field visibility
  const shouldShowField = useCallback(
    (field: FormField, values: Record<string, any>) => {
      if (!field.uiCondition) return true;
      if (field.uiCondition.includes("toggle is on")) {
        return Object.keys(values).some(
          (k) => globalValues[k] === true || globalValues[k] === "on"
        );
      }
      return true;
    },
    [globalValues]
  );

  // 🧩 System variable resolver
  const transformedItems = useMemo(() => {
    if (!config?.items) return [];
    const mergedContext = { ...systemContext, ...externalSystemVars };
    const resolveDeep = (value: any, context: any): any => {
      if (Array.isArray(value)) {
        return value.flatMap((v) => resolveDeep(v, context)).filter(Boolean);
      } else if (value && typeof value === "object") {
        return Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, resolveDeep(v, context)])
        );
      } else if (typeof value === "string") {
        const resolved = resolveSystemVariable(value, context);
        if (Array.isArray(resolved)) return resolved.flat().filter(Boolean);
        return resolved;
      }
      return value;
    };
    return config.items.map((item) => {
      const resolvedData = resolveDeep(item.data, { ...mergedContext, _version: systemVarsVersion });
      return { ...item, data: resolvedData };
    });
  }, [config.items, systemContext, externalSystemVars, systemVarsVersion]);

  // 🧩 Update options from API or rule
  const handleFieldOptionsUpdate = (fieldName, newOptions) => {
    console.log(`🧩 Updating options for ${fieldName}`, newOptions);
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.data.name === fieldName
          ? { ...item, data: { ...item.data, options: newOptions } }
          : item
      ),
    }));
  };

  // 🧠 Apply rules (top-level only)
  const itemsWithRules = useMemo(() => {
    return transformedItems.map((item) => {
      if (item.type !== "field") return item;
      const field = item.data;
      const ruledField = applyFieldRules(field, {
        globalValues,
        selectedObjects,
        onFieldOptionsUpdate: handleFieldOptionsUpdate,
        setGlobalValues,
        rowContext: {},
        schema: normalizedSchema, // 🧩 important
      });
      return { ...item, data: ruledField };
    });
  }, [transformedItems, globalValues, selectedObjects, handleFieldOptionsUpdate]);


  console.log("glovalbalcue", globalValues)
  // 🧩 Render UI
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <WarningDialog
        isOpen={isOpenwarning}
        title="Ticket Submit"
        description="Are you sure you want to submit this ticket ?"
        confirmLabel="Yes"
        cancelLabel="Cancel"
        onConfirm={handleSubmit}
        onCancel={handleCancelWarning}
      />

      {assignedWidgets.map((w) => (
        <WidgetRenderer
          key={w.id}
          config={w}
          handleReload={handleReload}
          data={{ formData: globalValues, userData: user, serviceId }}
        />
      ))}
      {

        !normalizedSchema
          ?
          <div className="text-center text-gray-500">Loading form schema...</div>
          :

          <Card>
            <CardHeader>
              <CardTitle>{config.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handlecheckvalue)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {itemsWithRules
                      .sort((a, b) => a.order - b.order)
                      .map((item) => {
                        if (item.type === "field") {
                          const field = item.data as FormField;
                          const key = field.name || field.label.toLowerCase().replace(/[^a-z0-9]/g, "_");
                          if (!shouldShowField(field, globalValues)) return null;

                          const currentValue = globalValues?.[field.name] ?? field.value ?? "";

                          return (
                            <div key={item.id} className="contents">
                              <DynamicField
                                field={field}
                                setConfig={setConfig}
                                value={currentValue}
                                onChange={(val, fullOption) => {
                                  form.setValue(key, val);
                                  setGlobalValues((p) => ({ ...p, [key]: val }));
                                  setSelectedObjects((p) => ({ ...p, [key]: fullOption }));
                                }}
                                onBlur={() => {
                                  setSelectedObjects((prev) => ({
                                    ...prev,
                                    __lastBlurField: field.name,
                                  }));
                                  const val = globalValues?.[field.name];
                                  if (typeof val === "string") {
                                    const trimmed = val.trim();
                                    if (trimmed !== val) {
                                      setGlobalValues((p) => ({ ...p, [field.name]: trimmed }));
                                    }
                                  }
                                }}
                                globalValues={globalValues}
                                setGlobalValues={setGlobalValues}
                                watchedValues={memoizedWatchedValues}
                                currentValue={currentValue}
                              />
                            </div>
                          );
                        }

                        if (item.type === "rowgroup") {
                          const rg = item.data as RowGroup;
                          return (
                            <div key={item.id} className="col-span-3">
                              <StructuredRowGroup
                                rowGroup={rg}
                                rowGroupId={item.id}
                                form={form}
                                watchedValues={memoizedWatchedValues}
                                selectedObjects={selectedObjects}
                                currentFieldCount={0}
                                maxTotalFields={50}
                                globalValues={globalValues}
                                setGlobalValues={setGlobalValues}
                                onUpdateRowGroup={handleUpdateRowGroup}
                                schema={normalizedSchema}
                              />
                            </div>
                          );
                        }

                        if (item.type === "section") {
                          const section = item.data;
                          const parentVal = globalValues?.[section.dependsOn];
                          if (section.dependsOn && parentVal !== section.dependsOnValue) return null;

                          return (
                            <div key={item.id} className="col-span-3">
                              <DynamicSection
                                section={section}
                                form={form}
                                watchedValues={memoizedWatchedValues}
                                selectedObjects={selectedObjects}
                                setConfig={setConfig}
                                globalValues={globalValues}
                                setGlobalValues={setGlobalValues}
                                setSelectedObjects={setSelectedObjects}
                                handleUpdateRowGroup={handleUpdateRowGroup}
                              />
                            </div>
                          );
                        }

                        return null;
                      })}
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
      }




      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
          <div className="flex flex-col items-center p-6 bg-gray-800 text-white rounded-lg shadow-lg">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
            <p>Submitting...</p>
          </div>
        </div>
      )}
    </div>
  );
};
