
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RowGroup } from '@/types/formTypes';
import { useToast } from '@/hooks/use-toast';
import { resolveSystemVariable, useSystemVariableContext } from '@/utils/systemVariableResolver';

interface EnhancedStructuredRowGroupProps {
  rowGroup: RowGroup;
  form: UseFormReturn<any>;
  groupIndex: number;
  maxTotalFields: number;
  currentFieldCount: number;
  onFieldCountChange: (count: number) => void;
  startingColumnIndex?: number; // Starting index for cstm_col numbering
}

interface RowData {
  id: string;
  values: { [key: string]: string }; // Dynamic values based on column structure
}

export const EnhancedStructuredRowGroup: React.FC<EnhancedStructuredRowGroupProps> = ({
  rowGroup,
  form,
  groupIndex,
  maxTotalFields,
  currentFieldCount,
  onFieldCountChange,
  startingColumnIndex = 1
}) => {
  const { toast } = useToast();
  const systemContext = useSystemVariableContext();
  const [rows, setRows] = useState<RowData[]>([
    { id: Date.now().toString(), values: {} }
  ]);

  const structure = rowGroup.structure;
  if (!structure) return null;

  // Get all columns in order
  const columns = [
    { key: 'first', config: structure.firstColumn },
    { key: 'second', config: structure.secondColumn },
    { key: 'third', config: structure.thirdColumn }
  ].filter(col => col.config);

  // Resolve system variables for select options
  const getResolvedOptions = (options?: string[]) => {
    if (!options) return [];
    
    return options.map(option => {
      const resolved = resolveSystemVariable(option, systemContext);
      return Array.isArray(resolved) ? resolved : [resolved];
    }).flat().filter(Boolean);
  };

  // Update form values following cstm_col + lbl_col logic
  useEffect(() => {
    rows.forEach((row, rowIndex) => {
      const columnIndex = startingColumnIndex + rowIndex;
      
      // First column goes to cstm_col
      const firstValue = row.values[columns[0]?.key] || '';
      form.setValue(`cstm_col_${columnIndex}`, firstValue);
      
      // Remaining columns are combined for lbl_col
      const remainingValues = columns.slice(1)
        .map(col => row.values[col.key])
        .filter(Boolean);
      
      const combinedValue = remainingValues.join(' | ');
      form.setValue(`lbl_col_${columnIndex}`, combinedValue);
      
      // Also set readable field names for the form
      form.setValue(`${rowGroup.structure?.firstColumn.name}_${rowIndex}`, firstValue);
      if (remainingValues.length > 0) {
        form.setValue(`${rowGroup.structure?.secondColumn.name}_${rowIndex}`, remainingValues[0] || '');
        if (remainingValues.length > 1) {
          form.setValue(`${rowGroup.structure?.thirdColumn.name}_${rowIndex}`, remainingValues[1] || '');
        }
      }
    });
    
    // Update field count (each row uses 1 database column pair)
    onFieldCountChange(rows.length);
  }, [rows, form, columns, startingColumnIndex, onFieldCountChange, rowGroup.structure]);

  const addRow = () => {
    const newRowCount = rows.length + 1;
    const totalAfterAdd = currentFieldCount - rows.length + newRowCount;
    
    if (totalAfterAdd > maxTotalFields) {
      toast({
        title: "Field Limit Exceeded",
        description: `Cannot add more rows. Maximum ${maxTotalFields} fields allowed across the entire form.`,
        variant: "destructive",
      });
      return;
    }

    if (rowGroup.maxRows && newRowCount > rowGroup.maxRows) {
      toast({
        title: "Row Limit Exceeded",
        description: `Maximum ${rowGroup.maxRows} rows allowed for this section.`,
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
    
    const rowIndex = rows.findIndex(row => row.id === rowId);
    if (rowIndex === -1) return;

    // Clean up form values
    const columnIndex = startingColumnIndex + rowIndex;
    form.unregister(`cstm_col_${columnIndex}`);
    form.unregister(`lbl_col_${columnIndex}`);
    
    // Clean up readable field names
    form.unregister(`${rowGroup.structure?.firstColumn.name}_${rowIndex}`);
    form.unregister(`${rowGroup.structure?.secondColumn.name}_${rowIndex}`);
    form.unregister(`${rowGroup.structure?.thirdColumn.name}_${rowIndex}`);
    
    setRows(prev => prev.filter(row => row.id !== rowId));
  };

  const updateRowValue = (rowId: string, columnKey: string, value: string) => {
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      
      return {
        ...row,
        values: {
          ...row.values,
          [columnKey]: value
        }
      };
    }));
  };

  const renderField = (column: any, row: RowData, columnKey: string) => {
    const value = row.values[columnKey] || '';
    
    switch (column.config.type) {
      case 'select':
        const options = getResolvedOptions(column.config.options);
        return (
          <Select
            value={value}
            onValueChange={(newValue) => updateRowValue(row.id, columnKey, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={column.config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, optIndex) => (
                <SelectItem key={optIndex} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateRowValue(row.id, columnKey, e.target.value)}
            placeholder={column.config.placeholder}
          />
        );
      
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => updateRowValue(row.id, columnKey, e.target.value)}
            placeholder={column.config.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {rows.length} of {rowGroup.maxRows || 'unlimited'} rows • 
        Using columns {startingColumnIndex} to {startingColumnIndex + rows.length - 1} • 
        {rows.length} of {maxTotalFields} total form fields
      </div>
      
      {rows.map((row, index) => (
        <Card key={row.id} className="relative">
          <CardContent className="pt-4">
            {rows.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeRow(row.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {columns.map((column, colIndex) => (
                <div key={column.key}>
                  <label className="text-sm font-medium mb-1 block">
                    {column.config.label}
                    {colIndex === 0 && (
                      <span className="text-xs text-blue-600 ml-1">(→ cstm_col_{startingColumnIndex + index})</span>
                    )}
                    {colIndex > 0 && colIndex === 1 && (
                      <span className="text-xs text-green-600 ml-1">(→ lbl_col_{startingColumnIndex + index})</span>
                    )}
                  </label>
                  {renderField(column, row, column.key)}
                </div>
              ))}

              {/* Add Row Button */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                  disabled={
                    (rowGroup.maxRows && rows.length >= rowGroup.maxRows) ||
                    (currentFieldCount - rows.length + rows.length + 1 > maxTotalFields)
                  }
                  className="w-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="text-xs text-muted-foreground space-y-1">
        <div><strong>Data mapping logic:</strong></div>
        <div>• First column ({structure.firstColumn.label}) → cstm_col_N</div>
        <div>• Remaining columns combined with " | " → lbl_col_N</div>
        <div>• N starts from {startingColumnIndex} and increments per row</div>
      </div>
    </div>
  );
};
