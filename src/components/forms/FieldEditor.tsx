
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/types/formTypes';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onCancel: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ field, onUpdate, onCancel }) => {
  const [localField, setLocalField] = useState<FormField>(field);

  const updateField = (updates: Partial<FormField>) => {
    setLocalField(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onUpdate(localField);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Field Label</Label>
          <Input
            value={localField.label}
            onChange={(e) => updateField({ label: e.target.value })}
            placeholder="Field label"
          />
        </div>
        <div>
          <Label>Field Name</Label>
          <Input
            value={localField.name}
            onChange={(e) => updateField({ name: e.target.value })}
            placeholder="field_name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Field Type</Label>
          <Select 
            value={localField.type} 
            onValueChange={(value: FormField['type']) => updateField({ type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="file">File</SelectItem>
              <SelectItem value="toggle">Toggle</SelectItem>
              <SelectItem value="number">Number</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Column Span</Label>
          <Select
            value={String(localField.columnSpan || 1)}
            onValueChange={(value) => updateField({ columnSpan: Number(value) as 1 | 2 | 3 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Column</SelectItem>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            checked={localField.required || false}
            onCheckedChange={(checked) => updateField({ required: checked })}
          />
          <Label>Required</Label>
        </div>
      </div>

      {localField.type === 'select' && (
        <div>
          <Label>Options (one per line)</Label>
          <Textarea
            value={localField.options?.join('\n') || ''}
            onChange={(e) => updateField({ options: e.target.value.split('\n').filter(Boolean) })}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      )}

      <div>
        <Label>Placeholder</Label>
        <Input
          value={localField.placeholder || ''}
          onChange={(e) => updateField({ placeholder: e.target.value })}
          placeholder="Placeholder text"
        />
      </div>

      <div>
        <Label>Default Value</Label>
        <Input
          value={localField.default || ''}
          onChange={(e) => updateField({ default: e.target.value })}
          placeholder="Default value"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Field
        </Button>
      </div>
    </div>
  );
};
