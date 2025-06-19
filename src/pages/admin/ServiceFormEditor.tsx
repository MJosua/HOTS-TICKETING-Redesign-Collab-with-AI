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
import { DynamicFieldEditor } from '@/components/forms/DynamicFieldEditor';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchWorkflowGroups } from '@/store/slices/userManagementSlice';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { useToast } from '@/hooks/use-toast';
import { getMaxFormFields, validateFormFieldCount } from '@/utils/formFieldMapping';

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
    rowGroups: []
  });

  const [selectedWorkflowGroup, setSelectedWorkflowGroup] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch workflow groups on component mount
  useEffect(() => {
    dispatch(fetchWorkflowGroups());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && id && serviceCatalog.length > 0) {
      // console.log('Loading service data for edit mode, ID:', id);

      // Find the service by ID
      const serviceData = serviceCatalog.find(service => service.service_id.toString() === id);

      if (serviceData) {
        // console.log('Found service data:', serviceData);

        // Get category name from category_id
        const category = categoryList.find(cat => cat.category_id === serviceData.category_id);
        const categoryName = category?.category_name || '';

        // Parse form_json if it exists, otherwise create default structure
        let parsedConfig: FormConfig = {
          id: serviceData.service_id.toString(),
          title: serviceData.service_name,
          url: `/${serviceData.nav_link}`,
          category: categoryName,
          description: serviceData.service_description,
          apiEndpoint: `/api/${serviceData.nav_link}`,
          fields: [],
          rowGroups: []
        };

        // Try to parse existing form_json
        if (serviceData.form_json) {
          try {
            const jsonConfig = JSON.parse(serviceData.form_json);
            parsedConfig = {
              ...parsedConfig,
              ...jsonConfig,
              // Override with database values
              id: serviceData.service_id.toString(),
              category: categoryName, // Always use category from database
            };
          } catch (error) {
            console.error('Failed to parse form_json:', error);
            // Use default structure if JSON is invalid
          }
        }

        setConfig(parsedConfig);
        // console.log("serviceData..workflow_group_id", serviceData.m_workflow_groups)
        // Set workflow group from service data if available
        if (serviceData.m_workflow_groups) {
          // console.log("jalan")
          setSelectedWorkflowGroup(serviceData.m_workflow_groups);
        }
      } else {
        console.warn('Service not found for ID:', id);
      }
    } else if (!isEdit) {
      // For new services, set default workflow group (direct superior)
      const defaultWorkflow = workflowGroups.find(wg => wg.name?.toLowerCase().includes('direct superior') || wg.name?.toLowerCase().includes('default'));
      if (defaultWorkflow) {
        setSelectedWorkflowGroup(defaultWorkflow.id);
      }
    }
  }, [isEdit, id, serviceCatalog, categoryList, workflowGroups]);

  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true);

    // Validate field count before saving
    if (!validateFormFieldCount(config.fields || [])) {
      toast({
        title: "Error",
        description: `Form cannot have more than ${getMaxFormFields()} fields due to database limitations`,
        variant: "destructive",
        duration: 5000
      });
      setIsLoading(false);
      return;
    }

    console.log('Current config before saving:', config);
    console.log('Selected workflow group:', selectedWorkflowGroup);

    try {
      // Find category_id from category name
      const selectedCategory = categoryList.find(c => c.category_name === config.category);

      // Build full service catalog object
      const payload = {
        ...(isEdit && { service_id: parseInt(id!) }), // Include service_id for update
        service_name: config.title,
        category_id: selectedCategory?.category_id || null,
        service_description: config.description,
        approval_level: 1, // Default approval level
        image_url: "", // you can add this from an image uploader
        nav_link: config.url.replace(/^\/+/, ''), // remove leading slash
        active: 1,
        team_id: null, // or set from admin UI later
        api_endpoint: config.apiEndpoint,
        form_json: config, // Send the full config object - API will stringify it
        m_workflow_groups: selectedWorkflowGroup // Use selected workflow group
      };

      console.log('Saving payload:', payload);

      const response = await axios.post(`${API_URL}/hots_settings/insertupdate/service_catalog`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        }
      });

      console.log("SAVE SUCCESS:", response.data);

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
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Form'}
            </Button>
          </div>
        </div>

        {/* Field count warning */}
        {config.fields && config.fields.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Database Mapping:</strong> {config.fields.length} of {getMaxFormFields()} fields used
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Fields will be mapped to cstm_col1-{config.fields.length} and lbl_col1-{config.fields.length}
                  </p>
                </div>
                {config.fields.length >= getMaxFormFields() && (
                  <div className="text-red-600 text-sm font-medium">
                    ⚠️ Maximum field limit reached
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
