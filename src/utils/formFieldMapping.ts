
import { FormField } from '@/types/formTypes';

export interface TicketColumnMapping {
  [key: string]: any; // cstm_col1, cstm_col2, etc.
}

export interface TicketLabelMapping {
  [key: string]: string; // lbl_col1, lbl_col2, etc.
}

export interface MappedTicketData extends TicketColumnMapping, TicketLabelMapping {}

/**
 * Maps form data to ticket database column structure
 * @param formData - Raw form submission data
 * @param fields - Form field definitions
 * @returns Object with cstm_colX and lbl_colX properties
 */
export const mapFormDataToTicketColumns = (
  formData: Record<string, any>,
  fields: FormField[],
  rowGroups: RowGroup[] = []
): MappedTicketData => {
  const mappedData: MappedTicketData = {};
  let counter = 1;

  // 🔹 Step 1: Map regular fields
  fields.forEach((field, index) => {
    const cstmColKey = `cstm_col${counter}`;
    const lblColKey = `lbl_col${counter}`;

    const fieldKey = field.name || field.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fieldValue = formData[fieldKey];

    mappedData[cstmColKey] = fieldValue ?? '';
    mappedData[lblColKey] = field.label;
    counter++;
  });

  // 🔸 Step 2: Map structured row groups
  rowGroups.forEach((group, gIndex) => {
    group.rowGroup?.forEach((row, rIndex) => {
      const columns = ['firstColumn', 'secondColumn', 'thirdColumn'] as const;

      columns.forEach((colKey) => {
        const col = group.structure?.[colKey];
        if (!col?.name || !col?.label) return;

        const value = row[col.name];
        mappedData[`cstm_col${counter}`] = value ?? '';
        mappedData[`lbl_col${counter}`] = col.label;
        counter++;
      });
    });
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
