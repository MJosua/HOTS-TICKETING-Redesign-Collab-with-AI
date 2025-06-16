
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { FormConfig, FormField } from '@/types/formTypes';
import { DynamicForm } from '@/components/forms/DynamicForm';

const ServiceFormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [config, setConfig] = useState<FormConfig>({
    title: '',
    url: '',
    description: '',
    category: '',
    apiEndpoint: '',
    fields: [],
    approval: { steps: [], mode: 'sequential' }
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isEdit) {
      // Mock loading existing form - in real app, fetch from API
      const mockForm: FormConfig = {
        id: '1',
        title: 'IT Support Request',
        url: '/it-support',
        category: 'Support',
        description: 'Request IT technical support',
        apiEndpoint: '/api/it-support',
        approval: { steps: ['Supervisor', 'IT Team'], mode: 'sequential' },
        fields: [
          { label: 'Type of Support', type: 'select', options: ['Hardware', 'Software', 'Account'], required: true },
          { label: 'Issue Description', type: 'textarea', required: true }
        ]
      };
      setConfig(mockForm);
    }
  }, [isEdit]);

  const handleSave = () => {
    console.log('Saving form config:', config);
    // In real app, save to API
    navigate('/admin/service-catalog');
  };

  const addField = () => {
    const newField: FormField = {
      label: 'New Field',
      type: 'text',
      required: false
    };
    setConfig({
      ...config,
      fields: [...(config.fields || []), newField]
    });
  };

  const updateField = (index: number, updatedField: FormField) => {
    const newFields = [...(config.fields || [])];
    newFields[index] = updatedField;
    setConfig({ ...config, fields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = config.fields?.filter((_, i) => i !== index) || [];
    setConfig({ ...config, fields: newFields });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...(config.fields || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newFields.length) {
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      setConfig({ ...config, fields: newFields });
    }
  };

  const addApprovalStep = () => {
    const newSteps = [...(config.approval?.steps || []), 'New Approver'];
    setConfig({
      ...config,
      approval: { ...config.approval!, steps: newSteps }
    });
  };

  const updateApprovalStep = (index: number, value: string) => {
    const newSteps = [...(config.approval?.steps || [])];
    newSteps[index] = value;
    setConfig({
      ...config,
      approval: { ...config.approval!, steps: newSteps }
    });
  };

  const removeApprovalStep = (index: number) => {
    const newSteps = config.approval?.steps.filter((_, i) => i !== index) || [];
    setConfig({
      ...config,
      approval: { ...config.approval!, steps: newSteps }
    });
  };

  if (previewMode) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Form Preview</h1>
            <Button onClick={() => setPreviewMode(false)}>Back to Editor</Button>
          </div>
          <DynamicForm config={config} onSubmit={(data) => console.log('Preview submit:', data)} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} Service Form</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(true)}>
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Form Title</Label>
                  <Input
                    id="title"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    placeholder="e.g., IT Support Request"
                  />
                </div>
                
                <div>
                  <Label htmlFor="url">URL Path</Label>
                  <Input
                    id="url"
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    placeholder="e.g., /it-support"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={config.category} onValueChange={(value) => setConfig({ ...config, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="HRGA">HRGA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    placeholder="Brief description of the form"
                  />
                </div>

                <div>
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input
                    id="apiEndpoint"
                    value={config.apiEndpoint}
                    onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
                    placeholder="e.g., /api/it-support"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approval Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Approval Mode</Label>
                  <Select 
                    value={config.approval?.mode} 
                    onValueChange={(value: 'sequential' | 'parallel') => 
                      setConfig({ 
                        ...config, 
                        approval: { ...config.approval!, mode: value } 
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="parallel">Parallel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Approval Steps</Label>
                    <Button size="sm" onClick={addApprovalStep}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {config.approval?.steps.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={step}
                        onChange={(e) => updateApprovalStep(index, e.target.value)}
                        placeholder="Approver role"
                      />
                      <Button size="sm" variant="outline" onClick={() => removeApprovalStep(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Fields */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Form Fields
                  <Button size="sm" onClick={addField}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.fields?.map((field, index) => (
                  <FieldEditor
                    key={index}
                    field={field}
                    onUpdate={(updatedField) => updateField(index, updatedField)}
                    onRemove={() => removeField(index)}
                    onMoveUp={() => moveField(index, 'up')}
                    onMoveDown={() => moveField(index, 'down')}
                    canMoveUp={index > 0}
                    canMoveDown={index < (config.fields?.length || 0) - 1}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}) => {
  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  return (
    <Card className="p-4 border-l-4 border-blue-500">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Input
            value={field.label}
            onChange={(e) => updateField({ label: e.target.value })}
            placeholder="Field Label"
            className="font-medium"
          />
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

        <div className="grid grid-cols-2 gap-2">
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
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField({ required: e.target.checked })}
            />
            <Label>Required</Label>
          </div>
        </div>

        <Input
          value={field.placeholder || ''}
          onChange={(e) => updateField({ placeholder: e.target.value })}
          placeholder="Placeholder text"
        />

        {(field.type === 'select' || field.type === 'radio') && (
          <Textarea
            value={field.options?.join('\n') || ''}
            onChange={(e) => updateField({ options: e.target.value.split('\n').filter(o => o.trim()) })}
            placeholder="Enter options (one per line)"
            rows={3}
          />
        )}
      </div>
    </Card>
  );
};

export default ServiceFormEditor;
