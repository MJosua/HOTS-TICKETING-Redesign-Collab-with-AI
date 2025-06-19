
import { FormField } from '@/types/formTypes';

// Constants for form field mapping
export const MAX_FORM_FIELDS = 15;
export const CUSTOM_COLUMN_PREFIX = 'cstm_col';
export const LABEL_COLUMN_PREFIX = 'lbl_col';

// Interface for mapped form data
export interface MappedFormData {
  customColumns: { [key: string]: any };
  labelColumns: { [key: string]: string };
  ticketMetadata: {
    service_id: number;
    status_id?: number;
    priority?: string;
    category?: string;
  };
}

// Map form fields to database columns
export const mapFormFieldsToColumns = (
  formData: { [key: string]: any },
  formFields: FormField[],
  serviceId: number
): MappedFormData => {
  const customColumns: { [key: string]: any } = {};
  const labelColumns: { [key: string]: string } = {};
  
  // Map form fields to cstm_col and lbl_col
  formFields.slice(0, MAX_FORM_FIELDS).forEach((field, index) => {
    const columnIndex = index + 1;
    const customColKey = `${CUSTOM_COLUMN_PREFIX}${columnIndex}`;
    const labelColKey = `${LABEL_COLUMN_PREFIX}${columnIndex}`;
    
    // Map field value
    if (formData[field.name] !== undefined) {
      customColumns[customColKey] = formData[field.name];
    }
    
    // Map field label
    labelColumns[labelColKey] = field.label;
  });
  
  return {
    customColumns,
    labelColumns,
    ticketMetadata: {
      service_id: serviceId,
      status_id: 1, // Default to pending/new status
      priority: formData.priority || 'medium',
      category: formData.category || 'general'
    }
  };
};

// Reverse mapping: convert database columns back to form data
export const mapColumnsToFormFields = (
  ticketDetail: { [key: string]: any },
  formFields: FormField[]
): { [key: string]: any } => {
  const formData: { [key: string]: any } = {};
  
  formFields.forEach((field, index) => {
    const columnIndex = index + 1;
    const customColKey = `${CUSTOM_COLUMN_PREFIX}${columnIndex}`;
    
    if (ticketDetail[customColKey] !== undefined && ticketDetail[customColKey] !== null) {
      formData[field.name] = ticketDetail[customColKey];
    }
  });
  
  return formData;
};

// Get field labels from database
export const getFieldLabelsFromColumns = (
  ticketDetail: { [key: string]: any },
  maxFields: number = MAX_FORM_FIELDS
): { [key: string]: string } => {
  const labels: { [key: string]: string } = {};
  
  for (let i = 1; i <= maxFields; i++) {
    const labelColKey = `${LABEL_COLUMN_PREFIX}${i}`;
    if (ticketDetail[labelColKey]) {
      labels[`field_${i}`] = ticketDetail[labelColKey];
    }
  }
  
  return labels;
};

// Validate form field count
export const validateFormFieldCount = (fields: FormField[]): boolean => {
  return fields.length <= MAX_FORM_FIELDS;
};

// Generate column mapping for API requests
export const generateColumnMapping = (formFields: FormField[]) => {
  const mapping: { [fieldName: string]: string } = {};
  
  formFields.slice(0, MAX_FORM_FIELDS).forEach((field, index) => {
    const columnIndex = index + 1;
    mapping[field.name] = `${CUSTOM_COLUMN_PREFIX}${columnIndex}`;
  });
  
  return mapping;
};
