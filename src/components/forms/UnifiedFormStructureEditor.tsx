
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Edit3, Folder, FileText, Grid3x3 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FormField, RowGroup } from '@/types/formTypes';
import { FieldEditor } from './FieldEditor';

export type FormStructureItem = {
  id: string;
  type: 'field' | 'section' | 'rowgroup';
  data: FormField | SectionData | RowGroup;
  order: number;
};

export type SectionData = {
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultOpen?: boolean;
};

interface UnifiedFormStructureEditorProps {
  items: FormStructureItem[];
  onUpdate: (items: FormStructureItem[]) => void;
}

export const UnifiedFormStructureEditor: React.FC<UnifiedFormStructureEditorProps> = ({ 
  items, 
  onUpdate 
}) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<FormStructureItem[]>(items);

  // Update preview items when items prop changes
  React.useEffect(() => {
    setPreviewItems(items);
  }, [items]);

  const addField = () => {
    const newItem: FormStructureItem = {
      id: `field-${Date.now()}`,
      type: 'field',
      order: items.length,
      data: {
        label: 'New Field',
        name: `field_${Date.now()}`,
        type: 'text',
        required: false,
        columnSpan: 1
      }
    };
    const updatedItems = [...items, newItem];
    onUpdate(updatedItems);
  };

  const addSection = () => {
    const newItem: FormStructureItem = {
      id: `section-${Date.now()}`,
      type: 'section',
      order: items.length,
      data: {
        title: 'New Section',
        description: '',
        fields: [],
        collapsible: false,
        defaultOpen: true
      }
    };
    const updatedItems = [...items, newItem];
    onUpdate(updatedItems);
  };

  const addRowGroup = () => {
    const newItem: FormStructureItem = {
      id: `rowgroup-${Date.now()}`,
      type: 'rowgroup',
      order: items.length,
      data: {
        title: 'New Row Group',
        isStructuredInput: true,
        maxRows: 5,
        rowGroup: [],
        structure: {
          firstColumn: {
            label: 'Item',
            placeholder: 'Enter item name',
            type: 'text'
          },
          secondColumn: {
            label: 'Quantity',
            placeholder: 'Enter quantity',
            type: 'number'
          },
          thirdColumn: {
            label: 'Notes',
            placeholder: 'Enter notes',
            type: 'text'
          },
          combinedMapping: 'none'
        }
      }
    };
    const updatedItems = [...items, newItem];
    onUpdate(updatedItems);
  };

  const updateItem = (id: string, updatedData: any) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, data: updatedData } : item
    );
    onUpdate(updatedItems);
    setEditingItem(null);
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    onUpdate(updatedItems);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);
    
    // Update order numbers
    const reorderedWithOrder = newItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    // Update both preview and actual items
    setPreviewItems(reorderedWithOrder);
    onUpdate(reorderedWithOrder);
  };

  const onPreviewDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newPreviewItems = Array.from(previewItems);
    const [reorderedItem] = newPreviewItems.splice(sourceIndex, 1);
    newPreviewItems.splice(destinationIndex, 0, reorderedItem);
    
    // Update order numbers
    const reorderedWithOrder = newPreviewItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setPreviewItems(reorderedWithOrder);
    onUpdate(reorderedWithOrder);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'field':
        return <FileText className="w-4 h-4" />;
      case 'section':
        return <Folder className="w-4 h-4" />;
      case 'rowgroup':
        return <Grid3x3 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'field':
        return 'border-l-blue-500 bg-blue-50';
      case 'section':
        return 'border-l-green-500 bg-green-50';
      case 'rowgroup':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const renderFormPreview = () => {
    let fieldCounter = 1;
    
    return (
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h4 className="text-sm font-medium mb-3 text-gray-700">Form Layout Preview & Database Mapping</h4>
        <DragDropContext onDragEnd={onPreviewDragEnd}>
          <Droppable droppableId="preview-structure">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {previewItems.map((item, index) => {
                  const currentFieldCounter = fieldCounter;
                  
                  if (item.type === 'field') {
                    const field = item.data as FormField;
                    const cstmCol = `cstm_col${fieldCounter}`;
                    const lblCol = `lbl_col${fieldCounter}`;
                    fieldCounter++;
                    
                    return (
                      <Draggable key={item.id} draggableId={`preview-${item.id}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-2 bg-blue-100 border border-blue-300 rounded text-xs cursor-move hover:shadow-md transition-shadow grid ${
                              field.columnSpan === 2 ? 'col-span-2' : field.columnSpan === 3 ? 'col-span-3' : 'col-span-1'
                            } grid-cols-${field.columnSpan || 1}`}
                          >
                            <div className="font-medium text-gray-700">{field.label}</div>
                            <div className="text-blue-600 mt-1">{cstmCol} → {lblCol}</div>
                            <div className="text-xs text-gray-500">Span: {field.columnSpan || 1} column{(field.columnSpan || 1) > 1 ? 's' : ''}</div>
                          </div>
                        )}
                      </Draggable>
                    );
                  } else if (item.type === 'section') {
                    const section = item.data as SectionData;
                    return (
                      <Draggable key={item.id} draggableId={`preview-${item.id}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 bg-green-100 border border-green-300 rounded cursor-move hover:shadow-md transition-shadow col-span-3"
                          >
                            <div className="font-medium text-sm mb-2 text-gray-700">📁 {section.title}</div>
                            <div className="text-xs text-green-600">Section (spans 3 columns)</div>
                            <div className="space-y-1 mt-2">
                              {section.fields.map((field, fieldIndex) => {
                                const cstmCol = `cstm_col${fieldCounter}`;
                                const lblCol = `lbl_col${fieldCounter}`;
                                fieldCounter++;
                                return (
                                  <div key={fieldIndex} className="p-1 bg-green-200 rounded text-xs">
                                    <span className="font-medium text-gray-700">{field.label}</span>
                                    <span className="text-green-700 ml-2">{cstmCol} → {lblCol}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  } else if (item.type === 'rowgroup') {
                    const rowGroup = item.data as RowGroup;
                    const cstmCol = `cstm_col${fieldCounter}`;
                    const lblCol = `lbl_col${fieldCounter}`;
                    fieldCounter++;
                    
                    return (
                      <Draggable key={item.id} draggableId={`preview-${item.id}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-2 bg-purple-100 border border-purple-300 rounded text-xs cursor-move hover:shadow-md transition-shadow"
                          >
                            <div className="font-medium text-gray-700">🗂️ {rowGroup.title || 'Row Group'}</div>
                            <div className="text-purple-600 mt-1">{cstmCol} → {lblCol} (Dynamic Rows)</div>
                            <div className="text-xs text-gray-500">Max rows: {rowGroup.maxRows || 5}</div>
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                  return null;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <div className="text-xs text-gray-600 mt-3 pt-2 border-t border-gray-200">
          Total database columns used: {fieldCounter - 1}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Form Structure</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={addField} className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Field
          </Button>
          <Button size="sm" variant="outline" onClick={addSection} className="flex items-center gap-1">
            <Folder className="w-4 h-4" />
            Section
          </Button>
          <Button size="sm" variant="outline" onClick={addRowGroup} className="flex items-center gap-1">
            <Grid3x3 className="w-4 h-4" />
            Row Group
          </Button>
        </div>
      </div>

      {renderFormPreview()}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="form-structure">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`border-l-4 ${getItemColor(item.type)}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div {...provided.dragHandleProps} className="cursor-move">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="flex items-center gap-2">
                              {getItemIcon(item.type)}
                              <span className="text-sm font-medium capitalize text-gray-700">
                                {item.type} {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {editingItem === item.id && (
                        <CardContent>
                          {item.type === 'field' && (
                            <FieldEditor
                              field={item.data as FormField}
                              onUpdate={(updatedField) => updateItem(item.id, updatedField)}
                              onCancel={() => setEditingItem(null)}
                            />
                          )}
                          
                          {item.type === 'section' && (
                            <SectionEditor
                              section={item.data as SectionData}
                              onUpdate={(updatedSection) => updateItem(item.id, updatedSection)}
                            />
                          )}
                          
                          {item.type === 'rowgroup' && (
                            <RowGroupEditor
                              rowGroup={item.data as RowGroup}
                              onUpdate={(updatedRowGroup) => updateItem(item.id, updatedRowGroup)}
                            />
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {items.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">No form elements created yet</p>
          <div className="flex justify-center gap-2">
            <Button onClick={addField}>
              <FileText className="w-4 h-4 mr-2" />
              Add Field
            </Button>
            <Button variant="outline" onClick={addSection}>
              <Folder className="w-4 h-4 mr-2" />
              Add Section
            </Button>
            <Button variant="outline" onClick={addRowGroup}>
              <Grid3x3 className="w-4 h-4 mr-2" />
              Add Row Group
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual editors for each type
const SectionEditor: React.FC<{
  section: SectionData;
  onUpdate: (section: SectionData) => void;
}> = ({ section, onUpdate }) => {
  const updateSection = (updates: Partial<SectionData>) => {
    onUpdate({ ...section, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Section Title</Label>
          <Input
            value={section.title}
            onChange={(e) => updateSection({ title: e.target.value })}
            placeholder="Section title"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={section.collapsible || false}
            onCheckedChange={(checked) => updateSection({ collapsible: checked })}
          />
          <Label>Collapsible</Label>
        </div>
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={section.description || ''}
          onChange={(e) => updateSection({ description: e.target.value })}
          placeholder="Section description (optional)"
        />
      </div>
    </div>
  );
};

const RowGroupEditor: React.FC<{
  rowGroup: RowGroup;
  onUpdate: (rowGroup: RowGroup) => void;
}> = ({ rowGroup, onUpdate }) => {
  const updateRowGroup = (updates: Partial<RowGroup>) => {
    onUpdate({ ...rowGroup, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Row Group Title</Label>
          <Input
            value={rowGroup.title || ''}
            onChange={(e) => updateRowGroup({ title: e.target.value })}
            placeholder="Row group title"
          />
        </div>
        <div>
          <Label>Max Rows</Label>
          <Input
            type="number"
            value={rowGroup.maxRows || 5}
            onChange={(e) => updateRowGroup({ maxRows: parseInt(e.target.value) })}
            min="1"
          />
        </div>
      </div>

      {rowGroup.structure && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Column Configuration</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>First Column</Label>
              <Input
                value={rowGroup.structure.firstColumn.label}
                onChange={(e) => updateRowGroup({
                  structure: {
                    ...rowGroup.structure!,
                    firstColumn: { ...rowGroup.structure!.firstColumn, label: e.target.value }
                  }
                })}
                placeholder="Column label"
              />
            </div>
            <div>
              <Label>Second Column</Label>
              <Input
                value={rowGroup.structure.secondColumn.label}
                onChange={(e) => updateRowGroup({
                  structure: {
                    ...rowGroup.structure!,
                    secondColumn: { ...rowGroup.structure!.secondColumn, label: e.target.value }
                  }
                })}
                placeholder="Column label"
              />
            </div>
            <div>
              <Label>Third Column</Label>
              <Input
                value={rowGroup.structure.thirdColumn.label}
                onChange={(e) => updateRowGroup({
                  structure: {
                    ...rowGroup.structure!,
                    thirdColumn: { ...rowGroup.structure!.thirdColumn, label: e.target.value }
                  }
                })}
                placeholder="Column label"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
