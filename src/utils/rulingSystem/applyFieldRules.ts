import { getNested } from "@/utils/dependencyResolver";
import { evaluateCondition } from "./ruleoperator/ruleoperators";
import { ruleActions } from "./ruleActions";

const lastAutoSet: Record<string, string> = {};
const lastApiValue: Record<string, any> = {};
const lastClearTrigger: Record<string, any> = {};
const debugMode = true;

/**
 * applyFieldRules()
 * Evaluates a single field’s dynamic rules against the current form state.
 * Supports globalValues and rowgroup reset logic.
 */
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
  }: {
    watchedValues?: Record<string, any>;
    globalValues?: Record<string, any>;
    selectedObjects?: Record<string, any>;
    onFieldOptionsUpdate?: (fieldName: string, newOptions: any[]) => void;
    autoSetValue?: (fieldName: string, value: any, fullOption: any) => void;
    rowContext?: { rowGroupId?: string; rowId?: string; columnKey?: string };
    setGlobalValues?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  }
) {
  if (!field || !field.rules) return field;

  const values = watchedValues || globalValues || {};
  let updated = { ...field };
  let matchedRule: any = null;
  let defaultRule: any = null;

  // -------------------------
  // 1️⃣ Find matching rule
  // -------------------------
  for (const rule of field.rules) {
    try {
      if (rule.default) {
        defaultRule = rule;
        continue;
      }

      const sourceField = rule.dependsBy || rule.when?.field;
      if (!sourceField) continue;

      const depKey = `${field.name}__watch_${sourceField}`;
      const lastBlurField = selectedObjects?.__lastBlurField;

      // 🧩 Resolve dependency value
      let parentRaw =
        selectedObjects?.[sourceField]?.value ??
        values?.[sourceField] ??
        selectedObjects?.[sourceField];

      if (parentRaw === undefined || parentRaw === null) parentRaw = "";

      const compareVal =
        typeof parentRaw === "object" && rule.dependsByValue
          ? getNested(parentRaw, rule.dependsByValue)
          : parentRaw;

      // 💤 Blur-based triggers
      if (rule.trigger === "blur" && lastBlurField !== sourceField) {
        if (debugMode)
          // console.log(`💤 Waiting for ${sourceField} blur...`);
        continue;
      }

      // 🔁 Changed operator
      if (rule.when?.operator === "changed") {
        const prevVal = lastApiValue[depKey];
        const hasChanged = prevVal !== compareVal;
        lastApiValue[depKey] = compareVal;

        if (hasChanged) {
          matchedRule = rule;
         
        }
        continue;
      }

      // ✅ Evaluate condition
      const matches = evaluateCondition(
        compareVal,
        rule.when,
        rule.logicOperator || "AND"
      );
      if (matches) {
        matchedRule = rule;
        
      }
    } catch (err) {
      console.warn("⚠️ Rule evaluation failed for", field.name, err);
    }
  }

  // -------------------------
  // 2️⃣ Determine rule to apply
  // -------------------------
  const activeRule = matchedRule || defaultRule;
  if (!activeRule?.then) return updated;
  const applied = { ...activeRule.then };

  if (applied.maxnumber !== undefined)
    applied.maxnumber = Number(applied.maxnumber);
  if (applied.rounding !== undefined)
    applied.rounding = Number(applied.rounding);

  // -------------------------
  // 3️⃣ Apply rule actions
  // -------------------------
  for (const [key, action] of Object.entries(ruleActions)) {
    if (applied[key] !== undefined && key !== "api") {
      if (debugMode)
        // console.log(`⚙️ Applying ${key}:`, applied[key]);
      try {
        action(updated, applied);
      } catch (e) {
        console.warn(`⚠️ ruleAction.${key} failed`, e);
      }
    }
  }

  // -------------------------
  // 4️⃣ Clear or reset logic
  // -------------------------
  const dependsByField = activeRule.dependsBy || activeRule.when?.field;
  const dependencyValue =
    selectedObjects?.[dependsByField]?.value ??
    values?.[dependsByField] ??
    selectedObjects?.[dependsByField];

  if (applied.clearSelf) {
    const depVal = dependencyValue ?? "";
    const alreadyCleared = lastClearTrigger[field.name] === depVal;

    if (!alreadyCleared) {
      lastClearTrigger[field.name] = depVal;

     

      setTimeout(() => {
        // 🧩 Normalize rowgroup key if exists
        const safeRowGroupKey = rowContext?.rowGroupId
          ? rowContext.rowGroupId.replace(/[^a-zA-Z0-9_]/g, "_")
          : null;

        // 🧹 If this rule is triggered from a rowgroup field
        if (safeRowGroupKey) {
          const defaultRow = {
            id: `row_${Date.now()}`,
            firstValue: "",
            secondValue: "",
            thirdValue: "",
          };
          const updatedRows = [defaultRow];

          if (typeof setGlobalValues === "function") {
            setGlobalValues((prev) => ({
              ...prev,
              [safeRowGroupKey]: updatedRows,
            }));
          } else if (globalValues) {
            globalValues[safeRowGroupKey] = updatedRows;
          }

        
        } else {
          // 🧩 Normal field clear
          autoSetValue?.(field.name, "", "", rowContext);
        }

        // 🧽 Always clear options too
        const fallbackOptions = [{ label: "No Data Found", value: "" }];
        onFieldOptionsUpdate?.(field.name, fallbackOptions);

      }, 0);
    } 
  }

  // -------------------------
  // 5️⃣ Clear only options
  // -------------------------
  if (applied.clearOptionsOnly) {
   
    const fallbackOptions = [{ label: "No Data Found", value: "" }];
    onFieldOptionsUpdate?.(field.name, fallbackOptions);
  }

  // -------------------------
  // 6️⃣ API rules
  // -------------------------
  if (applied.api) {
    const parentObj =
      selectedObjects?.[dependsByField] ?? values?.[dependsByField];
    let extractedVal: any = null;

    if (typeof parentObj === "object") {
      extractedVal =
        getNested(parentObj, applied.dependsByValue || "value") ??
        parentObj.value ??
        parentObj.label ??
        parentObj.id ??
        parentObj.filter ??
        null;
    } else {
      extractedVal = parentObj;
    }

    if (extractedVal === undefined || extractedVal === null) {
     
    } else {
      if (lastApiValue[field.name] !== extractedVal) {
        lastApiValue[field.name] = extractedVal;
        const resolvedUrl = applied.api
          .replace("${dependsByValue}", encodeURIComponent(String(extractedVal)))
          .replace("${value}", encodeURIComponent(String(extractedVal)));

      

        ruleActions.api(applied, extractedVal).then((res: any) => {
          try {
            const payload = res?.data ?? res;
            const formatted = Array.isArray(payload)
              ? payload.map(
                  (d) => d.po_number ?? d.label ?? d.value ?? d
                )
              : [payload];

            const fallback =
              formatted.length > 0
                ? formatted
                : [{ label: "No Data Found", value: "" }];
            onFieldOptionsUpdate?.(field.name, fallback);

            const first = fallback[0];
            const autoVal =
              typeof first === "object"
                ? first.value ?? first.label ?? first.po_number
                : first;

            if (autoVal !== null && autoVal !== undefined) {
              const currentKey = `${field.name}:${String(autoVal)}`;
              if (lastAutoSet[field.name] !== currentKey) {
                lastAutoSet[field.name] = currentKey;
                setTimeout(() =>
                  autoSetValue?.(field.name, autoVal, first)
                , 0);
              }
            }
          } catch (err) {
            console.warn("⚠️ API rule error:", err);
          }
        });
      } 
    }
  }

  Object.assign(updated, applied);
  return updated;
}
