
export interface FormConfig {
  id?: string;
  title: string;
  description?: string;
  category?: string; // Make category optional
  fields?: FormField[];
  rowGroups?: RowGroup[];
  sections?: FormSection[];
  submit?: {
    label: string;
  };
  url?: string;
  servis_aktif?: number;
  approvalFlowId?: string;
  approval?: {
    steps: string[];
    mode?: 'sequential' | 'parallel';
  };
  apiEndpoint?: string;
  active?: number;
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
  repeatable?: boolean;
  summary?: {
    label: string;
    type?: string;
    calculated?: boolean;
  } | string;
  addButton?: {
    label: string;
  } | string;
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
  | 'number'
  | 'suggestion-insert';
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
  rowGroup?: RowData[];
  title?: string;
  maxRows?: number;
  isStructuredInput?: boolean;
  structure?: {
    firstColumn: {
      label: string;
      placeholder: string;
      name?: string;
      type?: 'text' | 'number' | 'select';
      options?: string[];
    };
    secondColumn: {
      label: string;
      placeholder: string;
      name?: string;
      type?: 'text' | 'number' | 'select';
      options?: string[];
    };
    thirdColumn: {
      label: string;
      placeholder: string;
      name?: string;
      type?: 'text' | 'number' | 'select';
      options?: string[];
    };
    combinedMapping?: 'first_second' | 'second_third' | 'none';
  };
}
