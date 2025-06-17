import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import { FormConfig, FormField, RowGroup } from '@/types/formTypes';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { RowGroupEditor } from '@/components/forms/RowGroupEditor';
import { ApprovalFlowCard } from '@/components/ui/ApprovalFlowCard';
import { DynamicFieldEditor } from '@/components/forms/DynamicFieldEditor';
import { useCatalogData } from '@/hooks/useCatalogData';

const ServiceFormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { categoryList } = useCatalogData();
  
  const [config, setConfig] = useState<FormConfig>({
    title: '',
    url: '',
    description: '',
    category: '',
    apiEndpoint: '',
    fields: [],
    rowGroups: [],
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
          { label: 'Type of Support', name: 'support_type', type: 'select', options: ['Hardware', 'Software', 'Account'], required: true },
          { label: 'Issue Description', name: 'issue_description', type: 'textarea', required: true }
        ],
        rowGroups: [
          {
            rowGroup: [
              { label: 'Priority', name: 'priority', type: 'select', options: ['High', 'Medium', 'Low'], required: true },
              { label: 'Department', name: 'department', type: 'text', required: true },
              { label: 'Due Date', name: 'due_date', type: 'date', required: false }
            ]
          }
        ]
      };
      setConfig(mockForm);
    }
  }, [isEdit]);

  const handleSave = () => {
    // Generate JSON from current config
    const jsonConfig = generateFormJSON();
    console.log('Generated JSON for saving:', jsonConfig);
    
    // TODO: Call your service catalog save API here with jsonConfig
    // Example: await saveServiceCatalog({ ...otherFields, form_json: jsonConfig });
    
    navigate('/admin/service-catalog');
  };

  const generateFormJSON = () => {
    // Clean up the config for JSON serialization
    const cleanConfig = {
      ...config,
      fields: config.fields?.map(field => ({
        ...field,
        // Remove any undefined values that might break JSON
        ...(field.options && { options: field.options }),
        ...(field.placeholder && { placeholder: field.placeholder }),
        ...(field.value && { value: field.value }),
        ...(field.default && { default: field.default }),
        ...(field.readonly && { readonly: field.readonly }),
        ...(field.uiCondition && { uiCondition: field.uiCondition }),
        ...(field.accept && { accept: field.accept }),
        ...(field.note && { note: field.note })
      }))
    };
    
    return JSON.stringify(cleanConfig, null, 2);
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Hardware': '💻',
      'Software': '💾',
      'Support': '🛠️',
      'HRGA': '👥',
      'Marketing': '📢'
    };
    return iconMap[categoryName] || '📋';
  };

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      'Hardware': 'bg-blue-100 text-blue-800',
      'Software': 'bg-green-100 text-green-800',
      'Support': 'bg-orange-100 text-orange-800',
      'HRGA': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-pink-100 text-pink-800'
    };
    return colorMap[categoryName] || 'bg-gray-100 text-gray-800';
  };

  const addField = () => {
    const newField: FormField = {
      label: 'New Field',
      name: `new_field_${Date.now()}`,
      type: 'text',
      required: false,
      columnSpan: 1
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
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
              {config.category && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(config.category)}`}>
                  <span className="mr-2">{getCategoryIcon(config.category)}</span>
                  Form Preview
                </div>
              )}
            </div>
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
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/service-catalog')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {config.category && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(config.category)}`}>
                  <span className="mr-2">{getCategoryIcon(config.category)}</span>
                  {config.category}
                </div>
              )}
              <h1 className="text-2xl font-bold">{isEdit ? 'Edit' : 'Create'} Service Form</h1>
            </div>
          </div>
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
                      {categoryList.map((category) => (
                        <SelectItem key={category.category_id} value={category.category_name}>
                          <span className="mr-2">{getCategoryIcon(category.category_name)}</span>
                          {category.category_name}
                        </SelectItem>
                      ))}
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

            {/* Approval Flow Preview */}
            <ApprovalFlowCard
              steps={config.approval?.steps.map((step, index) => ({
                id: `step-${index}`,
                name: step,
                status: 'waiting' as const,
                approver: step,
                role: 'Approver'
              })) || []}
              mode={config.approval?.mode}
            />

            <Card>
              <CardHeader>
                <CardTitle>Approval Flow Settings</CardTitle>
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
                <CardTitle>Form Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="fields" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fields">Dynamic Fields</TabsTrigger>
                    <TabsTrigger value="rowGroups">Legacy Row Groups</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="fields" className="space-y-4 mt-4">
                    <DynamicFieldEditor
                      fields={config.fields || []}
                      onUpdate={(fields) => setConfig({ ...config, fields })}
                    />
                  </TabsContent>
                  
                  <TabsContent value="rowGroups" className="mt-4">
                    <RowGroupEditor
                      rowGroups={config.rowGroups || []}
                      onUpdate={(rowGroups) => setConfig({ ...config, rowGroups })}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ServiceFormEditor;
