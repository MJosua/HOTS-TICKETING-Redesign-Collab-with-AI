// utils/rules/ruleActions/index.ts
import { handleAPI } from "./handleAPI";
import { handleMax } from "./handleMax";
import { handleRounding } from "./handleRounding.ts";

export const ruleActions = {
  api: handleAPI,
  maxnumber: handleMax,
  rounding: handleRounding,
};
