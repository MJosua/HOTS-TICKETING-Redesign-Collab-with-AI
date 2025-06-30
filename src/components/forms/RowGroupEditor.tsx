
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Edit3 } from 'lucide-react';
import { RowGroup } from '@/types/formTypes';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface RowGroupEditorProps {
  rowGroups: RowGroup[];
  onUpdate: (rowGroups: RowGroup[]) => void;
}

export const RowGroupEditor: React.FC<RowGroupEditorProps> = ({ rowGroups, onUpdate }) => {
  const [editingGroup, setEditingGroup] = useState<number | null>(null);

  const addRowGroup = () => {
    const newRowGroup: RowGroup = {
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
    };
    onUpdate([...rowGroups, newRowGroup]);
  };

  const updateRowGroup = (index: number, updatedGroup: RowGroup) => {
    const newGroups = [...rowGroups];
    newGroups[index] = updatedGroup;
    onUpdate(newGroups);
  };

  const removeRowGroup = (index: number) => {
    const newGroups = rowGroups.filter((_, i) => i !== index);
    onUpdate(newGroups);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const newGroups = Array.from(rowGroups);
    const [reorderedGroup] = newGroups.splice(result.source.index, 1);
    newGroups.splice(result.destination.index, 0, reorderedGroup);
    onUpdate(newGroups);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Row Groups</h3>
        <Button onClick={addRowGroup} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Row Group
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="rowgroups">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {rowGroups.map((group, index) => (
                <Draggable key={`rowgroup-${index}`} draggableId={`rowgroup-${index}`} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border-2 border-dashed border-gray-200 hover:border-blue-300"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div {...provided.dragHandleProps} className="cursor-move">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>
                            <CardTitle className="text-sm">
                              {editingGroup === index ? (
                                <Input
                                  value={group.title || ''}
                                  onChange={(e) => updateRowGroup(index, { ...group, title: e.target.value })}
                                  onBlur={() => setEditingGroup(null)}
                                  onKeyDown={(e) => e.key === 'Enter' && setEditingGroup(null)}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  onClick={() => setEditingGroup(index)}
                                  className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                >
                                  {group.title || 'Untitled Row Group'}
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingGroup(index)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeRowGroup(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {editingGroup === index && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Max Rows</Label>
                                <Input
                                  type="number"
                                  value={group.maxRows || 5}
                                  onChange={(e) => updateRowGroup(index, { ...group, maxRows: parseInt(e.target.value) })}
                                  min="1"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={group.isStructuredInput || false}
                                  onCheckedChange={(checked) => updateRowGroup(index, { ...group, isStructuredInput: checked })}
                                />
                                <Label>Structured Input</Label>
                              </div>
                            </div>

                            {group.isStructuredInput && group.structure && (
                              <div className="space-y-4">
                                <h4 className="text-sm font-medium">Column Configuration</h4>
                                
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label>First Column</Label>
                                    <Input
                                      value={group.structure.firstColumn.label}
                                      onChange={(e) => updateRowGroup(index, {
                                        ...group,
                                        structure: {
                                          ...group.structure!,
                                          firstColumn: { ...group.structure!.firstColumn, label: e.target.value }
                                        }
                                      })}
                                      placeholder="Column label"
                                    />
                                    <Input
                                      value={group.structure.firstColumn.placeholder}
                                      onChange={(e) => updateRowGroup(index, {
                                        ...group,
                                        structure: {
                                          ...group.structure!,
                                          firstColumn: { ...group.structure!.firstColumn, placeholder: e.target.value }
                                        }
                                      })}
                                      placeholder="Placeholder text"
                                      className="mt-2"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label>Second Column</Label>
                                    <Input
                                      value={group.structure.secondColumn.label}
                                      onChange={(e) => updateRowGroup(index, {
                                        ...group,
                                        structure: {
                                          ...group.structure!,
                                          secondColumn: { ...group.structure!.secondColumn, label: e.target.value }
                                        }
                                      })}
                                      placeholder="Column label"
                                    />
                                    <Input
                                      value={group.structure.secondColumn.placeholder}
                                      onChange={(e) => updateRowGroup(index, {
                                        ...group,
                                        structure: {
                                          ...group.structure!,
                                          secondColumn: { ...group.structure!.secondColumn, placeholder: e.target.value }
                                        }
                                      })}
                                      placeholder="Placeholder text"
                                      className="mt-2"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label>Third Column</Label>
                                    <Input
                                      value={group.structure.thirdColumn.label}
                                      onChange={(e) => updateRowGroup(index, {
                                        ...group,
                                        structure: {
                                          ...group.structure!,
                                          thirdColumn: { ...group.structure!.thirdColumn, label: e.target.value }
                                        }
                                      })}
                                      placeholder="Column label"
                                    />
                                    <Input
                                      value={group.structure.thirdColumn.placeholder}
                                      onChange={(e) => updateRowGroup(index, {
                                        ...group,
                                        structure: {
                                          ...group.structure!,
                                          thirdColumn: { ...group.structure!.thirdColumn, placeholder: e.target.value }
                                        }
                                      })}
                                      placeholder="Placeholder text"
                                      className="mt-2"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Column Mapping</Label>
                                  <Select
                                    value={group.structure.combinedMapping || 'none'}
                                    onValueChange={(value: 'first_second' | 'second_third' | 'none') => 
                                      updateRowGroup(index, {
                                        ...group,
                                        structure: { ...group.structure!, combinedMapping: value }
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">Map all columns separately</SelectItem>
                                      <SelectItem value="first_second">Combine first + second columns</SelectItem>
                                      <SelectItem value="second_third">Combine second + third columns</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-sm text-gray-600">
                          <p><strong>Type:</strong> {group.isStructuredInput ? 'Structured Input' : 'Legacy Row Group'}</p>
                          <p><strong>Max Rows:</strong> {group.maxRows || 5}</p>
                          {group.structure && (
                            <p><strong>Columns:</strong> {group.structure.firstColumn.label} | {group.structure.secondColumn.label} | {group.structure.thirdColumn.label}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {rowGroups.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">No row groups created yet</p>
          <Button onClick={addRowGroup}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Row Group
          </Button>
        </div>
      )}
    </div>
  );
};
