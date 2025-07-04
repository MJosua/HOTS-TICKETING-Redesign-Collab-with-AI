// StructuredRowGroup.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
import { resolveSystemVariable } from '@/utils/systemVariableResolver';
import { useSystemVariableContext } from '@/utils/systemVariableDefinitions/systemVariableDefinitions';
import { SuggestionInsertInput } from './SuggestionInsertInput';

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
  const rows = (rowGroup.rowGroup || []) as RowData[];

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
      const defaultRow: RowData[] = [
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

  // Compute total of secondValue fields as numbers
  const totalSecondValue = useMemo(() => {
    return rows.reduce((sum, row) => {
      const num = Number(row.secondValue);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [rows]);

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
    const newRows: RowData[] = [
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


  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(rowGroup.options || []);


  const resolveOptions = (options: string[]) => {
    return options.map(option => {
      const resolved = resolveSystemVariable(option, systemContext);
      // console.log('🔧 System Variable Resolution:', {
      //   original: option,
      //   resolved: resolved,
      //   context: systemContext
      // });
      // Instead of joining arrays into a string, flatten arrays to individual options
      return Array.isArray(resolved) ? resolved : [resolved];
    }).flat();
  };



  useEffect(() => {
    if (structure.firstColumn.type === 'suggestion-insert') {
      if (Array.isArray(structure?.firstColumn.options)) {
        const resolvedSuggestions = resolveOptions(structure?.firstColumn.options);
        setSuggestions(resolvedSuggestions);
      } else if (filteredOptions.length > 0) {
        // Use filtered options as fallback suggestions
        setSuggestions(filteredOptions);
      } else {
        // If nothing is available, clear suggestions
        setSuggestions([]);
      }
    }
  }, [structure, rowGroup?.suggestions, filteredOptions]);




  const renderField = (
    column: 'firstColumn' | 'secondColumn' | 'thirdColumn',
    value: string,
    onChange: (val: string) => void
  ) => {
    const colDef = structure[column];
    switch (colDef.type) {

      case 'select':
        const options =
          column === 'thirdColumn' ? resolvedThirdOptions :
            Array.isArray(colDef.options) ? colDef.options : [];

        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={colDef.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt: string, idx: number) => (
                <SelectItem key={idx} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={colDef.placeholder}
          />
        );

      case 'suggestion-insert':
        return (
          <SuggestionInsertInput
            suggestions={suggestions.map(s => (typeof s === 'object' && s !== null ? s.label || s.name || JSON.stringify(s) : s))}
            placeholder={colDef.placeholder || "Type or select from suggestions"}
            onChange={val => onChange(val)}
          />
        );

      default:
        return (
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={colDef.placeholder}
          />
        );
    }
  };

  // useEffect(() => {
  //   first

  //   return () => {
  //     second
  //   }
  // }, [third])


  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {rows.length} of {rowGroup.maxRows || 'unlimited'} rows • Using {rows.length} of {maxTotalFields} fields
      </div>

      <Card className="relative">
        <CardContent className="pt-4 space-y-4">

          {/* Header Labels */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mt-4">
            <div className="col-span-1 md:col-span-3">
              <label className="text-sm font-medium mb-1 block">{structure.firstColumn.label}</label>
            </div>
            <div className="col-span-1 md:col-span-1">
              <label className="text-sm font-medium mb-1 block">{structure.secondColumn.label}</label>
            </div>
            <div className="col-span-1 md:col-span-1">
              <label className="text-sm font-medium mb-1 block">{structure.thirdColumn.label}</label>
            </div>
          </div>
          {console.log("rows", rows)}
          {/* Row Entries */}
          {rows.map((row, index) => (
            <div key={row.id} className="relative">


              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start mb-4">
                <div className="col-span-1 md:col-span-3">
                  {renderField('firstColumn', row.firstValue, val => updateRow(row.id, 'first', val))}
                </div>
                <div className="col-span-1 md:col-span-1">
                  {renderField('secondColumn', row.secondValue, val => updateRow(row.id, 'second', val))}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end ">
                    <div className={`col-span-1   ${rows.length > 1 ? 'md:col-span-4' : 'md:col-span-5'} `}>
                      {renderField('thirdColumn', row.thirdValue, val => updateRow(row.id, 'third', val))}
                    </div>
                    <div className="col-span-1 md:col-span-1">
                      {rows.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-[39px] w-10 flex items-center justify-center"
                          onClick={() => removeRow(row.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}

          {/* Bottom Total Row */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mt-0">
            <div className="col-span-1 md:col-span-3" />
            <label className="text-sm font-medium text-right flex items-center justify-end h-full">
              Total
            </label>

            <div className="col-span-1 md:col-span-2">
              {/* Insert total value or field here if needed */}
              <Input readOnly value={totalSecondValue.toString()} />
            </div>
          </div>

        </CardContent>
      </Card>




      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div >
  );
};
