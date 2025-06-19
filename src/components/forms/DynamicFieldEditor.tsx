import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { FormField } from '@/types/formTypes';
import { getMaxFormFields } from '@/utils/formFieldMapping';

interface DynamicFieldEditorProps {
  fields: FormField[];
  onUpdate: (fields: FormField[]) => void;
}

export const DynamicFieldEditor: React.FC<DynamicFieldEditorProps> = ({ fields, onUpdate }) => {
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

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    onUpdate(updated);
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
                    className={`p-2 bg-blue-100 border border-blue-300 rounded text-xs col-span-${field.columnSpan || 1}`}
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
        <h3 className="text-lg font-semibold">Form Fields</h3>
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
        </div>
      </div>

      {renderFieldsPreview()}

      {fields.map((field, index) => (
        <FieldEditor
          key={index}
          field={field}
          index={index}
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

      {fields.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <p className="text-muted-foreground mb-4">No fields created yet</p>
          <Button onClick={addField}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Field
          </Button>
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
}

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
  generateFieldName
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
    switch(span) {
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
            <Label htmlFor={`name-${index}`}>Field Name (API)</Label>
            <Input
              id={`name-${index}`}
              value={field.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="field_name"
              className={nameError ? 'border-red-500' : ''}
            />
            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
            <p className="text-xs text-gray-500 mt-1">Auto-generated from label, can be edited</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Field Type</Label>
            <Select value={field.type} onValueChange={(value) => updateField({ type: value })}>
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
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="toggle">Toggle</SelectItem>
                <SelectItem value="number">Number</SelectItem>
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
            <Label>Options</Label>
            <Textarea
              value={field.options?.join('\n') || ''}
              onChange={(e) => updateField({ options: e.target.value.split('\n').filter(o => o.trim()) })}
              placeholder="Enter options (one per line)"
              rows={3}
            />
          </div>
        )}
      </div>
    </Card>
  );
};
