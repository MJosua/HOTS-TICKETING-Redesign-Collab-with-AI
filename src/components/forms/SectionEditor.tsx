
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Edit3 } from 'lucide-react';
import { FormSection, FormField } from '@/types/formTypes';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FieldEditor } from './FieldEditor';

interface SectionEditorProps {
  sections: FormSection[];
  onUpdate: (sections: FormSection[]) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ sections, onUpdate }) => {
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<{ sectionIndex: number; fieldIndex: number } | null>(null);

  const addSection = () => {
    const newSection: FormSection = {
      title: 'New Section',
      description: '',
      fields: [],
      repeatable: false
    };
    onUpdate([...sections, newSection]);
  };

  const updateSection = (index: number, updatedSection: FormSection) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    onUpdate(newSections);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    onUpdate(newSections);
  };

  const addFieldToSection = (sectionIndex: number) => {
    const newField: FormField = {
      label: 'New Field',
      name: `field_${Date.now()}`,
      type: 'text',
      required: false,
      columnSpan: 1
    };
    
    const newSections = [...sections];
    newSections[sectionIndex].fields = [...newSections[sectionIndex].fields, newField];
    onUpdate(newSections);
  };

  const updateFieldInSection = (sectionIndex: number, fieldIndex: number, updatedField: FormField) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields[fieldIndex] = updatedField;
    onUpdate(newSections);
  };

  const removeFieldFromSection = (sectionIndex: number, fieldIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields = newSections[sectionIndex].fields.filter((_, i) => i !== fieldIndex);
    onUpdate(newSections);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'section') {
      const newSections = Array.from(sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);
      onUpdate(newSections);
    } else if (type === 'field') {
      const sectionIndex = parseInt(source.droppableId.split('-')[1]);
      const newSections = [...sections];
      const fields = Array.from(newSections[sectionIndex].fields);
      const [reorderedField] = fields.splice(source.index, 1);
      fields.splice(destination.index, 0, reorderedField);
      newSections[sectionIndex].fields = fields;
      onUpdate(newSections);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Form Sections</h3>
        <Button onClick={addSection} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {sections.map((section, sectionIndex) => (
                <Draggable key={`section-${sectionIndex}`} draggableId={`section-${sectionIndex}`} index={sectionIndex}>
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
                              {editingSection === sectionIndex ? (
                                <Input
                                  value={section.title}
                                  onChange={(e) => updateSection(sectionIndex, { ...section, title: e.target.value })}
                                  onBlur={() => setEditingSection(null)}
                                  onKeyDown={(e) => e.key === 'Enter' && setEditingSection(null)}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  onClick={() => setEditingSection(sectionIndex)}
                                  className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                >
                                  {section.title}
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSection(sectionIndex)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSection(sectionIndex)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {editingSection === sectionIndex && (
                          <div className="space-y-3 p-3 bg-gray-50 rounded">
                            <div>
                              <Label>Description</Label>
                              <Textarea
                                value={section.description || ''}
                                onChange={(e) => updateSection(sectionIndex, { ...section, description: e.target.value })}
                                placeholder="Section description (optional)"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={section.repeatable || false}
                                onCheckedChange={(checked) => updateSection(sectionIndex, { ...section, repeatable: checked })}
                              />
                              <Label>Repeatable Section</Label>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Fields ({section.fields.length})</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addFieldToSection(sectionIndex)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Field
                            </Button>
                          </div>

                          <Droppable droppableId={`fields-${sectionIndex}`} type="field">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {section.fields.map((field, fieldIndex) => (
                                  <Draggable
                                    key={`field-${sectionIndex}-${fieldIndex}`}
                                    draggableId={`field-${sectionIndex}-${fieldIndex}`}
                                    index={fieldIndex}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="p-3 border rounded-lg bg-white"
                                      >
                                        {editingField?.sectionIndex === sectionIndex && editingField?.fieldIndex === fieldIndex ? (
                                          <FieldEditor
                                            field={field}
                                            onUpdate={(updatedField) => {
                                              updateFieldInSection(sectionIndex, fieldIndex, updatedField);
                                              setEditingField(null);
                                            }}
                                            onCancel={() => setEditingField(null)}
                                          />
                                        ) : (
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div {...provided.dragHandleProps} className="cursor-move">
                                                <GripVertical className="w-4 h-4 text-gray-400" />
                                              </div>
                                              <div>
                                                <span className="font-medium">{field.label}</span>
                                                <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingField({ sectionIndex, fieldIndex })}
                                              >
                                                <Edit3 className="w-4 h-4" />
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeFieldFromSection(sectionIndex, fieldIndex)}
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
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

      {sections.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">No sections created yet</p>
          <Button onClick={addSection}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Section
          </Button>
        </div>
      )}
    </div>
  );
};
