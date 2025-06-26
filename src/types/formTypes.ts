export interface FormConfig {
  id?: string;
  title: string;
  description?: string;
  category: string;
  fields?: FormField[];
  rowGroups?: RowGroup[];
  sections?: FormSection[];
  submit?: {
    label: string;
  };
  url?: string;
  servis_aktif?: number;
  approvalFlowId?: string;
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormField {
  label: string;
  name: string;
  type:
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'toggle'
  | 'number';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  readonly?: boolean;
  value?: string;
  accept?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  default?: string;
  note?: string;
  uiCondition?: string;
  columnSpan?: number;
  systemVariable?: string;
}

export interface RowData {
  id: string;
  firstValue: string;
  secondValue: string;
  thirdValue: string;
}

export interface RowGroup {
  rowGroup?: FormField[];
  title?: string;
  maxRows?: number;
  isStructuredInput?: boolean;
  structure?: {
    firstColumn: {
      label: string;
      placeholder: string;
    };
    secondColumn: {
      label: string;
      placeholder: string;
    };
    thirdColumn: {
      label: string;
      placeholder: string;
      options?: string[];
    };
  };
}
