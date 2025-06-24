
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

interface StructuredRowGroupProps {
  rowGroup: RowGroup;
  form: UseFormReturn<any>;
  groupIndex: number;
  maxTotalFields: number;
  currentFieldCount: number;
  onFieldCountChange: (count: number) => void;
}

interface RowData {
  id: string;
  firstValue: string;
  secondValue: string;
  thirdValue: string;
}

export const StructuredRowGroup: React.FC<StructuredRowGroupProps> = ({
  rowGroup,
  form,
  groupIndex,
  maxTotalFields,
  currentFieldCount,
  onFieldCountChange
}) => {
  const { toast } = useToast();
  const systemContext = useSystemVariableContext();
  const [rows, setRows] = useState<RowData[]>([
    { id: Date.now().toString(), firstValue: '', secondValue: '', thirdValue: '' }
  ]);

  const structure = rowGroup.structure;
  if (!structure) return null;

  // Resolve system variables for select options
  const resolvedThirdOptions = React.useMemo(() => {
    if (!structure.thirdColumn.options) return [];
    
    return structure.thirdColumn.options.map(option => {
      const resolved = resolveSystemVariable(option, systemContext);
      return Array.isArray(resolved) ? resolved : [resolved];
    }).flat().filter(Boolean);
  }, [structure.thirdColumn.options, systemContext]);

  // Update form values when rows change
  useEffect(() => {
    rows.forEach((row, index) => {
      const cstmKey = `structured_row_${groupIndex}_${index}_cstm`;
      const lblKey = `structured_row_${groupIndex}_${index}_lbl`;
      
      // First column goes to cstm_col
      form.setValue(cstmKey, row.firstValue);
      
      // Second + Third combined goes to lbl_col
      const combinedValue = row.secondValue && row.thirdValue 
        ? `${row.secondValue} ${row.thirdValue}`
        : row.secondValue || row.thirdValue || '';
      form.setValue(lblKey, combinedValue);
    });
    
    // Update field count
    onFieldCountChange(rows.length);
  }, [rows, groupIndex, form, onFieldCountChange]);

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
      firstValue: '',
      secondValue: '',
      thirdValue: ''
    }]);
  };

  const removeRow = (rowId: string) => {
    if (rows.length <= 1) return;
    
    const rowIndex = rows.findIndex(row => row.id === rowId);
    if (rowIndex === -1) return;

    // Clean up form values
    const cstmKey = `structured_row_${groupIndex}_${rowIndex}_cstm`;
    const lblKey = `structured_row_${groupIndex}_${rowIndex}_lbl`;
    form.unregister(cstmKey);
    form.unregister(lblKey);
    
    setRows(prev => prev.filter(row => row.id !== rowId));
  };

  const updateRow = (rowId: string, field: 'first' | 'second' | 'third', value: string) => {
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      
      return {
        ...row,
        [`${field}Value`]: value
      };
    }));
  };

  
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {rows.length} of {rowGroup.maxRows || 'unlimited'} rows • 
        Using {rows.length} of {maxTotalFields} total form fields
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
              {/* First Column */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {structure.firstColumn.label}
                </label>
                <Input
                  value={row.firstValue}
                  onChange={(e) => updateRow(row.id, 'first', e.target.value)}
                  placeholder={structure.firstColumn.placeholder}
                />
              </div>

              {/* Second Column */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {structure.secondColumn.label}
                </label>
                <Input
                  value={row.secondValue}
                  onChange={(e) => updateRow(row.id, 'second', e.target.value)}
                  placeholder={structure.secondColumn.placeholder}
                />
              </div>

              {/* Third Column */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {structure.thirdColumn.label}
                </label>
                <Select
                  value={row.thirdValue}
                  onValueChange={(value) => updateRow(row.id, 'third', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={structure.thirdColumn.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {resolvedThirdOptions.map((option, optIndex) => (
                      <SelectItem key={optIndex} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
      
      <div className="text-xs text-muted-foreground">
        Data mapping: First column → cstm_col, Second + Third → lbl_col (combined)
      </div>
    </div>
  );
};
