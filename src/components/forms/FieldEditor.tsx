
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/types/formTypes';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info, Link, Unlink } from 'lucide-react';
import { SYSTEM_VARIABLE_ENTRIES } from '@/utils/systemVariableDefinitions/systemVariableDefinitions';

interface FieldEditorProps {
  field: FormField;
  fields?: FormField[];
  onUpdate: (field: FormField) => void;
  onCancel: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ field, fields = [], onUpdate, onCancel }) => {
  const [localField, setLocalField] = useState<FormField>(field);

  const updateField = (updates: Partial<FormField>) => {
    setLocalField(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onUpdate(localField);
  };

  const SystemVariableHelper = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="w-3 h-3 mr-1" />
          System Variables
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-96 overflow-auto">
        <div className="space-y-2">
          <h4 className="font-medium">Available System Variables:</h4>
          <div className="text-sm space-y-1">
            {SYSTEM_VARIABLE_ENTRIES.map((entry) => (
              <div key={entry.key}>
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{entry.key}</code>
                <span className="ml-2 text-muted-foreground">{entry.description}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  // Get available fields for dependency selection
  const availableFields = fields.filter(f => f.name !== localField.name && f.name);

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

      {/* Enhanced dependency selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Chain Link Field (Depends On)
          </Label>
          <Select
            value={localField.dependsOn ?? "none"}
            onValueChange={(value) =>
              updateField({ dependsOn: value === "none" ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <Unlink className="w-4 h-4" />
                  None
                </div>
              </SelectItem>
              {availableFields.length > 0 ? (
                availableFields.map(f => (
                  <SelectItem key={f.name} value={f.name}>
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      {f.label} ({f.name})
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no_fields" disabled>
                  No fields available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {localField.dependsOn && (
            <p className="text-xs text-blue-600 mt-1">
              This field will be filtered based on the selected field's value
            </p>
          )}
        </div>
        <div>
          <Label>Filter Options By</Label>
          <Input
            value={localField.filterOptionsBy || ''}
            onChange={(e) => updateField({ filterOptionsBy: e.target.value || undefined })}
            placeholder="property.key or expression"
            disabled={!localField.dependsOn}
          />
          {localField.dependsOn && (
            <p className="text-xs text-gray-500 mt-1">
              e.g., "plant_description" or "category.name"
            </p>
          )}
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
              <SelectItem value="suggestion-insert">Suggestion Insert</SelectItem>
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

      {(localField.type === 'select' || localField.type === 'suggestion-insert') && (
        <div>
          <Label>Options (one per line)</Label>
          <Textarea
            value={localField.options?.join('\n') || ''}
            onChange={(e) => updateField({ options: e.target.value.split('\n').filter(Boolean) })}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            For chain link fields, these options will be filtered based on the dependent field's value
          </p>
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
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SystemVariableHelper />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use system variables like ${'{user}'} for dynamic defaults
          </p>
        </div>
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
