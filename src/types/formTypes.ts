
export interface FormField {
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  readonly?: boolean;
  value?: string;
  accept?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  default?: string;
  uiCondition?: string;
  note?: string;
}

export interface RowGroup {
  rowGroup: FormField[];
}

export interface FormSection {
  title: string;
  fields?: FormField[];
  rowGroups?: RowGroup[];
  repeatable?: boolean;
  addButton?: string;
  summary?: {
    label: string;
    type: string;
    calculated: boolean;
  };
}

export interface ApprovalFlow {
  steps: string[];
  mode: 'sequential' | 'parallel';
}

export interface FormConfig {
  id?: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
  fields?: FormField[];
  rowGroups?: RowGroup[];
  sections?: FormSection[];
  approval?: ApprovalFlow;
  apiEndpoint?: string;
  submit?: {
    label: string;
    type: string;
    action: string;
  };
}
