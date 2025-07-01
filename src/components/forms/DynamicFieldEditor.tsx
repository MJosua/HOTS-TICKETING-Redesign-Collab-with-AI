
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, RefreshCw, Info } from 'lucide-react';
import { FormField, RowGroup } from '@/types/formTypes';
import { getMaxFormFields } from '@/utils/formFieldMapping';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DynamicFieldEditorProps {
  fields: FormField[];
  onUpdate: (fields: FormField[]) => void;
  rowGroups?: RowGroup[];
  onUpdateRowGroups?: (rowGroups: RowGroup[]) => void;
}

export const DynamicFieldEditor: React.FC<DynamicFieldEditorProps> = ({
  fields,
  onUpdate,
  rowGroups = [],
  onUpdateRowGroups
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const generateFieldName = (label: string) => {
    return label.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
  };

  const addField = () => {
    if (fields.length >= getMaxFormFields()) {
      return; // Prevent adding more fields than supported
    }

    const newField: FormField = {
      label: 'New Field',
      name: 'new_field',
      type: 'text',
      required: false,
      columnSpan: 1
    };
    onUpdate([...fields, newField]);
  };

  const addRowGroup = () => {
    if (!onUpdateRowGroups) return;

    const newRowGroup: RowGroup = {
      isStructuredInput: true,
      maxRows: 10,
      structure: {
        firstColumn: {
          label: "Item Name",
          name: "item_name",
          type: "text",
          placeholder: "Enter item name"
        },
        secondColumn: {
          label: "Quantity",
          name: "quantity",
          type: "number",
          placeholder: "Enter quantity"
        },
        thirdColumn: {
          label: "Unit",
          name: "unit",
          type: "select",
          options: ["pcs", "kg", "liter", "box"],
          placeholder: "Select unit"
        }
      },
      rowGroup: []
    };
    onUpdateRowGroups([...rowGroups, newRowGroup]);
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const removeRowGroup = (index: number) => {
    if (!onUpdateRowGroups) return;
    const updated = rowGroups.filter((_, i) => i !== index);
    onUpdateRowGroups(updated);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newFields.length) {
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      onUpdate(newFields);
    }
  };

  const updateField = (index: number, updatedField: FormField) => {
    const updated = [...fields];
    updated[index] = updatedField;
    onUpdate(updated);
  };

  const updateRowGroup = (index: number, updatedRowGroup: RowGroup) => {
    if (!onUpdateRowGroups) return;
    const updated = [...rowGroups];
    updated[index] = updatedRowGroup;
    onUpdateRowGroups(updated);
  };

  const validateFieldName = (name: string, currentIndex: number) => {
    return !fields.some((field, index) =>
      index !== currentIndex && field.name === name
    );
  };

  const renderFieldsPreview = () => {
    let currentRow: FormField[] = [];
    let currentRowSpan = 0;
    const rows: FormField[][] = [];

    fields.forEach(field => {
      const span = field.columnSpan || 1;

      if (currentRowSpan + span > 3) {
        if (currentRow.length > 0) {
          rows.push([...currentRow]);
        }
        currentRow = [field];
        currentRowSpan = span;
      } else {
        currentRow.push(field);
        currentRowSpan += span;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return (
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium mb-3">Form Layout Preview & Database Mapping</h4>
        <div className="space-y-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-3 gap-2">
              {row.map((field, fieldIndex) => {
                const globalFieldIndex = fields.indexOf(field);
                const cstmCol = `cstm_col${globalFieldIndex + 1}`;
                const lblCol = `lbl_col${globalFieldIndex + 1}`;

                return (
                  <div
                    key={fieldIndex}
                    className={`p-2 bg-blue-100 border border-blue-300 rounded text-xs col-span-${field.columnSpan || 3}`}
                  >
                    <div className="font-medium text-center">{field.label}</div>
                    <div className="text-center text-blue-600 mt-1">
                      {cstmCol} → {lblCol}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-600 mt-2">
          Fields will be stored as cstm_colX (value) and lbl_colX (label) in the database
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Form Configuration</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onUpdate([...fields])}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={addField}
            disabled={fields.length >= getMaxFormFields()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Field ({fields.length}/{getMaxFormFields()})
          </Button>
          {onUpdateRowGroups && (
            <Button size="sm" variant="outline" onClick={addRowGroup}>
              <Plus className="w-4 h-4 mr-2" />
              Add Row Group
            </Button>
          )}
        </div>
      </div>

      {renderFieldsPreview()}

      {/* Regular Fields */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Dynamic Fields</h4>
        {fields.map((field, index) => (
          <FieldEditor
            key={index}
            field={field}
            index={index}
            fields={fields}
            onUpdate={(updatedField) => updateField(index, updatedField)}
            onRemove={() => removeField(index)}
            onMoveUp={() => moveField(index, 'up')}
            onMoveDown={() => moveField(index, 'down')}
            canMoveUp={index > 0}
            canMoveDown={index < fields.length - 1}
            validateFieldName={validateFieldName}
            generateFieldName={generateFieldName}
          />
        ))}
      </div>

      {/* Structured Row Groups */}
      {onUpdateRowGroups && (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Structured Row Groups</h4>
          {rowGroups.map((rowGroup, index) => (
            <RowGroupEditor
              key={index}
              rowGroup={rowGroup}
              index={index}
              onUpdate={(updatedRowGroup) => updateRowGroup(index, updatedRowGroup)}
              onRemove={() => removeRowGroup(index)}
            />
          ))}
        </div>
      )}

      {fields.length === 0 && rowGroups.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-muted-foreground mb-4">No fields or row groups created yet</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={addField}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Field
            </Button>
            {onUpdateRowGroups && (
              <Button variant="outline" onClick={addRowGroup}>
                <Plus className="w-4 h-4 mr-2" />
                Create Row Group
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface FieldEditorProps {
  field: FormField;
  index: number;
  onUpdate: (field: FormField) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  validateFieldName: (name: string, index: number) => boolean;
  generateFieldName: (label: string) => string;
  fields: FormField[];
}

const SystemVariableHelper = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm">
        <Info className="w-3 h-3 mr-1" />
        System Variables
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="space-y-2">
        <h4 className="font-medium">Available System Variables:</h4>
        <div className="text-sm space-y-1">
          <div><code className="bg-gray-100 px-1 rounded">${'{user}'}</code> - Current user name</div>
          <div><code className="bg-gray-100 px-1 rounded">${'{user.email}'}</code> - User email</div>
          <div><code className="bg-gray-100 px-1 rounded">${'{user.department}'}</code> - User department</div>
          <div><code className="bg-gray-100 px-1 rounded">${'{user.division}'}</code> - User division</div>
          <div><code className="bg-gray-100 px-1 rounded">${'{departments}'}</code> - All departments (for select)</div>
          <div><code className="bg-gray-100 px-1 rounded">${'{divisions}'}</code> - All divisions (for select)</div>
          <div><code className="bg-gray-100 px-1 rounded">${'{superior}'}</code> - Superior users (for select)</div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  validateFieldName,
  generateFieldName,
  fields
}) => {
  const [nameError, setNameError] = useState<string>('');

  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const handleLabelChange = (label: string) => {
    const suggestedName = generateFieldName(label);
    updateField({
      label,
      name: suggestedName // Auto-generate name from label
    });
  };

  const handleNameChange = (name: string) => {
    if (!validateFieldName(name, index)) {
      setNameError('Field name must be unique');
    } else {
      setNameError('');
    }
    updateField({ name });
  };

  const getColumnSpanColor = (span: number) => {
    switch (span) {
      case 1: return 'border-blue-500';
      case 2: return 'border-green-500';
      case 3: return 'border-purple-500';
      default: return 'border-blue-500';
    }
  };

  return (
    <Card className={`p-4 border-l-4 ${getColumnSpanColor(field.columnSpan || 1)}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Field {index + 1} ({field.columnSpan || 1} column{(field.columnSpan || 1) > 1 ? 's' : ''})
            </span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={onMoveUp} disabled={!canMoveUp}>
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onMoveDown} disabled={!canMoveDown}>
              <ArrowDown className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onRemove}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`label-${index}`}>Label</Label>
            <Input
              id={`label-${index}`}
              value={field.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Field Label"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor={`default-${index}`}>Default Value</Label>
              <SystemVariableHelper />
            </div>
            <Input
              id={`default-${index}`}
              value={field.default || ''}
              onChange={(e) => updateField({ default: e.target.value })}
              placeholder="Default value or system variable (e.g., ${user})"
              className={nameError ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use system variables like ${'{user}'} for dynamic defaults
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Field Type</Label>
            <Select value={field.type} onValueChange={(value: FormField['type']) => updateField({ type: value })}>
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
              value={String(field.columnSpan || 1)}
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

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField({ required: e.target.checked })}
            />
            <Label>Required</Label>
          </div>
        </div>

        <div>
          <Label>Placeholder</Label>
          <Input
            value={field.placeholder || ''}
            onChange={(e) => updateField({ placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        {(field.type === 'select' || field.type === 'radio') && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Options</Label>
              <SystemVariableHelper />
            </div>
            <Textarea
              value={field.options?.join('\n') || ''}
              onChange={(e) => updateField({ options: e.target.value.split('\n').filter(o => o.trim()) })}
              placeholder="Enter options (one per line) or use system variables like ${departments}"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use system variables like ${'{departments}'} for dynamic options
            </p>
          </div>
        )}
        {field.type === 'suggestion-insert' && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Suggestions</Label>
              <SystemVariableHelper />
            </div>
            <Textarea
              value={field.suggestions?.join('\n') || ''}
              onChange={(e) => updateField({ suggestions: e.target.value.split('\n').filter(o => o.trim()) })}
              placeholder="Enter suggestions (one per line)"
              rows={3}
            />
          </div>
        )}
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            checked={field.readonly}
            onChange={(e) => updateField({ readonly: e.target.checked })}
          />
          <Label>readonly</Label>
        </div>
      </div>
    </Card>
  );
};

interface RowGroupEditorProps {
  rowGroup: RowGroup;
  index: number;
  onUpdate: (rowGroup: RowGroup) => void;
  onRemove: () => void;
}

const RowGroupEditor: React.FC<RowGroupEditorProps> = ({
  rowGroup,
  index,
  onUpdate,
  onRemove
}) => {
  const updateRowGroup = (updates: Partial<RowGroup>) => {
    onUpdate({ ...rowGroup, ...updates });
  };

  const updateStructureColumn = (column: 'firstColumn' | 'secondColumn' | 'thirdColumn', updates: any) => {
    onUpdate({
      ...rowGroup,
      structure: {
        ...rowGroup.structure,
        [column]: {
          ...rowGroup.structure?.[column],
          ...updates
        }
      }
    });
  };

  return (
    <Card className="p-4 border-l-4 border-orange-500">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Row Group {index + 1}</span>
          </div>
          <Button size="sm" variant="outline" onClick={onRemove}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Max Rows</Label>
            <Input
              type="number"
              value={rowGroup.maxRows || 10}
              onChange={(e) => updateRowGroup({ maxRows: parseInt(e.target.value) || 10 })}
              placeholder="Maximum number of rows"
            />
          </div>
          <div>
            <Label>Combination Mapping</Label>
            <Select
              value={rowGroup.structure?.combinedMapping || 'none'}
              onValueChange={(value) => updateRowGroup({
                structure: {
                  ...rowGroup.structure,
                  combinedMapping: value as 'second_third' | 'first_second' | 'none'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Combination</SelectItem>
                <SelectItem value="first_second">Combine 1st & 2nd</SelectItem>
                <SelectItem value="second_third">Combine 2nd & 3rd</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="text-sm font-medium">Column Structure</h5>

          {/* First Column */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-gray-50 rounded">
            <div>
              <Label className="text-xs">First Column Label</Label>
              <Input
                value={rowGroup.structure?.firstColumn?.label || ''}
                onChange={(e) => updateStructureColumn('firstColumn', { label: e.target.value })}
                placeholder="Column 1 Label"
              />
            </div>
            <div>
              <Label className="text-xs">Field Name</Label>
              <Input
                value={rowGroup.structure?.firstColumn?.name || ''}
                onChange={(e) => updateStructureColumn('firstColumn', { name: e.target.value })}
                placeholder="field_name"
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={rowGroup.structure?.firstColumn?.type || 'text'}
                onValueChange={(value: 'text' | 'number' | 'select') => updateStructureColumn('firstColumn', { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Column */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-gray-50 rounded">
            <div>
              <Label className="text-xs">Second Column Label</Label>
              <Input
                value={rowGroup.structure?.secondColumn?.label || ''}
                onChange={(e) => updateStructureColumn('secondColumn', { label: e.target.value })}
                placeholder="Column 2 Label"
              />
            </div>
            <div>
              <Label className="text-xs">Field Name</Label>
              <Input
                value={rowGroup.structure?.secondColumn?.name || ''}
                onChange={(e) => updateStructureColumn('secondColumn', { name: e.target.value })}
                placeholder="field_name"
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={rowGroup.structure?.secondColumn?.type || 'text'}
                onValueChange={(value: 'text' | 'number' | 'select') => updateStructureColumn('secondColumn', { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Third Column */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-gray-50 rounded">
            <div>
              <Label className="text-xs">Third Column Label</Label>
              <Input
                value={rowGroup.structure?.thirdColumn?.label || ''}
                onChange={(e) => updateStructureColumn('thirdColumn', { label: e.target.value })}
                placeholder="Column 3 Label"
              />
            </div>
            <div>
              <Label className="text-xs">Field Name</Label>
              <Input
                value={rowGroup.structure?.thirdColumn?.name || ''}
                onChange={(e) => updateStructureColumn('thirdColumn', { name: e.target.value })}
                placeholder="field_name"
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={rowGroup.structure?.thirdColumn?.type || 'text'}
                onValueChange={(value: 'text' | 'number' | 'select') => updateStructureColumn('thirdColumn', { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options for select fields */}
          {(rowGroup.structure?.firstColumn?.type === 'select' ||
            rowGroup.structure?.secondColumn?.type === 'select' ||
            rowGroup.structure?.thirdColumn?.type === 'select') && (
              <div className="space-y-2">
                <Label className="text-xs">Select Options (for select type columns)</Label>
                {rowGroup.structure?.firstColumn?.type === 'select' && (
                  <Textarea
                    placeholder="First column options (one per line)"
                    value={rowGroup.structure?.firstColumn?.options?.join('\n') || ''}
                    onChange={(e) => updateStructureColumn('firstColumn', {
                      options: e.target.value.split('\n').filter(o => o.trim())
                    })}
                    rows={2}
                  />
                )}
                {rowGroup.structure?.secondColumn?.type === 'select' && (
                  <Textarea
                    placeholder="Second column options (one per line)"
                    value={rowGroup.structure?.secondColumn?.options?.join('\n') || ''}
                    onChange={(e) => updateStructureColumn('secondColumn', {
                      options: e.target.value.split('\n').filter(o => o.trim())
                    })}
                    rows={2}
                  />
                )}
                {rowGroup.structure?.thirdColumn?.type === 'select' && (
                  <Textarea
                    placeholder="Third column options (one per line)"
                    value={rowGroup.structure?.thirdColumn?.options?.join('\n') || ''}
                    onChange={(e) => updateStructureColumn('thirdColumn', {
                      options: e.target.value.split('\n').filter(o => o.trim())
                    })}
                    rows={2}
                  />
                )}
              </div>
            )}
        </div>
      </div>
    </Card>
  );
};
