
/**
 * Utility functions for transforming form data to cstm_col/lbl_col format
 * for backend submission
 */

export interface TransformedFormData {
  [key: string]: any;
  // Dynamic columns
  cstm_col_1?: string;
  cstm_col_2?: string;
  // ... up to cstm_col_16
  lbl_col_1?: string;
  lbl_col_2?: string;
  // ... up to lbl_col_16
}

/**
 * Transform form data from React Hook Form format to backend format
 */
export const transformFormDataForSubmission = (
  formData: any,
  formConfig: any
): TransformedFormData => {
  const transformed: TransformedFormData = {};
  let columnIndex = 1;

  // Process regular fields first
  if (formConfig.fields) {
    formConfig.fields.forEach((field: any) => {
      const value = formData[field.name];
      if (value !== undefined && value !== '') {
        transformed[`cstm_col_${columnIndex}`] = value;
        transformed[`lbl_col_${columnIndex}`] = field.label;
        columnIndex++;
      }
    });
  }

  // Process structured row groups
  if (formConfig.rowGroups) {
    formConfig.rowGroups.forEach((rowGroup: any) => {
      if (rowGroup.isStructuredInput) {
        // Row groups are already handled by EnhancedStructuredRowGroup
        // Just copy the cstm_col_* and lbl_col_* values
        Object.keys(formData).forEach(key => {
          if (key.startsWith('cstm_col_') || key.startsWith('lbl_col_')) {
            transformed[key] = formData[key];
          }
        });
      }
    });
  }

  // Add metadata
  transformed.form_title = formConfig.title;
  transformed.form_url = formConfig.url;
  transformed.total_fields = Object.keys(transformed).filter(k => 
    k.startsWith('cstm_col_') || k.startsWith('lbl_col_')
  ).length / 2;

  return transformed;
};

/**
 * Get a preview of how the data will be stored
 */
export const getFormDataPreview = (
  formData: any,
  formConfig: any
): { column: string; value: string; label: string }[] => {
  const transformed = transformFormDataForSubmission(formData, formConfig);
  const preview: { column: string; value: string; label: string }[] = [];

  for (let i = 1; i <= 16; i++) {
    const cstmKey = `cstm_col_${i}`;
    const lblKey = `lbl_col_${i}`;
    
    if (transformed[cstmKey] !== undefined) {
      preview.push({
        column: `Column ${i}`,
        value: transformed[cstmKey] || '',
        label: transformed[lblKey] || ''
      });
    }
  }

  return preview;
};

/**
 * Validate that form doesn't exceed column limits
 */
export const validateFormColumnLimits = (
  formData: any,
  formConfig: any,
  maxColumns: number = 16
): { isValid: boolean; usedColumns: number; errors: string[] } => {
  const errors: string[] = [];
  let usedColumns = 0;

  // Count regular fields
  if (formConfig.fields) {
    usedColumns += formConfig.fields.filter((field: any) => {
      const value = formData[field.name];
      return value !== undefined && value !== '';
    }).length;
  }

  // Count row group columns
  if (formConfig.rowGroups) {
    formConfig.rowGroups.forEach((rowGroup: any, index: number) => {
      if (rowGroup.isStructuredInput) {
        // Count how many rows have data
        const rowCount = Object.keys(formData).filter(key => 
          key.startsWith(`cstm_col_`) && formData[key] !== undefined && formData[key] !== ''
        ).length;
        usedColumns += rowCount;
      }
    });
  }

  if (usedColumns > maxColumns) {
    errors.push(`Form uses ${usedColumns} columns but maximum allowed is ${maxColumns}`);
  }

  return {
    isValid: errors.length === 0,
    usedColumns,
    errors
  };
};
