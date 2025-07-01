
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Settings, Save, X } from 'lucide-react';
import { RowGroup, FormField } from '@/types/formTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface RowGroupConfiguratorProps {
  rowGroup: RowGroup;
  onUpdate: (rowGroup: RowGroup) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RowGroupConfigurator: React.FC<RowGroupConfiguratorProps> = ({
  rowGroup,
  onUpdate,
  isOpen,
  onOpenChange
}) => {
  const [localRowGroup, setLocalRowGroup] = useState<RowGroup>(rowGroup);

  const updateRowGroup = (updates: Partial<RowGroup>) => {
    setLocalRowGroup(prev => ({ ...prev, ...updates }));
  };

  const addFieldToRowGroup = () => {
    const newField: FormField = {
      label: 'New Row Field',
      name: `row_field_${Date.now()}`,
      type: 'text',
      required: false,
      columnSpan: 1
    };

    const updatedFields = Array.isArray(localRowGroup.rowGroup) 
      ? [...localRowGroup.rowGroup, newField]
      : [newField];

    updateRowGroup({ rowGroup: updatedFields });
  };

  const removeFieldFromRowGroup = (index: number) => {
    if (Array.isArray(localRowGroup.rowGroup)) {
      const updatedFields = localRowGroup.rowGroup.filter((_, i) => i !== index);
      updateRowGroup({ rowGroup: updatedFields });
    }
  };

  const updateRowGroupField = (index: number, updatedField: FormField) => {
    if (Array.isArray(localRowGroup.rowGroup)) {
      const updatedFields = [...localRowGroup.rowGroup];
      updatedFields[index] = updatedField;
      updateRowGroup({ rowGroup: updatedFields });
    }
  };

  const handleSave = () => {
    onUpdate(localRowGroup);
    onOpenChange(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !Array.isArray(localRowGroup.rowGroup)) return;

    const fields = [...localRowGroup.rowGroup];
    const [reorderedField] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, reorderedField);

    updateRowGroup({ rowGroup: fields });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configure Row Group: {localRowGroup.title || 'Untitled'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Configuration */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-800">Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Row Group Title</Label>
                  <Input
                    value={localRowGroup.title || ''}
                    onChange={(e) => updateRowGroup({ title: e.target.value })}
                    placeholder="e.g., Item List, Requirements"
                  />
                </div>
                <div>
                  <Label>Maximum Rows</Label>
                  <Input
                    type="number"
                    value={localRowGroup.maxRows || 10}
                    onChange={(e) => updateRowGroup({ maxRows: parseInt(e.target.value) || 10 })}
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={localRowGroup.isStructuredInput || false}
                  onCheckedChange={(checked) => updateRowGroup({ isStructuredInput: checked })}
                />
                <Label>Use Structured Input (3-column layout)</Label>
              </div>

              {localRowGroup.isStructuredInput && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Structured Input Mode:</strong> Creates a predefined 3-column table layout
                  </p>
                  <p className="text-xs text-blue-600">
                    Configure column structure below, or disable this to create custom field arrangements
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Row Group Fields Configuration */}
          {!localRowGroup.isStructuredInput && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-purple-800 flex items-center justify-between">
                  Row Group Fields ({Array.isArray(localRowGroup.rowGroup) ? localRowGroup.rowGroup.length : 0})
                  <Button variant="outline" size="sm" onClick={addFieldToRowGroup}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Field
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(localRowGroup.rowGroup) && localRowGroup.rowGroup.length > 0 ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="rowgroup-fields">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                          {localRowGroup.rowGroup.map((field: FormField, index: number) => (
                            <Draggable key={`field-${index}`} draggableId={`field-${index}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-3 bg-white border rounded-lg ${
                                    snapshot.isDragging ? 'shadow-lg border-purple-400' : 'border-purple-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                    </div>
                                    
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                                      <div>
                                        <Label className="text-xs">Field Label</Label>
                                        <Input
                                          value={field.label}
                                          onChange={(e) => updateRowGroupField(index, { ...field, label: e.target.value })}
                                          placeholder="Field Label"
                                          className="h-8"
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label className="text-xs">Field Name</Label>
                                        <Input
                                          value={field.name}
                                          onChange={(e) => updateRowGroupField(index, { ...field, name: e.target.value })}
                                          placeholder="field_name"
                                          className="h-8"
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label className="text-xs">Field Type</Label>
                                        <Select
                                          value={field.type}
                                          onValueChange={(value: FormField['type']) => 
                                            updateRowGroupField(index, { ...field, type: value })
                                          }
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="select">Select</SelectItem>
                                            <SelectItem value="date">Date</SelectItem>
                                            <SelectItem value="textarea">Textarea</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-xs">Column Span</Label>
                                        <Select
                                          value={String(field.columnSpan || 1)}
                                          onValueChange={(value) => 
                                            updateRowGroupField(index, { ...field, columnSpan: Number(value) as 1 | 2 | 3 })
                                          }
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1">1 Col</SelectItem>
                                            <SelectItem value="2">2 Col</SelectItem>
                                            <SelectItem value="3">3 Col</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFieldFromRowGroup(index)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {field.type === 'select' && (
                                    <div className="mt-3">
                                      <Label className="text-xs">Options (one per line)</Label>
                                      <Textarea
                                        value={field.options?.join('\n') || ''}
                                        onChange={(e) => updateRowGroupField(index, {
                                          ...field,
                                          options: e.target.value.split('\n').filter(Boolean)
                                        })}
                                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                                        className="h-16"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-purple-300 rounded-lg">
                    <p className="text-purple-600 mb-2">No fields in this row group</p>
                    <Button variant="outline" onClick={addFieldToRowGroup}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Field
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Structured Input Configuration */}
          {localRowGroup.isStructuredInput && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-800">3-Column Structure Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* First Column */}
                <div className="p-3 bg-white rounded border">
                  <Label className="text-sm font-medium">First Column</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <Input
                      placeholder="Column Label"
                      value={localRowGroup.structure?.firstColumn?.label || ''}
                      onChange={(e) => updateRowGroup({
                        structure: {
                          ...localRowGroup.structure,
                          firstColumn: {
                            ...localRowGroup.structure?.firstColumn,
                            label: e.target.value
                          }
                        }
                      })}
                    />
                    <Input
                      placeholder="field_name"
                      value={localRowGroup.structure?.firstColumn?.name || ''}
                      onChange={(e) => updateRowGroup({
                        structure: {
                          ...localRowGroup.structure,
                          firstColumn: {
                            ...localRowGroup.structure?.firstColumn,
                            name: e.target.value
                          }
                        }
                      })}
                    />
                    <Select
                      value={localRowGroup.structure?.firstColumn?.type || 'text'}
                      onValueChange={(value: 'text' | 'number' | 'select') => updateRowGroup({
                        structure: {
                          ...localRowGroup.structure,
                          firstColumn: {
                            ...localRowGroup.structure?.firstColumn,
                            type: value
                          }
                        }
                      })}
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
                <div className="p-3 bg-white rounded border">
                  <Label className="text-sm font-medium">Second Column</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <Input
                      placeholder="Column Label"
                      value={localRowGroup.structure?.secondColumn?.label || ''}
                      onChange={(e) => updateRowGroup({
                        structure: {
                          ...localRowGroup.structure,
                          secondColumn: {
                            ...localRowGroup.structure?.secondColumn,
                            label: e.target.value
                          }
                        }
                      })}
                    />
                    <Input
                      placeholder="field_name"
                      value={localRowGroup.structure?.secondColumn?.name || ''}
                      onChange={(e) => updateRowGroup({
                        structure: {
                          ...localRowGroup.structure,
                          secondColumn: {
                            ...localRowGroup.structure?.secondColumn,
                            name: e.target.value
                          }
                        }
                      })}
                    />
                    <Select
                      value={localRowGroup.structure?.secondColumn?.type || 'text'}
                      onValueChange={(value: 'text' | 'number' | 'select') => updateRowGroup({
                        structure: {
                          ...localRowGroup.structure,
                          secondColumn: {
                            ...localRowGroup.structure?.secondColumn,
                            type: value
                          }
                        }
                      })}
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
                <div className="p-3 bg-white rounded border">
                  <Label className="text-sm font-medium">Third Column</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <Input
                      placeholder="Column Label"
                      value={localRowGroup.structure?.thirdColumn?.label || ''}
                      onChange={(e) => updateRowGroup({
                        structure: {
                          ...localRowGroup.structure,
                          thirdColumn: {
                            ...localRowGroup.structure?.thirdColumn,
                            label: e.target.value
                          }
                        }
                      })}
                    />
                    <Input
                      placeholder="field_name"
                      value={localRowGroup.structure?.thirdColumn?.name || ''}
                      onChange={(e) => updateRowGroup({
                        structure: {
                          ...localRowGroup.structure,
                          thirdColumn: {
                            ...localRowGroup.structure?.thirdColumn,
                            name: e.target.value
                          }
                        }
                      })}
                    />
                    <Select
                      value={localRowGroup.structure?.thirdColumn?.type || 'text'}
                      onValueChange={(value: 'text' | 'number' | 'select') => updateRowGroup({
                        structure: {
                          ...localRowGroup.structure,
                          thirdColumn: {
                            ...localRowGroup.structure?.thirdColumn,
                            type: value
                          }
                        }
                      })}
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
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
