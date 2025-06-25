
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Settings } from 'lucide-react';
import { DynamicField } from './DynamicField';
import { FormField, RowGroup } from '@/types/formTypes';
import { useToast } from '@/hooks/use-toast';

interface ManualRowGroupFieldProps {
  rowGroup: RowGroup;
  form: UseFormReturn<any>;
  groupIndex: number;
  onUpdate: (updatedRowGroup: RowGroup) => void;
  maxTotalFields: number;
  currentFieldCount: number;
}

interface RowData {
  id: string;
  values: Record<string, any>;
}

export const ManualRowGroupField: React.FC<ManualRowGroupFieldProps> = ({
  rowGroup,
  form,
  groupIndex,
  onUpdate,
  maxTotalFields,
  currentFieldCount
}) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<RowData[]>([
    { id: Date.now().toString(), values: {} }
  ]);
  const [showFieldEditor, setShowFieldEditor] = useState(false);

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

    // Update form values
    const formKey = `rowgroup_${groupIndex}_${rowId}_${fieldName}`;
    form.setValue(formKey, value);
  };

  const addFieldToRowGroup = () => {
    if (!rowGroup.rowGroup || rowGroup.rowGroup.length >= 3) return;
    
    const newField: FormField = {
      label: `Field ${rowGroup.rowGroup.length + 1}`,
      name: `field_${rowGroup.rowGroup.length + 1}`,
      type: 'text',
      required: false,
      columnSpan: 1
    };

    const updatedRowGroup = {
      ...rowGroup,
      rowGroup: [...rowGroup.rowGroup, newField]
    };
    
    onUpdate(updatedRowGroup);
  };

  const updateField = (fieldIndex: number, updatedField: FormField) => {
    if (!rowGroup.rowGroup) return;
    
    const updatedFields = [...rowGroup.rowGroup];
    updatedFields[fieldIndex] = updatedField;
    
    const updatedRowGroup = {
      ...rowGroup,
      rowGroup: updatedFields
    };
    
    onUpdate(updatedRowGroup);
  };

  const removeField = (fieldIndex: number) => {
    if (!rowGroup.rowGroup || rowGroup.rowGroup.length <= 1) return;
    
    const updatedFields = rowGroup.rowGroup.filter((_, i) => i !== fieldIndex);
    const updatedRowGroup = {
      ...rowGroup,
      rowGroup: updatedFields
    };
    
    onUpdate(updatedRowGroup);
  };

  return (
    <Card className="border-l-4 border-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Row Group {groupIndex + 1}
            <span className="text-xs text-muted-foreground ml-2">
              ({rows.length} rows, {rowGroup.rowGroup?.length || 0} fields each)
            </span>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFieldEditor(!showFieldEditor)}
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={addFieldToRowGroup}
              disabled={!rowGroup.rowGroup || rowGroup.rowGroup.length >= 3}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Field Configuration Editor */}
        {showFieldEditor && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium">Field Configuration</h4>
            {rowGroup.rowGroup?.map((field, fieldIndex) => (
              <FieldConfigEditor
                key={fieldIndex}
                field={field}
                onUpdate={(updatedField) => updateField(fieldIndex, updatedField)}
                onRemove={() => removeField(fieldIndex)}
                canRemove={rowGroup.rowGroup!.length > 1}
              />
            ))}
          </div>
        )}

        {/* Data Rows */}
        <div className="space-y-3">
          {rows.map((row, rowIndex) => (
            <Card key={row.id} className="p-3 border border-muted">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Row {rowIndex + 1}</span>
                {rows.length > 1 && (
                  <Button
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
                    fieldKey={`rowgroup_${groupIndex}_${row.id}_${field.name}`}
                    onValueChange={(value) => updateRowValue(row.id, field.name!, value)}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Add Row Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          disabled={currentFieldCount + (rowGroup.rowGroup?.length || 0) > maxTotalFields}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Using {rows.length * (rowGroup.rowGroup?.length || 0)} of {maxTotalFields} total form fields
        </div>
      </CardContent>
    </Card>
  );
};

interface FieldConfigEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const FieldConfigEditor: React.FC<FieldConfigEditorProps> = ({
  field,
  onUpdate,
  onRemove,
  canRemove
}) => {
  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2 border rounded">
      <Input
        value={field.label}
        onChange={(e) => updateField({ label: e.target.value })}
        placeholder="Field Label"
        className="text-sm"
      />
      
      <Select value={field.type} onValueChange={(value) => updateField({ type: value })}>
        <SelectTrigger className="text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">Text</SelectItem>
          <SelectItem value="textarea">Textarea</SelectItem>
          <SelectItem value="select">Select</SelectItem>
          <SelectItem value="number">Number</SelectItem>
          <SelectItem value="date">Date</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Label className="text-xs">Required</Label>
        <Switch
          checked={field.required}
          onCheckedChange={(checked) => updateField({ required: checked })}
        />
      </div>

      <div className="flex items-center gap-1">
        <Select 
          value={field.columnSpan?.toString() || '1'} 
          onValueChange={(value) => updateField({ columnSpan: parseInt(value) as 1 | 2 | 3 })}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Col</SelectItem>
            <SelectItem value="2">2 Col</SelectItem>
            <SelectItem value="3">3 Col</SelectItem>
          </SelectContent>
        </Select>
        
        {canRemove && (
          <Button size="sm" variant="ghost" onClick={onRemove}>
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
