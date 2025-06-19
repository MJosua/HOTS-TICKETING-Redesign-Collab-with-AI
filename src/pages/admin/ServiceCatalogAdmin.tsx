import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { FormConfig } from '@/types/formTypes';
import { useCatalogData } from '@/hooks/useCatalogData';
import { FormSkeleton } from '@/components/ui/FormSkeleton';
import { ServiceCatalogHeader } from '@/components/admin/ServiceCatalogHeader';
import { ServiceCatalogSearch } from '@/components/admin/ServiceCatalogSearch';
import { ServiceCatalogTable } from '@/components/admin/ServiceCatalogTable';
import { DeleteServiceDialog } from '@/components/admin/DeleteServiceDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchWorkflowGroups } from '@/store/slices/userManagementSlice';

const ServiceCatalogAdmin = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; serviceId: string; serviceName: string }>({
    isOpen: false,
    serviceId: '',
    serviceName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  
  const {
    serviceCatalog,
    categoryList,
    isLoading,
    error,
    fetchData
  } = useCatalogData();

  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // Fetch real data from API on component mount
  useEffect(() => {
    fetchData();
    // Also fetch workflow groups for the table display
    dispatch(fetchWorkflowGroups());
  }, [dispatch]);

  // Convert service catalog data to FormConfig format for display
  const forms: FormConfig[] = serviceCatalog.map(service => {
    // Try to parse form_json if it exists
    if (service.form_json) {
      try {
        const parsedConfig = JSON.parse(service.form_json);
        return {
          ...parsedConfig,
          id: service.service_id.toString(),
          category: categoryList.find(cat => cat.category_id === service.category_id)?.category_name || 'Unknown'
        };
      } catch (error) {
        console.error(`Failed to parse form_json for service ${service.service_id}:`, error);
      }
    }
    
    // Fallback to default form structure if form_json is not available or invalid
    return {
      id: service.service_id.toString(),
      title: service.service_name,
      url: `/${service.nav_link}`,
      category: categoryList.find(cat => cat.category_id === service.category_id)?.category_name || 'Unknown',
      description: service.service_description,
      apiEndpoint: `/api/${service.nav_link}`,
      approval: { 
        steps: service.approval_level > 0 ? ['Manager', 'Supervisor'] : [], 
        mode: 'sequential' as const 
      },
      fields: [
        { 
          label: 'Description', 
          name: 'description',
          type: 'textarea', 
          required: true 
        }
      ]
    };
  });

  const filteredForms = forms.filter(form =>
    form.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (formId: string) => {
    navigate(`/admin/service-catalog/edit/${formId}`);
  };

  const handleDeleteClick = (formId: string) => {
    const service = serviceCatalog.find(s => s.service_id.toString() === formId);
    if (service) {
      setDeleteModal({
        isOpen: true,
        serviceId: formId,
        serviceName: service.service_name
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.serviceId) return;
    
    setIsDeleting(true);
    
    try {
      // console.log('Deleting service with ID:', deleteModal.serviceId);
      
      const response = await axios.delete(`${API_URL}/hots_settings/delete/service/${deleteModal.serviceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        }
      });

      // console.log('Delete response:', response.data);

      toast({
        title: "Success",
        description: `Service "${deleteModal.serviceName}" has been deleted successfully`,
        variant: "default",
        duration: 3000
      });

      // Refresh the catalog data
      fetchData();
      
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete service",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, serviceId: '', serviceName: '' });
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await fetchData();
      toast({
        title: "Success",
        description: "Service catalog data refreshed successfully",
        variant: "default",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsReloading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/service-catalog/create');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')} disabled>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Service Catalog Admin</h1>
                <p className="text-gray-600">Manage dynamic service forms and their configurations</p>
              </div>
            </div>
            <Button disabled className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Form
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Form Search</CardTitle>
              <Input
                placeholder="Search forms by title or category..."
                disabled
              />
            </CardHeader>
          </Card>

          <FormSkeleton />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error loading catalog: {error}</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <ServiceCatalogHeader
          onReload={handleReload}
          onCreate={handleCreate}
          isReloading={isReloading}
        />

        <ServiceCatalogSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <ServiceCatalogTable
          forms={filteredForms}
          serviceCatalog={serviceCatalog}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onReload={handleReload}
          isDeleting={isDeleting}
          isReloading={isReloading}
        />

        <DeleteServiceDialog
          isOpen={deleteModal.isOpen}
          serviceName={deleteModal.serviceName}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </AppLayout>
  );
};

export default ServiceCatalogAdmin;
