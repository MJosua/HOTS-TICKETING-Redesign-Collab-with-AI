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

export interface WorkflowStepExecution {
  id: number;
  workflow_id: number;
  step_order: number;
  assigned_user_id: number;
  status: string;
  action_date: string;
  action_by_user_id?: number;
  comments?: string;
  rejection_reason?: string;
}

export interface WorkflowGroup {
  id: string;
  name: string;
  description: string;
  category_ids: number[];
  is_active: boolean;
}

export interface ApprovalFlow {
  steps: string[];
  mode: 'sequential' | 'parallel';
  m_workflow_groups?: string; // Link to workflow group
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
  m_workflow_groups?: string; // New field to link forms to workflow groups
  submit?: {
    label: string;
    type: string;
    action: string;
  };
}
