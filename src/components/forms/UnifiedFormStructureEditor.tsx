import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormField, FormSection, RowGroup } from '@/types/formTypes';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical, Edit3, Package, ChevronDown, ChevronUp, Link } from 'lucide-react';

interface FormStructureItem {
  id: string;
  type: 'field' | 'section' | 'rowgroup';
  order: number;
  data: FormField | FormSection | RowGroup;
}

interface UnifiedFormStructureEditorProps {
  items: FormStructureItem[];
  onUpdate: (items: FormStructureItem[]) => void;
}

export const UnifiedFormStructureEditor: React.FC<UnifiedFormStructureEditorProps> = ({
  items,
  onUpdate,
}) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const addItem = (type: 'field' | 'section' | 'rowgroup') => {
    let newItem: FormStructureItem;

    switch (type) {
      case 'field':
        newItem = {
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
        break;
      case 'section':
        newItem = {
          id: `section-${Date.now()}`,
          type: 'section',
          order: items.length,
          data: {
            title: 'New Section',
            description: '',
            fields: [],
            repeatable: false
          }
        };
        break;
      case 'rowgroup':
        newItem = {
          id: `rowgroup-${Date.now()}`,
          type: 'rowgroup',
          order: items.length,
          data: {
            title: 'New Row Group',
            isStructuredInput: false,
            rowGroup: []
          }
        };
        break;
    }

    onUpdate([...items, newItem]);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    onUpdate(newItems);
  };

  const updateItem = (id: string, newData: any) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        return { ...item, data: newData };
      }
      return item;
    });
    onUpdate(newItems);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newItems = [...items];

    // Handle section field reordering
    if (source.droppableId.startsWith('section-') && destination.droppableId.startsWith('section-')) {
      const sourceSectionId = source.droppableId.replace('section-', '');
      const destSectionId = destination.droppableId.replace('section-', '');
      
      const sourceSection = newItems.find(item => item.id === sourceSectionId);
      const destSection = newItems.find(item => item.id === destSectionId);
      
      if (sourceSection && destSection && sourceSection.type === 'section' && destSection.type === 'section') {
        const sourceSectionData = sourceSection.data as any;
        const destSectionData = destSection.data as any;
        
        // Move field from source to destination section
        const [movedField] = sourceSectionData.fields.splice(source.index, 1);
        destSectionData.fields.splice(destination.index, 0, movedField);
        
        onUpdate(newItems);
        return;
      }
    }

    // Handle moving field from section to main structure
    if (source.droppableId.startsWith('section-') && destination.droppableId === 'main-structure') {
      const sectionId = source.droppableId.replace('section-', '');
      const section = newItems.find(item => item.id === sectionId);
      
      if (section && section.type === 'section') {
        const sectionData = section.data as any;
        const [movedField] = sectionData.fields.splice(source.index, 1);
        
        // Create new field item
        const newFieldItem: FormStructureItem = {
          id: `field-${Date.now()}`,
          type: 'field',
          order: destination.index,
          data: movedField
        };
        
        // Insert into main structure
        newItems.splice(destination.index, 0, newFieldItem);
        
        // Update orders
        newItems.forEach((item, index) => {
          item.order = index;
        });
        
        onUpdate(newItems);
        return;
      }
    }

    // Handle moving field from main structure to section
    if (source.droppableId === 'main-structure' && destination.droppableId.startsWith('section-')) {
      const sectionId = destination.droppableId.replace('section-', '');
      const section = newItems.find(item => item.id === sectionId);
      
      if (section && section.type === 'section') {
        const sectionData = section.data as any;
        const [movedItem] = newItems.splice(source.index, 1);
        
        if (movedItem.type === 'field') {
          sectionData.fields.splice(destination.index, 0, movedItem.data);
        }
        
        // Update orders
        newItems.forEach((item, index) => {
          item.order = index;
        });
        
        onUpdate(newItems);
        return;
      }
    }

    // Handle main structure reordering
    if (source.droppableId === 'main-structure' && destination.droppableId === 'main-structure') {
      const [reorderedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, reorderedItem);
      
      // Update orders
      newItems.forEach((item, index) => {
        item.order = index;
      });
      
      onUpdate(newItems);
    }
  };

  const renderSectionFields = (sectionData: any, sectionId: string) => (
    <Droppable droppableId={`section-${sectionId}`} type="section-field">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-2 min-h-[60px] p-2 rounded-lg border-2 border-dashed ${
            snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <div className="text-xs text-gray-500 mb-2">
            Section Fields ({sectionData.fields?.length || 0})
          </div>
          {sectionData.fields?.map((field: FormField, index: number) => (
            <Draggable key={`section-field-${index}`} draggableId={`section-field-${sectionId}-${index}`} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`p-2 bg-white border rounded-lg shadow-sm ${
                    snapshot.isDragging ? 'shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{field.label}</span>
                      <span className="text-xs text-gray-500">({field.type})</span>
                      {field.dependsOn && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          <Link className="w-3 h-3" />
                          Chain Link
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Edit field logic
                          console.log('Edit field:', field);
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Remove field from section
                          const updatedFields = sectionData.fields.filter((_: any, i: number) => i !== index);
                          const updatedItems = items.map(item => 
                            item.id === sectionId 
                              ? { ...item, data: { ...sectionData, fields: updatedFields } }
                              : item
                          );
                          onUpdate(updatedItems);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
          {(!sectionData.fields || sectionData.fields.length === 0) && (
            <div className="text-center text-gray-400 text-sm py-4">
              Drop fields here or drag fields from main structure
            </div>
          )}
        </div>
      )}
    </Droppable>
  );

  const renderItem = (item: FormStructureItem, index: number) => {
    if (item.type === 'field') {
      const field = item.data as FormField;
      return (
        <div className="p-3 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <div>
                <span className="font-medium">{field.label}</span>
                <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                {field.dependsOn && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mt-1">
                    <Link className="w-3 h-3" />
                    Chain Link → {field.dependsOn}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(item.id)}
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
        </div>
      );
    } else if (item.type === 'section') {
      const sectionData = item.data as any;
      const isExpanded = expandedSections.has(item.id);
      
      return (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <div>
                <span className="font-medium text-blue-800">{sectionData.title}</span>
                <span className="text-sm text-blue-600 ml-2">(Section)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newExpanded = new Set(expandedSections);
                  if (isExpanded) {
                    newExpanded.delete(item.id);
                  } else {
                    newExpanded.add(item.id);
                  }
                  setExpandedSections(newExpanded);
                }}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(item.id)}
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
          
          {isExpanded && (
            <div className="mt-3">
              {renderSectionFields(sectionData, item.id)}
            </div>
          )}
        </div>
      );
    } else if (item.type === 'rowgroup') {
      const rowGroupData = item.data as any;
      return (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <div>
                <span className="font-medium text-green-800">
                  {rowGroupData.title || 'Row Group'}
                </span>
                <span className="text-sm text-green-600 ml-2">(Row Group)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(item.id)}
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
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => addItem('field')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
        <Button variant="outline" size="sm" onClick={() => addItem('section')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
        <Button variant="outline" size="sm" onClick={() => addItem('rowgroup')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row Group
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="main-structure">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-3 min-h-[200px] p-4 rounded-lg border-2 border-dashed ${
                snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? 'opacity-50' : ''}
                    >
                      {renderItem(item, index)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {items.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No form elements yet</p>
                  <p className="text-sm">Add fields, sections, or row groups to get started</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
