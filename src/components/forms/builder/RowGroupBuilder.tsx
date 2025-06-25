
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RowGroup, FormField } from '@/types/formTypes';
import { Plus, Trash2, Settings, GripVertical } from 'lucide-react';

interface RowGroupBuilderProps {
  rowGroup: RowGroup;
  onUpdate: (updates: Partial<RowGroup>) => void;
  onDelete: () => void;
}

export const RowGroupBuilder: React.FC<RowGroupBuilderProps> = ({
  rowGroup,
  onUpdate,
  onDelete
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      name: `field_${Date.now()}`,
      type: 'text',
      required: false,
      columnSpan: 1
    };

    const updatedFields = [...(rowGroup.rowGroup || []), newField];
    if (updatedFields.length <= 3) {
      onUpdate({ rowGroup: updatedFields });
    }
  };

  const updateField = (fieldIndex: number, updates: Partial<FormField>) => {
    const updatedFields = rowGroup.rowGroup?.map((field, index) =>
      index === fieldIndex ? { ...field, ...updates } : field
    );
    onUpdate({ rowGroup: updatedFields });
  };

  const deleteField = (fieldIndex: number) => {
    const updatedFields = rowGroup.rowGroup?.filter((_, index) => index !== fieldIndex);
    onUpdate({ rowGroup: updatedFields });
  };

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Select' },
    { value: 'date', label: 'Date' }
  ];

  return (
    <Card className="border-l-4 border-purple-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          <div className="flex-1">
            <Input
              value={rowGroup.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Row Group Title"
              className="font-medium"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showSettings && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div>
              <Label htmlFor="maxRows">Max Rows</Label>
              <Input
                id="maxRows"
                type="number"
                value={rowGroup.maxRows || 10}
                onChange={(e) => onUpdate({ maxRows: parseInt(e.target.value) })}
                min="1"
                max="50"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="structuredInput"
                checked={rowGroup.isStructuredInput || false}
                onCheckedChange={(checked) => onUpdate({ isStructuredInput: checked })}
              />
              <Label htmlFor="structuredInput">Structured Input Mode</Label>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Row Fields</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={addField}
              disabled={(rowGroup.rowGroup?.length || 0) >= 3}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Field ({rowGroup.rowGroup?.length || 0}/3)
            </Button>
          </div>

          {rowGroup.rowGroup?.map((field, fieldIndex) => (
            <Card key={field.id} className="border">
              <CardContent className="p-3">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(fieldIndex, { label: e.target.value })}
                      placeholder="Label"
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Select 
                      value={field.type} 
                      onValueChange={(value) => updateField(fieldIndex, { type: value })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(fieldIndex, { placeholder: e.target.value })}
                      placeholder="Placeholder"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="col-span-2 flex gap-1">
                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={field.required || false}
                        onCheckedChange={(checked) => updateField(fieldIndex, { required: checked })}
                        className="scale-75"
                      />
                      <span className="text-xs">Req</span>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center space-x-1">
                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={field.readonly || false}
                        onCheckedChange={(checked) => updateField(fieldIndex, { readonly: checked })}
                        className="scale-75"
                      />
                      <span className="text-xs">RO</span>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteField(fieldIndex)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {field.type === 'select' && (
                  <div className="mt-2">
                    <Label className="text-xs">Options (comma-separated)</Label>
                    <Input
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => updateField(fieldIndex, { 
                        options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                      })}
                      placeholder="Option 1, Option 2, Option 3"
                      className="h-7 text-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {(!rowGroup.rowGroup || rowGroup.rowGroup.length === 0) && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              <p className="mb-2">No fields in this row group</p>
              <Button variant="outline" size="sm" onClick={addField}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Field
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
