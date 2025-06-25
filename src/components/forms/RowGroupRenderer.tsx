
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { DynamicField } from './DynamicField';
import { FormField, RowGroup } from '@/types/formTypes';
import { useToast } from '@/hooks/use-toast';

interface RowGroupRendererProps {
  rowGroup: RowGroup;
  form: UseFormReturn<any>;
  groupIndex: number;
  maxTotalFields: number;
  currentFieldCount: number;
}

interface RowData {
  id: string;
  values: Record<string, any>;
}

export const RowGroupRenderer: React.FC<RowGroupRendererProps> = ({
  rowGroup,
  form,
  groupIndex,
  maxTotalFields,
  currentFieldCount
}) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<RowData[]>([
    { id: Date.now().toString(), values: {} }
  ]);

  const addRow = () => {
    const newRowCount = rows.length + 1;
    const fieldsPerRow = rowGroup.rowGroup?.length || 0;
    const totalAfterAdd = currentFieldCount + fieldsPerRow;
    
    if (totalAfterAdd > maxTotalFields) {
      toast({
        title: "Field Limit Exceeded",
        description: `Cannot add more rows. Maximum ${maxTotalFields} fields allowed.`,
        variant: "destructive",
      });
      return;
    }

    setRows(prev => [...prev, {
      id: Date.now().toString(),
      values: {}
    }]);
  };

  const removeRow = (rowId: string) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter(row => row.id !== rowId));
  };

  const updateRowValue = (rowId: string, fieldName: string, value: any) => {
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        values: { ...row.values, [fieldName]: value }
      };
    }));

    // Update form values based on combination setting
    const combination = rowGroup.structure?.combinedMapping || 'none';
    const rowIndex = rows.findIndex(r => r.id === rowId);
    
    if (combination === 'none') {
      // Each field gets its own cstm_col
      const formKey = `rowgroup_${groupIndex}_${rowIndex}_${fieldName}`;
      form.setValue(formKey, value);
    } else {
      // Combined mapping logic
      const row = rows.find(r => r.id === rowId);
      if (row && rowGroup.rowGroup) {
        const firstField = rowGroup.rowGroup[0];
        const secondField = rowGroup.rowGroup[1];
        
        const cstmKey = `rowgroup_${groupIndex}_${rowIndex}_cstm`;
        const lblKey = `rowgroup_${groupIndex}_${rowIndex}_lbl`;
        
        if (combination === 'first_second') {
          // First field → cstm_col, Second field → lbl_col
          if (fieldName === firstField?.name) {
            form.setValue(cstmKey, value);
          } else if (fieldName === secondField?.name) {
            form.setValue(lblKey, value);
          }
        }
        // Add more combination logic here as needed
      }
    }
  };

  return (
    <Card className="border-l-4 border-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {rowGroup.title || `Row Group ${groupIndex + 1}`}
            <span className="text-xs text-muted-foreground ml-2">
              ({rows.length} rows)
            </span>
          </CardTitle>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={currentFieldCount + (rowGroup.rowGroup?.length || 0) > maxTotalFields}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Row
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {rows.map((row, rowIndex) => (
          <Card key={row.id} className="p-3 border border-muted">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Row {rowIndex + 1}</span>
              {rows.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {rowGroup.rowGroup?.map((field, fieldIndex) => (
                <DynamicField
                  key={`${row.id}_${fieldIndex}`}
                  field={field}
                  form={form}
                  fieldKey={`rowgroup_${groupIndex}_${rowIndex}_${field.name || fieldIndex}`}
                  onValueChange={(value) => updateRowValue(row.id, field.name || field.label, value)}
                />
              ))}
            </div>
          </Card>
        ))}

        {/* Show combination mapping info */}
        {rowGroup.structure?.combinedMapping && (
          <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded">
            <strong>Mapping:</strong> {
              rowGroup.structure.combinedMapping === 'none' 
                ? 'Each field → separate cstm_col' 
                : rowGroup.structure.combinedMapping === 'first_second'
                ? 'First field → cstm_col, Second field → lbl_col'
                : 'Custom mapping'
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};
