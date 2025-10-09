import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { DynamicField } from "./DynamicField";
import { RowGroupField } from "./RowGroupField";
import { RepeatingSection } from "./RepeatingSection";
import { StructuredRowGroup } from "./StructuredRowGroup";
import WidgetRenderer from "@/components/widgets/WidgetRenderer";
import { FormConfig, FormField, RowGroup, FormSection } from "@/types/formTypes";
import { WidgetConfig } from "@/types/widgetTypes";
import { getWidgetById } from "@/registry/widgetRegistry";
import { mapUnifiedForm, getMaxFormFields } from "@/utils/formFieldMapping";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { createTicket, uploadFiles } from "@/store/slices/ticketsSlice";
import { selectServiceWidgets } from "@/store/slices/catalogSlice";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { resolveSystemVariable } from "@/utils/systemVariableResolver";
import { useSystemVariableContext } from "@/utils/systemVariableDefinitions/systemVariableDefinitions";
import { compareValues, getNested } from "@/utils/dependencyResolver";
import { DynamicSection } from "./DynamicSection";

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
  const [watchedValues, setWatchedValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [structuredRowCounts, setStructuredRowCounts] = useState<Record<number, number>>({});
  const systemContext = useSystemVariableContext();
  const serviceWidgetIds = useAppSelector((s) =>
    serviceId ? selectServiceWidgets(s, parseInt(serviceId)) : []
  );

  const memoizedWatchedValues = useMemo(() => watchedValues, [watchedValues]);
  const maxFields = useMemo(() => getMaxFormFields(), []);

  // ✅ Rowgroup updater — stable reference
  const handleUpdateRowGroup = useCallback(
    (groupId: string, updatedRows) => {
      setConfig((prev) => {
        const updatedItems = prev.items.map((item) =>
          item.type === "rowgroup" && item.id === groupId
            ? { ...item, data: { ...item.data, rowGroup: updatedRows } }
            : item
        );
        return { ...prev, items: updatedItems };
      });
    },
    [setConfig]
  );

  const assignedWidgets: WidgetConfig[] = useMemo(() => {
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

  const handleSubmit = async (data: any) => {
    if (!serviceId) {
      const mappedData = mapUnifiedForm(data, config.items || []);
      toast({
        title: "TEST NO SERVICE ID",
        description: JSON.stringify(mappedData, null, 2),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const mappedData = mapUnifiedForm(data, config.items || []);
      const ticketData = { subject: data.subject || "Service Request", ...mappedData };
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

  const shouldShowField = useCallback(
    (field: FormField, values: Record<string, any>) => {
      if (!field.uiCondition) return true;
      if (field.uiCondition.includes("toggle is on")) {
        const toggled = Object.keys(values).some(
          (k) => form.watch(k) === true || form.watch(k) === "on"
        );
        return toggled;
      }
      return true;
    },
    [form]
  );




  // ✅ Resolve system vars once
  const transformedItems = useMemo(() => {
    if (!config?.items) return [];

    const resolveSystemVarsDeep = (value: any, context: any): any => {
      if (Array.isArray(value)) {
        return value.flatMap(v => resolveSystemVarsDeep(v, context)).filter(Boolean);
      } else if (value && typeof value === "object") {
        const resolvedObj: Record<string, any> = {};
        for (const [key, val] of Object.entries(value)) {
          resolvedObj[key] = resolveSystemVarsDeep(val, context);
        }
        return resolvedObj;
      } else if (typeof value === "string") {
        const resolved = resolveSystemVariable(value, context);
        if (Array.isArray(resolved)) return resolved.flat().filter(Boolean);
        return resolved;
      }
      return value;
    };

    return config.items.map((item) => {
      switch (item.type) {
        case "field": {
          const resolvedField = resolveSystemVarsDeep(item.data, systemContext);
          return { ...item, data: resolvedField };
        }

        case "section": {
          const section = resolveSystemVarsDeep(item.data, systemContext);
          return { ...item, data: section };
        }

        case "rowgroup": {
          const rowGroup = resolveSystemVarsDeep(item.data, systemContext);
          return { ...item, data: rowGroup };
        }

        default:
          return item;
      }
    });
  }, [config.items, systemContext]);

  const currentFieldCount = useMemo(() => {
    if (!config?.items) return 0;
    return config.items.reduce((acc, i) => {
      if (i.type === "field") return acc + 1;
      if (i.type === "rowgroup") {
        return acc + (Array.isArray(i.data?.rowGroup) ? i.data.rowGroup.length : 0);
      }
      return acc;
    }, 0);
  }, [config.items]);


  const [selectedObjects, setSelectedObjects] = useState<Record<string, any>>({});
  const [rowGroupValues, setRowGroupValues] = useState<Record<string, any[]>>({});



  const itemsWithFilteredOptions = transformedItems.map((item) => {
    if (item.type !== "field") return item;

    const field = item.data;

    if (field.dependsOn) {
      const parentValue =
        selectedObjects?.[field.dependsOn] ??
        watchedValues?.[field.dependsOn] ??
        rowGroupValues?.[field.dependsOn]?.[0];

      const parentFilterVal =
        typeof parentValue === "object"
          ? parentValue[field.dependsOtherFieldByValue || "value"] ??
          parentValue.value ??
          parentValue.label ??
          parentValue.item_name ??
          parentValue.name
          : parentValue;

      if (Array.isArray(field.options)) {
        const filteredOptions = field.options.filter((opt: any) => {
          try {
            // Extract value inside each option
            let optVal: any;
            if (field.filterOptionsBy && opt && typeof opt === "object") {
              optVal = getNested(opt, field.filterOptionsBy);
            } else if (opt && typeof opt === "object" && opt.filter !== undefined) {
              optVal = opt.filter;
            } else {
              optVal = opt;
            }

            // Fallbacks
            if (parentFilterVal == null || parentFilterVal === "") return true;
            if (optVal == null) return true;

            // Compare safely
            return compareValues(optVal, parentFilterVal);
          } catch (err) {
            console.warn("⚠️ Filtering error:", err, field.name, opt);
            return true;
          }
        });

        return { ...item, data: { ...field, options: filteredOptions } };
      }
    }

    return item;
  });


  // console.log("item",itemsWithFilteredOptions)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {assignedWidgets.map((w) => (
        <WidgetRenderer
          key={w.id}
          config={w}
          handleReload={handleReload}
          data={{ formData: watchedValues, userData: user, serviceId }}
        />
      ))}

      <Card>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {itemsWithFilteredOptions
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {




                    switch (item.type) {
                      case "field":


                        const field = item.data as FormField;
                        const key =
                          field.name ||
                          field.label.toLowerCase().replace(/[^a-z0-9]/g, "_");
                        if (!shouldShowField(field, watchedValues)) return null;
                        return (
                          <div key={item.id} className="contents">
                            <DynamicField
                              field={field}
                              value={form.watch(key)}

                              onChange={(val, fullOption) => {
                                form.setValue(key, val);
                                setWatchedValues((p) => ({ ...p, [key]: val }));

                                if (fullOption && typeof fullOption === "object") {
                                  setSelectedObjects((p) => ({ ...p, [key]: fullOption }));
                                } else {
                                  setSelectedObjects((p) => ({ ...p, [key]: { value: val } }));
                                }
                              }
                              }
                              watchedValues={memoizedWatchedValues}
                            />
                          </div>
                        );

                      case "rowgroup": {
                        const rg = item.data as RowGroup;
                        const groupIndex = config.items.findIndex(
                          (i) => i.id === item.id
                        );
                        return (
                          <div key={item.id} className="col-span-3">
                            <StructuredRowGroup
                              rowGroup={rg}
                              rowGroupId={item.id}
                              form={form}
                              groupIndex={groupIndex}
                              maxTotalFields={50}
                              currentFieldCount={currentFieldCount}
                              onFieldCountChange={(count) =>
                                setStructuredRowCounts((prev) => ({
                                  ...prev,
                                  [groupIndex]: count,
                                }))
                              }
                              onUpdateRowGroup={handleUpdateRowGroup}
                              onRowValueChange={(groupId, rowValues) => {
                                setRowGroupValues((prev) => ({
                                  ...prev,
                                  [groupId]: rowValues,
                                }));
                              }}
                              watchedValues={memoizedWatchedValues}
                              selectedObjects={selectedObjects}
                            />
                          </div>
                        );
                      }


                      case "section": {
                        const section = item.data;
                        const parentVal = watchedValues?.[section.dependsOn];
                        if (section.dependsOn && parentVal !== section.dependsOnValue) return null;
                        return (
                          <div key={item.id} className="col-span-3">
                            <DynamicSection
                              section={section}
                              form={form}
                              watchedValues={memoizedWatchedValues}
                              selectedObjects={selectedObjects}
                              setWatchedValues={setWatchedValues}
                              setSelectedObjects={setSelectedObjects}
                              handleUpdateRowGroup={handleUpdateRowGroup}
                              currentFieldCount={currentFieldCount}
                              setStructuredRowCounts={setStructuredRowCounts}
                              shouldShowField={shouldShowField}
                            />
                          </div>
                        );
                      }

                      default:
                        return null;
                    }
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
    </div>
  );
};
