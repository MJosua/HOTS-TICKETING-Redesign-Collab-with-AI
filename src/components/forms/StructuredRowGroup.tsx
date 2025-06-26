// StructuredRowGroup.tsx
import React, { useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RowGroup } from '@/types/formTypes';
import { useToast } from '@/hooks/use-toast';
import {
  resolveSystemVariable,
  useSystemVariableContext,
} from '@/utils/systemVariableResolver';

interface StructuredRowGroupProps {
  rowGroup: RowGroup;
  form: UseFormReturn<any>;
  groupIndex: number;
  maxTotalFields: number;
  currentFieldCount: number;
  onFieldCountChange: (count: number) => void;
  onUpdateRowGroup: (groupIndex: number, updatedRows: RowData[]) => void;
}

export interface RowData {
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
  onFieldCountChange,
  onUpdateRowGroup,
}) => {
  const { toast } = useToast();
  const systemContext = useSystemVariableContext();
  const rows = rowGroup.rowGroup || [];

  const structure = rowGroup.structure;
  if (!structure) return null;

  const resolvedThirdOptions = useMemo(() => {
    if (!structure.thirdColumn.options) return [];
    return structure.thirdColumn.options
      .map(option => {
        const resolved = resolveSystemVariable(option, systemContext);
        return Array.isArray(resolved) ? resolved : [resolved];
      })
      .flat()
      .filter(Boolean);
  }, [structure.thirdColumn.options, systemContext]);

  useEffect(() => {
    if (rows.length === 0) {
      const defaultRow = [
        {
          id: Date.now().toString(),
          firstValue: '',
          secondValue: '',
          thirdValue: ''
        }
      ];
      onUpdateRowGroup(groupIndex, defaultRow);
    }
  }, []);


  const addRow = () => {
    const newRowCount = rows.length + 1;
    const totalAfterAdd = currentFieldCount - rows.length + newRowCount;
    if (totalAfterAdd > maxTotalFields) {
      toast({
        title: "Field Limit Exceeded",
        description: `Cannot add more rows. Maximum ${maxTotalFields} fields allowed.`,
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
    const newRows = [
      ...rows,
      { id: Date.now().toString(), firstValue: '', secondValue: '', thirdValue: '' },
    ];
    onUpdateRowGroup(groupIndex, newRows);
  };

  const removeRow = (rowId: string) => {
    if (rows.length <= 1) return;
    const rowIndex = rows.findIndex(row => row.id === rowId);
    if (rowIndex === -1) return;
    form.unregister(`structured_row_${groupIndex}_${rowIndex}_cstm`);
    form.unregister(`structured_row_${groupIndex}_${rowIndex}_lbl`);
    const updatedRows = rows.filter(row => row.id !== rowId);
    onUpdateRowGroup(groupIndex, updatedRows);
  };

  const updateRow = (rowId: string, field: 'first' | 'second' | 'third', value: string) => {
    const updatedRows = rows.map(row =>
      row.id === rowId ? { ...row, [`${field}Value`]: value } : row
    );
    onUpdateRowGroup(groupIndex, updatedRows);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {rows.length} of {rowGroup.maxRows || 'unlimited'} rows • Using {rows.length} of {maxTotalFields} fields
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 items-end">
              <div>
                <label className="text-sm font-medium mb-1 block">{structure.firstColumn.label}</label>
                <Input
                  value={row.firstValue}
                  onChange={e => updateRow(row.id, 'first', e.target.value)}
                  placeholder={structure.firstColumn.placeholder}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{structure.secondColumn.label}</label>
                <Input
                  value={row.secondValue}
                  onChange={e => updateRow(row.id, 'second', e.target.value)}
                  placeholder={structure.secondColumn.placeholder}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{structure.thirdColumn.label}</label>
                <Select
                  value={row.thirdValue}
                  onValueChange={value => updateRow(row.id, 'third', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={structure.thirdColumn.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {resolvedThirdOptions.map((opt, idx) => (
                      <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
