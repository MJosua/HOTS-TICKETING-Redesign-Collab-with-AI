import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Settings, Save, X } from 'lucide-react';
import { RowGroup, RowData } from '@/types/formTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SYSTEM_VARIABLE_ENTRIES } from '@/utils/systemVariableDefinitions/systemVariableDefinitions';
import { Textarea } from '../ui/textarea';

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

  const addRowToRowGroup = () => {
    const newRow: RowData = {
      id: `row_${Date.now()}`,
      firstValue: '',
      secondValue: '',
      thirdValue: ''
    };

    const updatedRows = Array.isArray(localRowGroup.rowGroup)
      ? [...localRowGroup.rowGroup, newRow]
      : [newRow];

    updateRowGroup({ rowGroup: updatedRows });
  };

  const SystemVariableHelper = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7">
          <Info className="w-3 h-3 mr-1" />
          Variables
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-96 overflow-auto bg-white border shadow-lg z-50">
        <div className="space-y-2">
          <h4 className="font-medium">Available System Variables:</h4>
          <div className="text-sm space-y-1">
            {SYSTEM_VARIABLE_ENTRIES.map((entry) => (
              <div key={entry.key} className="p-2 hover:bg-gray-50 rounded">
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{entry.key}</code>
                <span className="ml-2 text-muted-foreground">{entry.description}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const removeRowFromRowGroup = (index: number) => {
    if (Array.isArray(localRowGroup.rowGroup)) {
      const updatedRows = localRowGroup.rowGroup.filter((_, i) => i !== index);
      updateRowGroup({ rowGroup: updatedRows });
    }
  };

  const updateRowData = (index: number, updatedRow: RowData) => {
    if (Array.isArray(localRowGroup.rowGroup)) {
      const updatedRows = [...localRowGroup.rowGroup];
      updatedRows[index] = updatedRow;
      updateRowGroup({ rowGroup: updatedRows });
    }
  };

  const handleSave = () => {
    onUpdate(localRowGroup);
    onOpenChange(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !Array.isArray(localRowGroup.rowGroup)) return;

    const rows = [...localRowGroup.rowGroup];
    const [reorderedRow] = rows.splice(result.source.index, 1);
    rows.splice(result.destination.index, 0, reorderedRow);

    updateRowGroup({ rowGroup: rows });
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

          {/* Row Data Configuration */}
          {!localRowGroup.isStructuredInput && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-purple-800 flex items-center justify-between">
                  Row Data ({Array.isArray(localRowGroup.rowGroup) ? localRowGroup.rowGroup.length : 0})
                  <Button variant="outline" size="sm" onClick={addRowToRowGroup}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Row
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(localRowGroup.rowGroup) && localRowGroup.rowGroup.length > 0 ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="rowgroup-rows">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                          {localRowGroup.rowGroup.map((row: RowData, index: number) => (
                            <Draggable key={`row-${index}`} draggableId={`row-${index}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-3 bg-white border rounded-lg ${snapshot.isDragging ? 'shadow-lg border-purple-400' : 'border-purple-200'
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div>
                                        <Label className="text-xs">First Value</Label>
                                        <Input
                                          value={row.firstValue}
                                          onChange={(e) => updateRowData(index, { ...row, firstValue: e.target.value })}
                                          placeholder="First column value"
                                          className="h-8"
                                        />
                                      </div>

                                      <div>
                                        <Label className="text-xs">Second Value</Label>
                                        <Input
                                          value={row.secondValue}
                                          onChange={(e) => updateRowData(index, { ...row, secondValue: e.target.value })}
                                          placeholder="Second column value"
                                          className="h-8"
                                        />
                                      </div>

                                      <div>
                                        <Label className="text-xs">Third Value</Label>
                                        <Input
                                          value={row.thirdValue}
                                          onChange={(e) => updateRowData(index, { ...row, thirdValue: e.target.value })}
                                          placeholder="Third column value"
                                          className="h-8"
                                        />
                                      </div>
                                    </div>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeRowFromRowGroup(index)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
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
                    <p className="text-purple-600 mb-2">No rows in this group</p>
                    <Button variant="outline" onClick={addRowToRowGroup}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Row
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
                      onValueChange={(value: 'text' | 'number' | 'select' | 'suggestion-insert') => updateRowGroup({
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
                        <SelectItem value="suggestion-insert">suggestion insert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    {console.log("localRowGroup", localRowGroup)}
                    {(localRowGroup.structure?.firstColumn?.type === 'select' || localRowGroup.structure?.firstColumn?.type === 'suggestion-insert') && (
                      <div>
                        <Label>Options (one per line)</Label>
                        <Textarea
                          value={
                            Array.isArray(localRowGroup.structure?.firstColumn?.options)
                              ? localRowGroup.structure.firstColumn.options
                                .flatMap(item => item.split(',').map(opt => opt.trim()))
                                .join('\n')
                              : ''
                          }
                          onChange={(e) =>
                            updateRowGroup({
                              structure: {
                                ...localRowGroup.structure,
                                firstColumn: {
                                  ...localRowGroup.structure?.firstColumn,
                                  options: e.target.value.split('\n').filter(line => line.trim() !== '')
                                }
                              }
                            })
                          }
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          className="min-h-[100px] bg-white"
                        />
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          <p>• Enter each option on a new line</p>
                          <p>• For JSON objects, enter valid JSON on each line</p>
                          <p>• System variables like ${'{factoryplants}'} will be resolved automatically</p>

                        </div>
                      </div>
                    )}
                    {/* {localRowGroup.structure?.firstColumn?.type === 'suggestion-insert' && (
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
                    )} */}
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
