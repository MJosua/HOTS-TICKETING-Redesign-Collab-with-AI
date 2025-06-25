
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormSection, FormField, RowGroup } from '@/types/formTypes';
import { FieldBuilder } from './FieldBuilder';
import { RowGroupBuilder } from './RowGroupBuilder';
import { Plus, Trash2, Settings } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';

interface SectionBuilderProps {
  section: FormSection;
  onUpdateSection: (updates: Partial<FormSection>) => void;
  onDeleteSection: () => void;
  onAddField: (field: FormField) => void;
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
  onDeleteField: (fieldId: string) => void;
  onAddRowGroup: (rowGroup: RowGroup) => void;
}

export const SectionBuilder: React.FC<SectionBuilderProps> = ({
  section,
  onUpdateSection,
  onDeleteSection,
  onAddField,
  onUpdateField,
  onDeleteField,
  onAddRowGroup
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const addBasicField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      name: `field_${Date.now()}`,
      type: 'text',
      required: false,
      columnSpan: 1
    };
    onAddField(newField);
  };

  const addRowGroup = () => {
    const newRowGroup: RowGroup = {
      id: `rowgroup-${Date.now()}`,
      title: 'New Row Group',
      rowGroup: [
        {
          id: `field-${Date.now()}-1`,
          label: 'Item Name',
          name: 'item_name',
          type: 'text',
          required: true,
          columnSpan: 1
        },
        {
          id: `field-${Date.now()}-2`,
          label: 'Quantity',
          name: 'quantity',
          type: 'number',
          required: true,
          columnSpan: 1
        }
      ],
      maxRows: 10
    };
    onAddRowGroup(newRowGroup);
  };

  return (
    <div className="space-y-4">
      {/* Section Settings */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteSection}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Section
        </Button>
      </div>

      {showSettings && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={section.description || ''}
              onChange={(e) => onUpdateSection({ description: e.target.value })}
              placeholder="Optional section description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="collapsible"
                checked={section.collapsible || false}
                onCheckedChange={(checked) => onUpdateSection({ collapsible: checked })}
              />
              <Label htmlFor="collapsible">Collapsible</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="repeatable"
                checked={section.repeatable || false}
                onCheckedChange={(checked) => onUpdateSection({ repeatable: checked })}
              />
              <Label htmlFor="repeatable">Repeatable</Label>
            </div>
          </div>

          {section.condition !== undefined && (
            <div>
              <Label htmlFor="condition">Display Condition</Label>
              <Input
                id="condition"
                value={section.condition || ''}
                onChange={(e) => onUpdateSection({ condition: e.target.value })}
                placeholder="e.g., ${user.role} === 'admin'"
              />
            </div>
          )}
        </div>
      )}

      {/* Add Field/Row Group Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addBasicField}>
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
        <Button variant="outline" size="sm" onClick={addRowGroup}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row Group
        </Button>
      </div>

      {/* Fields */}
      {section.fields && section.fields.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Fields</h4>
          <Droppable droppableId={`fields-${section.id}`} type="FIELD">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {section.fields.map((field, index) => (
                  <FieldBuilder
                    key={field.id}
                    field={field}
                    index={index}
                    onUpdate={(updates) => onUpdateField(field.id!, updates)}
                    onDelete={() => onDeleteField(field.id!)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}

      {/* Row Groups */}
      {section.rowGroups && section.rowGroups.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Row Groups</h4>
          {section.rowGroups.map((rowGroup) => (
            <RowGroupBuilder
              key={rowGroup.id}
              rowGroup={rowGroup}
              onUpdate={(updates) => {
                const updatedRowGroups = section.rowGroups?.map(rg =>
                  rg.id === rowGroup.id ? { ...rg, ...updates } : rg
                );
                onUpdateSection({ rowGroups: updatedRowGroups });
              }}
              onDelete={() => {
                const updatedRowGroups = section.rowGroups?.filter(rg => rg.id !== rowGroup.id);
                onUpdateSection({ rowGroups: updatedRowGroups });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
