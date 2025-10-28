import { getNested } from "@/utils/dependencyResolver";
import { evaluateCondition } from "./ruleoperator/ruleoperators";
import { ruleActions } from "./ruleActions";

/**
 * applyFieldRules - robust version with:
 * - deterministic rule evaluation (no stale matches)
 * - explicit default rule application
 * - rowgroup mapping (item_name->firstValue, etc.)
 * - reliable setGlobalValues updates (detects real changes)
 * - microtask-set for autoSelectFirst
 * - verbose DEBUG logs controllable via window.__debugRules
 */

const lastApiValue: Record<string, any> = {};
const lastClearTrigger: Record<string, any> = {};
const lastRowValues: Record<string, any> = {};
const debugMode = true;
const DEBUG = debugMode && typeof window !== "undefined" && !!(window as any).__debugRules;

// mapping logical names -> row keys
const fieldMap: Record<string, string> = {
  item_name: "firstValue",
  quantity: "secondValue",
  unit: "thirdValue",
  firstColumn: "firstValue",
  secondColumn: "secondValue",
  thirdColumn: "thirdValue",
};

function isSame(a: any, b: any) {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

export function applyFieldRules(
  field: any,
  {
    watchedValues,
    globalValues,
    selectedObjects = {},
    onFieldOptionsUpdate,
    autoSetValue,
    rowContext,
    setGlobalValues,
    onUpdateRowGroup,
  }: {
    watchedValues?: Record<string, any>;
    globalValues?: Record<string, any>;
    selectedObjects?: Record<string, any>;
    onFieldOptionsUpdate?: (fieldName: string, newOptions: any[]) => void;
    autoSetValue?: (fieldName: string, value: any, fullOption: any) => void;
    rowContext?: { rowGroupId?: string; rowId?: string; columnKey?: string; currentEditingRowId?: string };
    setGlobalValues?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    onUpdateRowGroup?: (groupId: string, updatedRows: any[]) => void;
  }
) {
  if (!field || !field.rules) return field;

  // Simple single-field queue: requeue if another field is processing
  if (typeof window !== "undefined") {
    if ((window as any).__ruleProcessingField && (window as any).__ruleProcessingField !== field.name) {
      if (DEBUG) console.log(`⏳ Queued: ${field.name} waiting for ${(window as any).__ruleProcessingField}`);
      setTimeout(() => {
        try {
          applyFieldRules(field, {
            watchedValues,
            globalValues,
            selectedObjects,
            onFieldOptionsUpdate,
            autoSetValue,
            rowContext,
            setGlobalValues,
            onUpdateRowGroup,
          });
        } catch (e) {
          if (DEBUG) console.warn("Retry applyFieldRules failed", e);
        }
      }, 40);
      return field;
    }
    (window as any).__ruleProcessingField = field.name;
    if ((window as any).__ruleLockActive) {
      (window as any).__ruleProcessingField = null;
      return field;
    }
    (window as any).__ruleLockActive = true;
  }

  try {
    const values = watchedValues || globalValues || {};

    if (DEBUG) {
      console.log("▶ applyFieldRules start:", field?.name, {
        rowContext,
        keysInGlobal: Object.keys(globalValues || {}).slice(0, 40),
      });
    }

    let updated = { ...field };
    let matchedRule: any = null;
    let defaultRule: any = null;

    for (const rule of field.rules) {
      try {
        if (rule.default) {
          defaultRule = rule;
          continue;
        }

        const sourceField = rule.dependsBy || rule.when?.field;
        if (!sourceField) continue;

        let parentRaw: any = "";

        if (rowContext?.rowGroupId && rowContext?.rowId && Array.isArray(globalValues?.[rowContext.rowGroupId])) {
          const rows = globalValues![rowContext.rowGroupId];
          const thisRow = rows.find((r: any) => r.id === rowContext.rowId);
          if (thisRow) {
            const sourceKey = fieldMap[sourceField] || sourceField;
            parentRaw = thisRow[sourceKey] ?? "";
          }
        }

        if (!parentRaw) {
          parentRaw = selectedObjects?.[sourceField]?.value ?? values?.[sourceField] ?? selectedObjects?.[sourceField] ?? "";
        }

        const compareVal =
          typeof parentRaw === "object" && rule.dependsByValue
            ? getNested(parentRaw, rule.dependsByValue)
            : parentRaw ?? "";

        if (rule.when?.operator === "changed") {
          const rowKey =
            rowContext?.rowGroupId && rowContext?.rowId
              ? `${rowContext.rowGroupId}:${rowContext.rowId}:${sourceField}`
              : `${field.name}__watch_${sourceField}`;

          const serialized = JSON.stringify(compareVal);
          const prev = lastRowValues[rowKey];
          const changed = prev !== serialized;
          lastRowValues[rowKey] = serialized;
          if (!changed) continue;
          matchedRule = rule;
          continue;
        }

        const matches = evaluateCondition(compareVal, rule.when, rule.logicOperator || "AND");
        if (matches) matchedRule = rule;
      } catch (e) {
        console.warn("⚠ rule evaluation error for", field?.name, e);
      }
    }

    let activeRule: any = matchedRule || defaultRule;
    if (!activeRule?.then) return { ...field };

    const applied = { ...activeRule.then };

    if (Object.prototype.hasOwnProperty.call(applied, "rounding")) {
      const parsed = Number(applied.rounding);
      applied.rounding = !isNaN(parsed) && parsed > 0 ? parsed : 0;
    }

    const safeAutoSetValue = (fieldName: string, value: any, fullOption?: any) => {
      const newVal = value ?? "";
      const mapKey = fieldMap[fieldName] || fieldName;

      if (rowContext?.rowGroupId && rowContext?.rowId && typeof setGlobalValues === "function") {
        const groupId = rowContext.rowGroupId;
        const rowId = rowContext.rowId;

        setGlobalValues((prev) => {
          const prevRows = Array.isArray(prev[groupId]) ? prev[groupId] : [];
          let changed = false;
          const updatedRows = prevRows.map((r: any) => {
            if (r.id !== rowId) return r;
            const oldVal = r[mapKey];
            if (isSame(oldVal, newVal)) return r;
            changed = true;
            return { ...r, [mapKey]: newVal };
          });
          if (!changed) return prev;
          queueMicrotask(() => onUpdateRowGroup?.(groupId, updatedRows));
          return { ...prev, [groupId]: updatedRows };
        });
        return;
      }

      if (typeof setGlobalValues === "function") {
        setGlobalValues((prev) => {
          const oldVal = prev?.[fieldName];
          if (isSame(oldVal, newVal)) return prev;
          return { ...prev, [fieldName]: newVal };
        });
      } else {
        autoSetValue?.(fieldName, newVal, fullOption);
      }
    };

    // ---------- 🩹 PATCHED CLEARSELF LOGIC ----------
    if (applied.clearSelf) {
      const dependsByField = activeRule.dependsBy || activeRule.when?.field;
      const dependencyValue =
        selectedObjects?.[dependsByField]?.value ??
        values?.[dependsByField] ??
        selectedObjects?.[dependsByField] ??
        "";

      if (lastClearTrigger[field.name] === dependencyValue) {
        console.log(`⚪ clearSelf for ${field.name} already applied for value`, dependencyValue);
      } else {
        lastClearTrigger[field.name] = dependencyValue;
        console.log(`🧹 clearSelf triggered for ${field.name} (depends on ${dependsByField})`);

        // 🩹 Detect and handle rowgroup proxy objects correctly
        const groupKey = rowContext?.rowGroupId;
        const rowgroupCandidate = groupKey ? globalValues?.[groupKey] : undefined;
        const isRowgroupArray =
          Array.isArray(rowgroupCandidate) ||
          (rowgroupCandidate &&
            typeof rowgroupCandidate === "object" &&
            Object.keys(rowgroupCandidate).every((k) => /^\d+$/.test(k)));

        // 🩹 Always reset rowgroup to one blank row if this field is inside one
        if (groupKey && isRowgroupArray) {
          const updatedRows = [
            {
              id: `row_${Date.now()}`,
              firstValue: "",
              secondValue: "",
              thirdValue: "",
            },
          ];

          setGlobalValues?.((prev) => ({
            ...prev,
            [groupKey]: updatedRows,
          }));

          queueMicrotask(() => onUpdateRowGroup?.(groupKey, updatedRows));
          queueMicrotask(() =>
            onFieldOptionsUpdate?.(field.name, [{ label: "No Data Found", value: "" }])
          );

          console.log(
            `🧹 [clearSelf] RowGroup '${groupKey}' reset to one empty row (triggered by '${dependsByField}')`
          );
          return;
        }

        // 🌐 Global field clear logic (unchanged)
        safeAutoSetValue(field.name, "");
        queueMicrotask(() =>
          onFieldOptionsUpdate?.(field.name, [{ label: "No Data Found", value: "" }])
        );

        Object.keys(globalValues || {}).forEach((key) => {
          if (
            (Array.isArray(globalValues[key]) ||
              (globalValues[key] &&
                typeof globalValues[key] === "object" &&
                Object.keys(globalValues[key]).every((k) => /^\d+$/.test(k)))) &&
            key.startsWith("rowgroup_")
          ) {
            const updatedRows = [
              {
                id: `row_${Date.now()}`,
                firstValue: "",
                secondValue: "",
                thirdValue: "",
              },
            ];
            setGlobalValues?.((prev) => ({
              ...prev,
              [key]: updatedRows,
            }));
            queueMicrotask(() => onUpdateRowGroup?.(key, updatedRows));
            console.log(
              `🧹 [clearSelf] Global trigger '${dependsByField}' → reset structured group '${key}'`
            );
          }
        });

        console.log(`🧹 [clearSelf] Global field '${field.name}' cleared`);
      }
    }
    // ---------- END PATCH ----------


    for (const [key, action] of Object.entries(ruleActions)) {
      if (applied[key] !== undefined && key !== "api") {
        try {
          if (key === "autoSelectFirst") {
            const curValue =
              rowContext?.rowGroupId && rowContext?.rowId
                ? (globalValues?.[rowContext.rowGroupId] || []).find((r: any) => r.id === rowContext.rowId)?.[fieldMap[field.name] || field.name]
                : globalValues?.[field.name] ?? field.value;
            if (curValue !== undefined && curValue !== "") continue;
          }
          action({ ...updated }, applied, {
            autoSetValue: safeAutoSetValue,
            globalValues,
            selectedObjects,
            setGlobalValues,
            onFieldOptionsUpdate,
          });
        } catch (e) {
          console.warn("⚠ ruleActions error", key, e);
        }
      }
    }

    if (applied.api) {
      const dependsByField = activeRule.dependsBy || activeRule.when?.field;
      const parentObj = selectedObjects?.[dependsByField] ?? values?.[dependsByField];
      const extractedVal =
        typeof parentObj === "object"
          ? getNested(parentObj, applied.dependsByValue || "value") ?? parentObj.value ?? parentObj.label ?? parentObj.id ?? null
          : parentObj;

      if (extractedVal !== undefined && extractedVal !== null) {
        if (lastApiValue[field.name] === extractedVal) {
          if (DEBUG) console.log(`⚪ API skip for ${field.name} (same extracted value)`);
        } else {
          lastApiValue[field.name] = extractedVal;
          (field as any).__apiPending = true;
          ruleActions.api(applied, extractedVal)
            .then((res: any) => {
              (field as any).__apiPending = false;
              const payload = res?.data ?? res;
              const formatted = Array.isArray(payload)
                ? payload.map((d) => d.po_number ?? d.label ?? d.value ?? d)
                : [payload];
              const fallback = formatted.length > 0 ? formatted : [{ label: "No Data Found", value: "" }];
              onFieldOptionsUpdate?.(field.name, fallback);

              if (applied.autoSelectFirst && fallback[0]) {
                const first = fallback[0];
                const autoVal = typeof first === "object" ? first.value ?? first.label ?? first.po_number : first;
                queueMicrotask(() => safeAutoSetValue(field.name, autoVal, first));
              }
            })
            .catch((err) => {
              (field as any).__apiPending = false;
              console.warn("⚠ API call failed", err);
            });
        }
      }
    }

    return { ...updated, ...applied };
  } finally {
    if (typeof window !== "undefined") {
      (window as any).__ruleLockActive = false;
      (window as any).__ruleProcessingField = null;
    }
  }
}
