
export interface FormField {
  id?: string; // Add unique identifier for drag-and-drop
  label: string;
  name: string;
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
  columnSpan?: 1 | 2 | 3;
  systemVariable?: string;
  
  // Row group metadata (internal use)
  _isRowGroupField?: boolean;
  _groupIndex?: number;
  _fieldIndex?: number;
  _columnType?: 'cstm_col' | 'lbl_col';
  _combinedFields?: FormField[];
}

export interface RowGroup {
  id?: string; // Add unique identifier
  title?: string; // Row group title
  rowGroup: FormField[];
  isStructuredInput?: boolean;
  maxRows?: number;
  structure?: {
    firstColumn: FormField;
    secondColumn: FormField;
    thirdColumn: FormField;
    combinedMapping?: 'none' | 'first_second' | 'second_third';
  };
}

export interface FormSection {
  id?: string; // Add unique identifier
  title: string;
  description?: string;
  fields?: FormField[];
  rowGroups?: RowGroup[];
  repeatable?: boolean;
  addButton?: string;
  summary?: {
    label: string;
    type: string;
    calculated: boolean;
  };
  condition?: string; // Conditional display
  collapsible?: boolean;
  collapsed?: boolean;
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
  m_workflow_groups?: string;
}

export interface FormConfig {
  id?: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
  fields?: FormField[]; // Legacy support
  rowGroups?: RowGroup[]; // Legacy support
  sections?: FormSection[]; // New section-based structure
  approval?: ApprovalFlow;
  apiEndpoint?: string;
  m_workflow_groups?: string;
  servis_aktif?: number;
  active?: number;
  submit?: {
    label: string;
    type: string;
    action: string;
  };
  // New metadata
  metadata?: {
    version: string;
    createdAt?: string;
    updatedAt?: string;
    fieldCount: number;
    maxFields: number;
  };
}

// Field templates for quick insertion
export interface FieldTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  field: Omit<FormField, 'id' | 'name'>;
}

// System variable definitions
export interface SystemVariable {
  key: string;
  label: string;
  description: string;
  type: 'string' | 'array' | 'object';
  resolver?: string;
}
