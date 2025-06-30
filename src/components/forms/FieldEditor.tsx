
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/types/formTypes';
import { Save, X } from 'lucide-react';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onCancel: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ field, onUpdate, onCancel }) => {
  const [editedField, setEditedField] = useState<FormField>({ ...field });

  const handleSave = () => {
    onUpdate(editedField);
  };

  const addOption = () => {
    const newOptions = [...(editedField.options || []), ''];
    setEditedField({ ...editedField, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editedField.options || [])];
    newOptions[index] = value;
    setEditedField({ ...editedField, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (editedField.options || []).filter((_, i) => i !== index);
    setEditedField({ ...editedField, options: newOptions });
  };

  const fieldTypes = [
    'text', 'textarea', 'select', 'radio', 'checkbox', 
    'date', 'file', 'toggle', 'number'
  ];

  const showOptions = ['select', 'radio', 'checkbox'].includes(editedField.type);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Field Label</Label>
          <Input
            value={editedField.label}
            onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
          />
        </div>
        <div>
          <Label>Field Name</Label>
          <Input
            value={editedField.name}
            onChange={(e) => setEditedField({ ...editedField, name: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Field Type</Label>
          <Select value={editedField.type} onValueChange={(value: any) => setEditedField({ ...editedField, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Column Span</Label>
          <Select 
            value={editedField.columnSpan?.toString() || '1'} 
            onValueChange={(value) => setEditedField({ ...editedField, columnSpan: parseInt(value) })}
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
      </div>

      <div>
        <Label>Placeholder</Label>
        <Input
          value={editedField.placeholder || ''}
          onChange={(e) => setEditedField({ ...editedField, placeholder: e.target.value })}
        />
      </div>

      {showOptions && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Options</Label>
            <Button variant="outline" size="sm" onClick={addOption}>
              Add Option
            </Button>
          </div>
          <div className="space-y-2">
            {(editedField.options || []).map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button variant="outline" size="sm" onClick={() => removeOption(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={editedField.required || false}
            onCheckedChange={(checked) => setEditedField({ ...editedField, required: checked })}
          />
          <Label>Required</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={editedField.readonly || false}
            onCheckedChange={(checked) => setEditedField({ ...editedField, readonly: checked })}
          />
          <Label>Read Only</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Field
        </Button>
      </div>
    </div>
  );
};
