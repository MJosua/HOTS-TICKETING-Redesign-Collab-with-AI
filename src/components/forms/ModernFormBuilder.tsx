
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { FormSettingsPanel } from './builder/FormSettingsPanel';
import { FormStructurePanel } from './builder/FormStructurePanel';
import { FormPreviewPanel } from './builder/FormPreviewPanel';
import { FieldTemplatesPanel } from './builder/FieldTemplatesPanel';
import { FormConfig, FormSection, FormField, RowGroup } from '@/types/formTypes';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, EyeOff, Download, Upload, Copy } from 'lucide-react';

interface ModernFormBuilderProps {
  initialConfig?: FormConfig;
  onSave: (config: FormConfig) => void;
  onPreview?: (config: FormConfig) => void;
  isLoading?: boolean;
}

export const ModernFormBuilder: React.FC<ModernFormBuilderProps> = ({
  initialConfig,
  onSave,
  onPreview,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<FormConfig>(
    initialConfig || {
      title: '',
      url: '',
      description: '',
      sections: [],
      metadata: {
        version: '2.0',
        fieldCount: 0,
        maxFields: 16
      }
    }
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [history, setHistory] = useState<FormConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Add to history when config changes
  useEffect(() => {
    if (JSON.stringify(config) !== JSON.stringify(history[historyIndex])) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(config)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [config]);

  // Calculate field count
  useEffect(() => {
    const fieldCount = calculateTotalFields();
    setConfig(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        fieldCount
      }
    }));
  }, [config.sections]);

  const calculateTotalFields = (): number => {
    let count = 0;
    config.sections?.forEach(section => {
      count += section.fields?.length || 0;
      section.rowGroups?.forEach(group => {
        count += group.rowGroup?.length || 0;
      });
    });
    return count;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;
    
    if (type === 'SECTION') {
      const newSections = Array.from(config.sections || []);
      const [removed] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, removed);
      
      setConfig(prev => ({ ...prev, sections: newSections }));
    } else if (type === 'FIELD') {
      // Handle field reordering within sections
      const sectionId = source.droppableId.split('-')[1];
      const section = config.sections?.find(s => s.id === sectionId);
      
      if (section?.fields) {
        const newFields = Array.from(section.fields);
        const [removed] = newFields.splice(source.index, 1);
        newFields.splice(destination.index, 0, removed);
        
        const newSections = config.sections?.map(s => 
          s.id === sectionId ? { ...s, fields: newFields } : s
        );
        
        setConfig(prev => ({ ...prev, sections: newSections }));
      }
    }
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      fields: [],
      rowGroups: []
    };
    
    setConfig(prev => ({
      ...prev,
      sections: [...(prev.sections || []), newSection]
    }));
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections?.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const deleteSection = (sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections?.filter(section => section.id !== sectionId)
    }));
  };

  const addFieldToSection = (sectionId: string, field: FormField) => {
    const fieldWithId = {
      ...field,
      id: `field-${Date.now()}`,
      name: field.name || `field_${Date.now()}`
    };

    setConfig(prev => ({
      ...prev,
      sections: prev.sections?.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...(section.fields || []), fieldWithId] }
          : section
      )
    }));
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<FormField>) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections?.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields?.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
              )
            }
          : section
      )
    }));
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections?.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields?.filter(field => field.id !== fieldId) }
          : section
      )
    }));
  };

  const addRowGroupToSection = (sectionId: string, rowGroup: RowGroup) => {
    const rowGroupWithId = {
      ...rowGroup,
      id: `rowgroup-${Date.now()}`
    };

    setConfig(prev => ({
      ...prev,
      sections: prev.sections?.map(section =>
        section.id === sectionId
          ? { ...section, rowGroups: [...(section.rowGroups || []), rowGroupWithId] }
          : section
      )
    }));
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${config.title || 'form'}_config.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          setConfig(importedConfig);
          toast({
            title: "Success",
            description: "Form configuration imported successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Invalid JSON file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setConfig(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setConfig(history[historyIndex + 1]);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Form Builder</h1>
          <div className="text-sm text-gray-500">
            {config.metadata?.fieldCount || 0} / {config.metadata?.maxFields || 16} fields
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            Redo
          </Button>
          
          <input
            type="file"
            accept=".json"
            onChange={importConfig}
            className="hidden"
            id="import-config"
          />
          <Button variant="outline" size="sm" onClick={() => document.getElementById('import-config')?.click()}>
            <Upload className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportConfig}>
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          
          <Button onClick={() => onSave(config)} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Form Builder */}
          <ResizablePanel defaultSize={previewMode ? 50 : 100} minSize={30}>
            <div className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="settings" className="h-full m-0">
                    <FormSettingsPanel
                      config={config}
                      onUpdate={setConfig}
                    />
                  </TabsContent>
                  
                  <TabsContent value="structure" className="h-full m-0">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <FormStructurePanel
                        config={config}
                        onAddSection={addSection}
                        onUpdateSection={updateSection}
                        onDeleteSection={deleteSection}
                        onAddField={addFieldToSection}
                        onUpdateField={updateField}
                        onDeleteField={deleteField}
                        onAddRowGroup={addRowGroupToSection}
                      />
                    </DragDropContext>
                  </TabsContent>
                  
                  <TabsContent value="templates" className="h-full m-0">
                    <FieldTemplatesPanel
                      onAddField={(sectionId, field) => addFieldToSection(sectionId, field)}
                      sections={config.sections || []}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </ResizablePanel>

          {/* Right Panel - Live Preview */}
          {previewMode && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30}>
                <FormPreviewPanel config={config} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
