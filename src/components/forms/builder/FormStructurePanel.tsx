
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormConfig, FormSection, FormField, RowGroup } from '@/types/formTypes';
import { SectionBuilder } from './SectionBuilder';
import { Plus, GripVertical } from 'lucide-react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface FormStructurePanelProps {
  config: FormConfig;
  onAddSection: () => void;
  onUpdateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddField: (sectionId: string, field: FormField) => void;
  onUpdateField: (sectionId: string, fieldId: string, updates: Partial<FormField>) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onAddRowGroup: (sectionId: string, rowGroup: RowGroup) => void;
}

export const FormStructurePanel: React.FC<FormStructurePanelProps> = ({
  config,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onAddField,
  onUpdateField,
  onDeleteField,
  onAddRowGroup
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Form Structure</h2>
        <Button onClick={onAddSection} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <Droppable droppableId="sections" type="SECTION">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {config.sections?.map((section, index) => (
              <Draggable key={section.id} draggableId={section.id!} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`transition-shadow ${
                      snapshot.isDragging ? 'shadow-lg' : ''
                    }`}
                  >
                    <Card className="border-l-4 border-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <Input
                              value={section.title}
                              onChange={(e) => onUpdateSection(section.id!, { title: e.target.value })}
                              className="font-medium"
                              placeholder="Section Title"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSection(section.id!)}
                          >
                            {expandedSections.has(section.id!) ? 'Collapse' : 'Expand'}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {expandedSections.has(section.id!) && (
                        <CardContent>
                          <SectionBuilder
                            section={section}
                            onUpdateSection={(updates) => onUpdateSection(section.id!, updates)}
                            onDeleteSection={() => onDeleteSection(section.id!)}
                            onAddField={(field) => onAddField(section.id!, field)}
                            onUpdateField={(fieldId, updates) => onUpdateField(section.id!, fieldId, updates)}
                            onDeleteField={(fieldId) => onDeleteField(section.id!, fieldId)}
                            onAddRowGroup={(rowGroup) => onAddRowGroup(section.id!, rowGroup)}
                          />
                        </CardContent>
                      )}
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {(!config.sections || config.sections.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No sections yet. Add your first section to get started.</p>
          <Button onClick={onAddSection} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add First Section
          </Button>
        </div>
      )}
    </div>
  );
};
