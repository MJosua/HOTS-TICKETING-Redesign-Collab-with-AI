// utils/rules/ruleActions/handleAPI.ts
export async function handleAPI(ruleThen: any, checkVal: any) {
    if (!ruleThen?.api) return;
    try {
      const url = ruleThen.api.replace("${value}", encodeURIComponent(checkVal));
      const res = await fetch(url);
      const data = await res.json();
      console.log("📡 Rule API result:", data);
      return data;
    } catch (err) {
      console.warn("⚠️ Rule API error:", err);
    }
  }
  