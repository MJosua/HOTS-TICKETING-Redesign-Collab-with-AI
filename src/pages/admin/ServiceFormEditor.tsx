
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FormConfig } from '@/types/formTypes';
import { ModernFormBuilder } from '@/components/forms/ModernFormBuilder';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchWorkflowGroups } from '@/store/slices/userManagementSlice';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { useToast } from '@/hooks/use-toast';

const ServiceFormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isEdit = !!id;
  const { categoryList, serviceCatalog } = useCatalogData();
  const { workflowGroups } = useAppSelector(state => state.userManagement);
  const { toast } = useToast();

  const [config, setConfig] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch workflow groups on component mount
  useEffect(() => {
    dispatch(fetchWorkflowGroups());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && id && serviceCatalog.length > 0) {
      // Find the service by ID
      const serviceData = serviceCatalog.find(service => service.service_id.toString() === id);

      if (serviceData) {
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
          sections: [],
          servis_aktif: Number(serviceData.active) ?? 0,
          active: Number(serviceData.active) ?? 0,
          m_workflow_groups: serviceData.m_workflow_groups?.toString(),
          metadata: {
            version: '2.0',
            fieldCount: 0,
            maxFields: 16
          }
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
              category: categoryName,
              m_workflow_groups: serviceData.m_workflow_groups?.toString(),
            };
          } catch (error) {
            console.error('Failed to parse form_json:', error);
            // Use default structure if JSON is invalid
          }
        }

        setConfig(parsedConfig);
      } else {
        console.warn('Service not found for ID:', id);
      }
    } else if (!isEdit) {
      // For new services, create empty config
      setConfig({
        title: '',
        url: '',
        description: '',
        sections: [],
        metadata: {
          version: '2.0',
          fieldCount: 0,
          maxFields: 16
        }
      });
    }
  }, [isEdit, id, serviceCatalog, categoryList]);

  const handleSave = async (formConfig: FormConfig) => {
    setIsLoading(true);

    try {
      console.log('Saving form config:', formConfig);

      // Find category_id from category name
      const selectedCategory = categoryList.find(c => c.category_name === formConfig.category);

      // Build full service catalog object
      const payload = {
        ...(isEdit && { service_id: parseInt(id!) }),
        service_name: formConfig.title,
        category_id: selectedCategory?.category_id || null,
        service_description: formConfig.description,
        approval_level: 1,
        image_url: "",
        nav_link: formConfig.url.replace(/^\/+/, ''),
        active: 1,
        team_id: null,
        api_endpoint: formConfig.apiEndpoint,
        form_json: formConfig,
        m_workflow_groups: formConfig.m_workflow_groups ? parseInt(formConfig.m_workflow_groups) : null
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

  if (!config) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col">
        <div className="border-b p-4 flex items-center gap-4 bg-white">
          <Button variant="outline" onClick={() => navigate('/admin/service-catalog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Catalog
          </Button>
          <h1 className="text-xl font-semibold">
            {isEdit ? 'Edit' : 'Create'} Service Form
          </h1>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ModernFormBuilder
            initialConfig={config}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default ServiceFormEditor;
