
import { ConditionalRule } from '@/types/formTypes';

/**
 * Evaluates conditional rules against form values
 * @param rules - Array of conditional rules
 * @param formValues - Current form values
 * @returns boolean - Whether the condition is met
 */
export const evaluateConditionalRules = (
  rules: ConditionalRule[],
  formValues: Record<string, any>
): boolean => {
  if (!rules || rules.length === 0) return true;

  let result = evaluateRule(rules[0], formValues);

  for (let i = 1; i < rules.length; i++) {
    const rule = rules[i];
    const ruleResult = evaluateRule(rule, formValues);
    
    if (rule.logicalOperator === 'OR') {
      result = result || ruleResult;
    } else {
      // Default to AND
      result = result && ruleResult;
    }
  }

  return result;
};

/**
 * Evaluates a single conditional rule
 * @param rule - The conditional rule to evaluate
 * @param formValues - Current form values
 * @returns boolean - Whether the rule is met
 */
export const evaluateRule = (
  rule: ConditionalRule,
  formValues: Record<string, any>
): boolean => {
  const fieldValue = formValues[rule.field];
  const ruleValue = rule.value;

  console.log(`🔍 [Conditional Logic] Evaluating rule:`, {
    field: rule.field,
    operator: rule.operator,
    fieldValue,
    ruleValue,
    fieldValueType: typeof fieldValue,
    ruleValueType: typeof ruleValue
  });

  switch (rule.operator) {
    case 'equals':
      return fieldValue === ruleValue;
    
    case 'not_equals':
      return fieldValue !== ruleValue;
    
    case 'contains':
      return String(fieldValue || '').toLowerCase().includes(String(ruleValue || '').toLowerCase());
    
    case 'not_contains':
      return !String(fieldValue || '').toLowerCase().includes(String(ruleValue || '').toLowerCase());
    
    case 'empty':
      return !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
    
    case 'not_empty':
      return fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
    
    case 'greater_than':
      return Number(fieldValue) > Number(ruleValue);
    
    case 'less_than':
      return Number(fieldValue) < Number(ruleValue);
    
    default:
      console.warn(`Unknown operator: ${rule.operator}`);
      return true;
  }
};

/**
 * Validates conditional rules for potential circular dependencies
 * @param fields - Array of form fields
 * @returns Array of validation errors
 */
export const validateConditionalRules = (fields: any[]): string[] => {
  const errors: string[] = [];
  const fieldNames = fields.map(f => f.name);

  fields.forEach(field => {
    // Check showWhen rules
    if (field.showWhen) {
      field.showWhen.forEach((rule: ConditionalRule) => {
        if (!fieldNames.includes(rule.field)) {
          errors.push(`Field "${field.name}" references non-existent field "${rule.field}" in showWhen condition`);
        }
        if (rule.field === field.name) {
          errors.push(`Field "${field.name}" cannot reference itself in showWhen condition`);
        }
      });
    }

    // Check disabledWhen rules
    if (field.disabledWhen) {
      field.disabledWhen.forEach((rule: ConditionalRule) => {
        if (!fieldNames.includes(rule.field)) {
          errors.push(`Field "${field.name}" references non-existent field "${rule.field}" in disabledWhen condition`);
        }
        if (rule.field === field.name) {
          errors.push(`Field "${field.name}" cannot reference itself in disabledWhen condition`);
        }
      });
    }
  });

  return errors;
};
