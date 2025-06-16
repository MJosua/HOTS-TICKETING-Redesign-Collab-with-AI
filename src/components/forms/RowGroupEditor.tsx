
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { FormField, RowGroup } from '@/types/formTypes';

interface RowGroupEditorProps {
  rowGroups: RowGroup[];
  onUpdate: (rowGroups: RowGroup[]) => void;
}

export const RowGroupEditor: React.FC<RowGroupEditorProps> = ({ rowGroups, onUpdate }) => {
  const addRowGroup = () => {
    const newRowGroup: RowGroup = {
      rowGroup: [
        { label: 'New Field 1', name: 'new_field_1', type: 'text', required: false },
        { label: 'New Field 2', name: 'new_field_2', type: 'text', required: false }
      ]
    };
    onUpdate([...rowGroups, newRowGroup]);
  };

  const removeRowGroup = (index: number) => {
    const updated = rowGroups.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const moveRowGroup = (index: number, direction: 'up' | 'down') => {
    const newRowGroups = [...rowGroups];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newRowGroups.length) {
      [newRowGroups[index], newRowGroups[newIndex]] = [newRowGroups[newIndex], newRowGroups[index]];
      onUpdate(newRowGroups);
    }
  };

  const updateRowGroup = (groupIndex: number, updatedGroup: RowGroup) => {
    const updated = [...rowGroups];
    updated[groupIndex] = updatedGroup;
    onUpdate(updated);
  };

  const addFieldToRow = (groupIndex: number) => {
    const updated = [...rowGroups];
    if (updated[groupIndex].rowGroup.length < 3) {
      const fieldNumber = updated[groupIndex].rowGroup.length + 1;
      updated[groupIndex].rowGroup.push({
        label: `New Field ${fieldNumber}`,
        name: `new_field_${groupIndex}_${fieldNumber}`,
        type: 'text',
        required: false
      });
      onUpdate(updated);
    }
  };

  const removeFieldFromRow = (groupIndex: number, fieldIndex: number) => {
    const updated = [...rowGroups];
    if (updated[groupIndex].rowGroup.length > 1) {
      updated[groupIndex].rowGroup = updated[groupIndex].rowGroup.filter((_, i) => i !== fieldIndex);
      onUpdate(updated);
    }
  };

  const updateFieldInRow = (groupIndex: number, fieldIndex: number, updatedField: FormField) => {
    const updated = [...rowGroups];
    updated[groupIndex].rowGroup[fieldIndex] = updatedField;
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Row Groups</h3>
        <Button size="sm" onClick={addRowGroup}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row Group
        </Button>
      </div>

      {rowGroups.map((rowGroup, groupIndex) => (
        <Card key={groupIndex} className="border-l-4 border-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                Row Group {groupIndex + 1}
              </CardTitle>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => moveRowGroup(groupIndex, 'up')} 
                  disabled={groupIndex === 0}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => moveRowGroup(groupIndex, 'down')} 
                  disabled={groupIndex === rowGroups.length - 1}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => addFieldToRow(groupIndex)}
                  disabled={rowGroup.rowGroup.length >= 3}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => removeRowGroup(groupIndex)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rowGroup.rowGroup.map((field, fieldIndex) => (
                <FieldInRowEditor
                  key={fieldIndex}
                  field={field}
                  onUpdate={(updatedField) => updateFieldInRow(groupIndex, fieldIndex, updatedField)}
                  onRemove={() => removeFieldFromRow(groupIndex, fieldIndex)}
                  canRemove={rowGroup.rowGroup.length > 1}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {rowGroups.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-muted-foreground mb-4">No row groups created yet</p>
          <Button onClick={addRowGroup}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Row Group
          </Button>
        </div>
      )}
    </div>
  );
};

interface FieldInRowEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const FieldInRowEditor: React.FC<FieldInRowEditorProps> = ({ field, onUpdate, onRemove, canRemove }) => {
  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const generateFieldName = (label: string) => {
    return label.toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  const handleLabelChange = (label: string) => {
    const suggestedName = generateFieldName(label);
    updateField({ 
      label, 
      name: field.name || suggestedName 
    });
  };

  return (
    <Card className="p-3 border border-muted">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Input
            value={field.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Field Label"
            className="text-sm font-medium"
          />
          {canRemove && (
            <Button size="sm" variant="ghost" onClick={onRemove}>
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>

        <Input
          value={field.name}
          onChange={(e) => updateField({ name: e.target.value })}
          placeholder="field_name"
          className="text-xs"
        />

        <div className="grid grid-cols-2 gap-2">
          <Select value={field.type} onValueChange={(value) => updateField({ type: value })}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="file">File</SelectItem>
              <SelectItem value="toggle">Toggle</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField({ required: e.target.checked })}
              className="scale-75"
            />
            <Label className="text-xs">Required</Label>
          </div>
        </div>

        <Input
          value={field.placeholder || ''}
          onChange={(e) => updateField({ placeholder: e.target.value })}
          placeholder="Placeholder text"
          className="text-xs"
        />

        {(field.type === 'select' || field.type === 'radio') && (
          <Textarea
            value={field.options?.join('\n') || ''}
            onChange={(e) => updateField({ options: e.target.value.split('\n').filter(o => o.trim()) })}
            placeholder="Options (one per line)"
            rows={2}
            className="text-xs"
          />
        )}
      </div>
    </Card>
  );
};
