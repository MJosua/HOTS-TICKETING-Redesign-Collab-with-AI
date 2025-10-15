// utils/applyFieldRules.ts
import { getNested } from "@/utils/dependencyResolver";
import { evaluateCondition } from "./ruleoperator/ruleoperators";
import { ruleActions } from "./ruleActions";
/**
 * 🧠 applyFieldRules()
 * Dynamically modifies a field's properties (readonly, maxnumber, rounding, etc.)
 * based on declared rules and the current watchedValues / selectedObjects.
 */
// utils/applyFieldRules.ts
export function applyFieldRules(
    field: any,
    { watchedValues, selectedObjects }: { watchedValues: Record<string, any>; selectedObjects: Record<string, any> }
  ) {
    if (!field || !field.rules) return field;
  
    let updated = { ...field };
  
    for (const rule of field.rules) {
      try {
        const sourceField = rule.dependsBy || rule.when?.field;
        if (!sourceField) continue;
  
        const parentValue = selectedObjects?.[sourceField] ?? watchedValues?.[sourceField];
        if (parentValue === undefined || parentValue === null) continue;
  
        const matches = evaluateCondition(parentValue, rule.when, rule.logicOperator || "AND");
  
        if (matches && rule.then) {
          Object.assign(updated, rule.then);
        }
      } catch (err) {
        console.warn("⚠️ Rule evaluation failed for", field.name, err);
      }
    }
  
    return updated;
  }
  