
export interface FormField {
  label: string;
  name: string; // New field for API data mapping
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
  columnSpan?: 1 | 2 | 3; // New field for dynamic column spans
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

export interface ApprovalStep {
  order: number;
  type: 'role' | 'specific_user' | 'superior';
  value: string | number;
  description: string;
}

export interface WorkflowGroup {
  id: string;
  name: string;
  description: string;
  category_ids: number[];
  approval_steps: ApprovalStep[];
}

export interface ApprovalFlow {
  steps: string[];
  mode: 'sequential' | 'parallel';
  workflow_group_id?: string; // Link to workflow group
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
  workflow_group_id?: string; // New field to link forms to workflow groups
  submit?: {
    label: string;
    type: string;
    action: string;
  };
}
