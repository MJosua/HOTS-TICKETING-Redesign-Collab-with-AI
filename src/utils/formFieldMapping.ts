
import { FormField, RowGroup } from '@/types/formTypes';

export interface TicketColumnMapping {
  [key: string]: any; // cstm_col1, cstm_col2, etc.
}

export interface TicketLabelMapping {
  [key: string]: string; // lbl_col1, lbl_col2, etc.
}

export interface MappedTicketData extends TicketColumnMapping, TicketLabelMapping {}

/**
 * Flattens row groups into individual field configs with cstm_col/lbl_col mapping
 */
export const flattenRowGroupsToFields = (
  rowGroups: RowGroup[]
): FormField[] => {
  const flattenedFields: FormField[] = [];
  
  rowGroups.forEach((group, groupIndex) => {
    if (group.isStructuredInput && group.structure) {
      // For structured input, create fields based on combination mode
      const { firstColumn, secondColumn, thirdColumn, combinedMapping } = group.structure;
      
      if (combinedMapping === 'none') {
        // Each column becomes separate cstm_col
        if (firstColumn) {
          flattenedFields.push({
            ...firstColumn,
            name: `rowgroup_${groupIndex}_first`,
            label: firstColumn.label,
            _isRowGroupField: true,
            _groupIndex: groupIndex,
            _columnType: 'cstm_col'
          });
        }
        if (secondColumn) {
          flattenedFields.push({
            ...secondColumn,
            name: `rowgroup_${groupIndex}_second`,
            label: secondColumn.label,
            _isRowGroupField: true,
            _groupIndex: groupIndex,
            _columnType: 'cstm_col'
          });
        }
        if (thirdColumn) {
          flattenedFields.push({
            ...thirdColumn,
            name: `rowgroup_${groupIndex}_third`,
            label: thirdColumn.label,
            _isRowGroupField: true,
            _groupIndex: groupIndex,
            _columnType: 'cstm_col'
          });
        }
      } else {
        // Combined mapping - first column as cstm_col, others as lbl_col
        if (firstColumn) {
          flattenedFields.push({
            ...firstColumn,
            name: `rowgroup_${groupIndex}_combined`,
            label: firstColumn.label,
            _isRowGroupField: true,
            _groupIndex: groupIndex,
            _columnType: 'cstm_col',
            _combinedFields: [secondColumn, thirdColumn].filter(Boolean)
          });
        }
      }
    } else {
      // Regular row group - each field becomes cstm_col
      group.rowGroup?.forEach((field, fieldIndex) => {
        flattenedFields.push({
          ...field,
          name: `rowgroup_${groupIndex}_field_${fieldIndex}`,
          _isRowGroupField: true,
          _groupIndex: groupIndex,
          _fieldIndex: fieldIndex,
          _columnType: 'cstm_col'
        });
      });
    }
  });
  
  return flattenedFields;
};

/**
 * Maps form data to ticket database column structure including flattened row groups
 */
export const mapFormDataToTicketColumns = (
  formData: Record<string, any>,
  fields: FormField[],
  rowGroups: RowGroup[] = []
): MappedTicketData => {
  const mappedData: MappedTicketData = {};
  let counter = 1;

  // Map regular fields
  fields.forEach((field) => {
    const cstmColKey = `cstm_col${counter}`;
    const lblColKey = `lbl_col${counter}`;

    const fieldKey = field.name || field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fieldValue = formData[fieldKey];

    mappedData[cstmColKey] = fieldValue ?? '';
    mappedData[lblColKey] = field.label;
    counter++;
  });

  // Map flattened row groups
  const flattenedFields = flattenRowGroupsToFields(rowGroups);
  flattenedFields.forEach((field) => {
    const cstmColKey = `cstm_col${counter}`;
    const lblColKey = `lbl_col${counter}`;

    if (field._columnType === 'cstm_col') {
      const fieldValue = formData[field.name!];
      mappedData[cstmColKey] = fieldValue ?? '';
      
      // Handle combined fields for lbl_col
      if (field._combinedFields && field._combinedFields.length > 0) {
        const combinedValues = field._combinedFields
          .map(f => formData[`${field.name}_${f.name}`])
          .filter(Boolean)
          .join(' | ');
        mappedData[lblColKey] = combinedValues || field.label;
      } else {
        mappedData[lblColKey] = field.label;
      }
      
      counter++;
    }
  });

  return mappedData;
};

/**
 * Converts ticket column data back to form data structure
 * @param ticketData - Data with cstm_colX and lbl_colX structure
 * @param fields - Form field definitions
 * @returns Form data object
 */
export const mapTicketColumnsToFormData = (
  ticketData: MappedTicketData,
  fields: FormField[]
): Record<string, any> => {
  const formData: Record<string, any> = {};

  fields.forEach((field, index) => {
    const columnIndex = index + 1;
    const cstmColKey = `cstm_col${columnIndex}`;
    
    const fieldKey = field.name || field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    formData[fieldKey] = ticketData[cstmColKey] || '';
  });

  return formData;
};

/**
 * Gets the maximum number of supported form fields (based on database columns)
 */
export const getMaxFormFields = (): number => {
  return 15; // t_ticket_detail supports cstm_col1 through cstm_col15
};

/**
 * Validates that form doesn't exceed maximum field limit
 */
export const validateFormFieldCount = (fields: FormField[]): boolean => {
  return fields.length <= getMaxFormFields();
};
