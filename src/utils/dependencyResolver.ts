/**
 * Normalize any value to a lowercased trimmed string.
 */
const norm = (v: any): string => String(v ?? "").trim().toLowerCase();

/**
 * Compare two values safely — supports numbers, strings, and objects.
 */
export function compareValues(option: any, target: any): boolean {
  if (option == null || target == null) return false;

  // handle primitive comparison
  if (typeof option !== "object" && typeof target !== "object") {
    return norm(option) === norm(target);
  }

  // extract best possible value for objects
  const keys = ["value", "item_name", "label", "name", "id", "code", "filter"];
  const extract = (obj: any) => {
    if (!obj || typeof obj !== "object") return obj;
    for (const k of keys) {
      if (obj[k] != null) return obj[k];
    }
    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  };

  const optVal = extract(option);
  const tgtVal = extract(target);
  return norm(optVal) === norm(tgtVal);
}

/**
 * Safely resolve nested keys like "meta.filter.code"
 */
export function getNested(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
}
