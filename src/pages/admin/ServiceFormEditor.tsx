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
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { FormConfig, FormField, FormSection, RowGroup } from '@/types/formTypes';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { DynamicFieldEditor } from '@/components/forms/DynamicFieldEditor';
import { SectionEditor } from '@/components/forms/SectionEditor';
import { RowGroupEditor } from '@/components/forms/RowGroupEditor';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchWorkflowGroups } from '@/store/slices/userManagementSlice';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { useToast } from '@/hooks/use-toast';
import { getMaxFormFields } from '@/utils/formFieldMapping';
import { UnifiedFormStructureEditor, FormStructureItem } from '@/components/forms/UnifiedFormStructureEditor';

const ServiceFormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isEdit = !!id;
  const { categoryList, serviceCatalog } = useCatalogData();
  const { workflowGroups } = useAppSelector(state => state.userManagement);

  const [config, setConfig] = useState<FormConfig>({
    title: '',
    url: '',
    description: '',
    category: '',
    apiEndpoint: '',
    fields: [],
    sections: [],
    rowGroups: []
  });

  const [selectedWorkflowGroup, setSelectedWorkflowGroup] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [formStructure, setFormStructure] = useState<FormStructureItem[]>([]);

  // Calculate total field count properly
  const totalFieldCount = formStructure.reduce((acc, item) => {
    if (item.type === 'field') {
      return acc + 1;
    } else if (item.type === 'section') {
      const sectionData = item.data as any;
      return acc + (sectionData.fields?.length || 0);
    } else if (item.type === 'rowgroup') {
      return acc + 1; // Row groups count as 1 field mapping
    }
    return acc;
  }, 0);

  // Fetch workflow groups on component mount
  useEffect(() => {
    dispatch(fetchWorkflowGroups());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && id && serviceCatalog.length > 0) {
      const serviceData = serviceCatalog.find(service => service.service_id.toString() === id);

      if (serviceData) {
        const category = categoryList.find(cat => cat.category_id === serviceData.category_id);
        const categoryName = category?.category_name || '';

        let parsedConfig: FormConfig = {
          id: serviceData.service_id.toString(),
          title: serviceData.service_name,
          url: `/${serviceData.nav_link}`,
          category: categoryName,
          description: serviceData.service_description,
          apiEndpoint: `/api/${serviceData.nav_link}`,
          fields: [],
          sections: [],
          rowGroups: [],
          servis_aktif: Number(serviceData.active) ?? 0,
          active: Number(serviceData.active) ?? 0
        };

        if (serviceData.form_json) {
          try {
            const jsonConfig = JSON.parse(serviceData.form_json);
            parsedConfig = {
              ...parsedConfig,
              ...jsonConfig,
              id: serviceData.service_id.toString(),
              category: categoryName,
            };
          } catch (error) {
            console.error('Failed to parse form_json:', error);
          }
        }

        setConfig(parsedConfig);
        if (serviceData.m_workflow_groups) {
          setSelectedWorkflowGroup(serviceData.m_workflow_groups);
        }
      }
    } else if (!isEdit) {
      const defaultWorkflow = workflowGroups.find(wg => wg.name?.toLowerCase().includes('direct superior') || wg.name?.toLowerCase().includes('default'));
      if (defaultWorkflow) {
        setSelectedWorkflowGroup(defaultWorkflow.id);
      }
    }
  }, [isEdit, id, serviceCatalog, categoryList, workflowGroups]);

  const { toast } = useToast();

  // Convert legacy structure to unified structure
  useEffect(() => {
    const unifiedItems: FormStructureItem[] = [];
    let counter = 0;

    // Convert existing fields
    config.fields?.forEach((field, index) => {
      unifiedItems.push({
        id: `field-${counter}`,
        type: 'field',
        order: counter,
        data: field
      });
      counter++;
    });

    // Convert existing sections
    config.sections?.forEach((section, index) => {
      unifiedItems.push({
        id: `section-${counter}`,
        type: 'section',
        order: counter,
        data: {
          title: section.title,
          description: section.description,
          fields: section.fields,
          defaultOpen: true
        }
      });
      counter++;
    });

    // Convert existing row groups
    config.rowGroups?.forEach((rowGroup, index) => {
      unifiedItems.push({
        id: `rowgroup-${counter}`,
        type: 'rowgroup',
        order: counter,
        data: rowGroup
      });
      counter++;
    });

    setFormStructure(unifiedItems);
  }, [config.fields, config.sections, config.rowGroups]);

  const handleStructureUpdate = (items: FormStructureItem[]) => {
    setFormStructure(items);
    
    // Convert back to legacy format for saving
    const fields: FormField[] = [];
    const sections: FormSection[] = [];
    const rowGroups: RowGroup[] = [];

    items.forEach(item => {
      if (item.type === 'field') {
        fields.push(item.data as FormField);
      } else if (item.type === 'section') {
        const sectionData = item.data as any;
        sections.push({
          title: sectionData.title,
          description: sectionData.description,
          fields: sectionData.fields,
          repeatable: false
        });
      } else if (item.type === 'rowgroup') {
        rowGroups.push(item.data as RowGroup);
      }
    });

    setConfig({
      ...config,
      fields,
      sections,
      rowGroups
    });
  };

  const handleSave = async () => {
    setIsLoading(true);

    if (totalFieldCount > getMaxFormFields()) {
      toast({
        title: "Error",
        description: `Form cannot have more than ${getMaxFormFields()} fields due to database limitations`,
        variant: "destructive",
        duration: 5000
      });
      setIsLoading(false);
      return;
    }

    try {
      const selectedCategory = categoryList.find(c => c.category_name === config.category);

      const payload = {
        ...(isEdit && { service_id: parseInt(id!) }),
        service_name: config.title,
        category_id: selectedCategory?.category_id || null,
        service_description: config.description,
        approval_level: 1,
        image_url: "",
        nav_link: config.url.replace(/^\/+/, ''),
        active: 1,
        team_id: null,
        api_endpoint: config.apiEndpoint,
        form_json: config,
        m_workflow_groups: selectedWorkflowGroup
      };

      const response = await axios.post(`${API_URL}/hots_settings/insertupdate/service_catalog`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        }
      });

      toast({
        title: "Success",
        description: isEdit ? "Form updated successfully" : "Form created successfully",
        variant: "default",
        duration: 3000
      });

      navigate('/admin/service-catalog');

    } catch (error: any) {
      console.error("SAVE ERROR:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save form",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
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
          <DynamicForm
            config={config}
            onSubmit={(data) => {
              toast({
                title: "Form Submitted",
                description: JSON.stringify(data, null, 2),
              });
            }}
          />
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
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Form'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Configuration</TabsTrigger>
            <TabsTrigger value="structure">Form Structure</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <Card>
                <CardHeader>
                  <CardTitle>Workflow Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="workflowGroup">Workflow Group</Label>
                    <Select
                      value={selectedWorkflowGroup?.toString() || ''}
                      onValueChange={(value) => setSelectedWorkflowGroup(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select workflow group" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflowGroups
                          .filter(wg => wg.is_active)
                          .map((workflowGroup) => (
                            <SelectItem key={workflowGroup.id} value={workflowGroup.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{workflowGroup.name}</span>
                                <span className="text-sm text-gray-500">{workflowGroup.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Select the workflow group that will handle the approval process for this service.
                    </p>
                  </div>

                  {selectedWorkflowGroup && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected Workflow:</strong> {workflowGroups.find(wg => wg.id === selectedWorkflowGroup)?.name}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {workflowGroups.find(wg => wg.id === selectedWorkflowGroup)?.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="structure" className="space-y-6">
            {/* Field count warning */}
            {totalFieldCount > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Database Mapping:</strong> {totalFieldCount} of {getMaxFormFields()} fields used
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Fields will be mapped to database columns automatically
                      </p>
                    </div>
                    {totalFieldCount >= getMaxFormFields() && (
                      <div className="text-red-600 text-sm font-medium">
                        ⚠️ Maximum field limit reached
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Unified Form Structure</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag and drop to reorder fields, sections, and row groups. Each element can be configured individually.
                </p>
              </CardHeader>
              <CardContent>
                <UnifiedFormStructureEditor
                  items={formStructure}
                  onUpdate={handleStructureUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ServiceFormEditor;
