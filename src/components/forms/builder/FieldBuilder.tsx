
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/types/formTypes';
import { GripVertical, Trash2, Settings } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';

interface FieldBuilderProps {
  field: FormField;
  index: number;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
}

export const FieldBuilder: React.FC<FieldBuilderProps> = ({
  field,
  index,
  onUpdate,
  onDelete
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'select', label: 'Select' },
    { value: 'file', label: 'File Upload' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' }
  ];

  return (
    <Draggable draggableId={field.id!} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`transition-shadow ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <Card className="border-l-4 border-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div {...provided.dragHandleProps} className="cursor-grab">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <Input
                    value={field.label}
                    onChange={(e) => onUpdate({ label: e.target.value })}
                    placeholder="Field Label"
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

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs">Field Type</Label>
                  <Select value={field.type} onValueChange={(value) => onUpdate({ type: value })}>
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

                <div>
                  <Label className="text-xs">Column Span</Label>
                  <Select 
                    value={field.columnSpan?.toString() || '1'} 
                    onValueChange={(value) => onUpdate({ columnSpan: parseInt(value) as 1 | 2 | 3 })}
                  >
                    <SelectTrigger className="h-8">
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

              <div className="flex gap-4 mb-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`required-${field.id}`}
                    checked={field.required || false}
                    onCheckedChange={(checked) => onUpdate({ required: checked })}
                  />
                  <Label htmlFor={`required-${field.id}`} className="text-xs">Required</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`readonly-${field.id}`}
                    checked={field.readonly || false}
                    onCheckedChange={(checked) => onUpdate({ readonly: checked })}
                  />
                  <Label htmlFor={`readonly-${field.id}`} className="text-xs">Read Only</Label>
                </div>
              </div>

              {showSettings && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <Label className="text-xs">Field Name</Label>
                    <Input
                      value={field.name}
                      onChange={(e) => onUpdate({ name: e.target.value })}
                      placeholder="field_name"
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => onUpdate({ placeholder: e.target.value })}
                      placeholder="Enter placeholder text"
                      className="h-8"
                    />
                  </div>

                  {field.type === 'select' && (
                    <div>
                      <Label className="text-xs">Options (one per line)</Label>
                      <Textarea
                        value={field.options?.join('\n') || ''}
                        onChange={(e) => onUpdate({ options: e.target.value.split('\n').filter(Boolean) })}
                        placeholder="Option 1&#13;Option 2&#13;Option 3"
                        rows={3}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-xs">Default Value</Label>
                    <Input
                      value={field.default || ''}
                      onChange={(e) => onUpdate({ default: e.target.value })}
                      placeholder="Default value"
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Help Note</Label>
                    <Input
                      value={field.note || ''}
                      onChange={(e) => onUpdate({ note: e.target.value })}
                      placeholder="Additional help text"
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">System Variable</Label>
                    <Input
                      value={field.systemVariable || ''}
                      onChange={(e) => onUpdate({ systemVariable: e.target.value })}
                      placeholder="e.g., ${user.name}"
                      className="h-8"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};
