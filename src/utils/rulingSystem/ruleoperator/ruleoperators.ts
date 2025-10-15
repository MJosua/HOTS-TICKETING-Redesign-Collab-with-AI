// utils/rules/ruleOperators.ts

/**
 * 🔍 Evaluate a single condition between `checkVal` and `expected`
 */
function evaluateSingleCondition(checkVal: any, expected: any, operator: string = "equals"): boolean {
    try {
      switch (operator) {
        case "equals":
          return checkVal === expected;
  
        case "not_equals":
          return checkVal !== expected;
  
        case "contains":
          if (typeof checkVal === "string") return checkVal.includes(String(expected));
          if (Array.isArray(checkVal)) return checkVal.includes(expected);
          return false;
  
        case "in":
          return Array.isArray(expected) && expected.includes(checkVal);
  
        case "gt":
          return Number(checkVal) > Number(expected);
  
        case "gte":
          return Number(checkVal) >= Number(expected);
  
        case "lt":
          return Number(checkVal) < Number(expected);
  
        case "lte":
          return Number(checkVal) <= Number(expected);
  
        case "starts_with":
          return typeof checkVal === "string" && checkVal.startsWith(String(expected));
  
        case "ends_with":
          return typeof checkVal === "string" && checkVal.endsWith(String(expected));
  
        case "regex":
          try {
            const re = new RegExp(expected);
            return re.test(String(checkVal));
          } catch {
            return false;
          }
  
        case "includes_key":
          return typeof checkVal === "object" && checkVal !== null && expected in checkVal;
  
        case "is_truthy":
          return Boolean(checkVal);
  
        case "is_falsy":
          return !Boolean(checkVal);
  
        default:
          console.warn(`⚠️ Unknown operator "${operator}". Defaulting to equals.`);
          return checkVal === expected;
      }
    } catch (err) {
      console.warn("⚠️ evaluateSingleCondition error:", err, { checkVal, expected, operator });
      return false;
    }
  }
  
  /**
   * ⚙️ evaluateCondition()
   * - Supports single condition OR multiple conditions
   * - When multiple: supports `logicOperator: AND | OR`
   * 
   * Example:
   *   when: [
   *     { attribute: "rm_code", operator: "equals", value: 22 },
   *     { attribute: "rm_category", operator: "equals", value: "Noodle" }
   *   ],
   *   logicOperator: "AND"
   */
  export function evaluateCondition(
    parentValue: any,
    when: any,
    logicOperator: "AND" | "OR" = "AND"
  ): boolean {
    try {
      // Single condition (default)
      if (!Array.isArray(when)) {
        const checkVal =
          typeof parentValue === "object" && when.attribute
            ? parentValue?.[when.attribute]
            : parentValue;
  
        return evaluateSingleCondition(checkVal, when.value, when.operator);
      }
  
      // Multiple conditions
      const results = when.map((w: any) => {
        const checkVal =
          typeof parentValue === "object" && w.attribute
            ? parentValue?.[w.attribute]
            : parentValue;
        return evaluateSingleCondition(checkVal, w.value, w.operator);
      });
  
      // Combine results
      if (logicOperator === "AND") {
        return results.every(Boolean);
      } else {
        return results.some(Boolean);
      }
    } catch (err) {
      console.warn("⚠️ evaluateCondition (multi) error:", err, when);
      return false;
    }
  }
  