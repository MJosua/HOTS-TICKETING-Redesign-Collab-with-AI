import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { Plus, Edit, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormConfig } from '@/types/formTypes';
import { useCatalogData } from '@/hooks/useCatalogData';
import { FormSkeleton } from '@/components/ui/FormSkeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { useToast } from '@/hooks/use-toast';

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

  // Fetch real data from API on component mount
  useEffect(() => {
    fetchData();
  }, []);

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
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      console.log('Deleting service with ID:', deleteModal.serviceId);
      
      const response = await axios.delete(`${API_URL}/hots_settings/delete/${deleteModal.serviceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        }
      });

      console.log('Delete response:', response.data);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Catalog Admin</h1>
              <p className="text-gray-600">Manage dynamic service forms and their configurations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleReload} 
              disabled={isReloading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
              Reload
            </Button>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Form
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Search</CardTitle>
            <Input
              placeholder="Search forms by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Service Forms ({filteredForms.length})</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReload} 
                disabled={isReloading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-3 h-3 ${isReloading ? 'animate-spin' : ''}`} />
                Reload
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Form Status</TableHead>
                  <TableHead>Approval Steps</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => {
                  const service = serviceCatalog.find(s => s.service_id.toString() === form.id);
                  const hasFormJson = service?.form_json && service.form_json.trim() !== '';
                  
                  return (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{form.category}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{form.url}</TableCell>
                      <TableCell>
                        <Badge variant={hasFormJson ? "default" : "outline"}>
                          {hasFormJson ? "JSON Config" : "Default Form"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {form.approval?.steps.map((step, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {step}
                            </Badge>
                          ))}
                          {form.approval?.steps.length === 0 && (
                            <Badge variant="outline" className="text-xs">No Approval</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(form.id!)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(form.id!)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleReload}
                            disabled={isReloading}
                          >
                            <RefreshCw className={`w-3 h-3 ${isReloading ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AlertDialog open={deleteModal.isOpen} onOpenChange={handleDeleteCancel}>
          <AlertDialogContent className="bg-white border border-gray-200 shadow-lg z-50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Delete Service Catalog</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete "<strong>{deleteModal.serviceName}</strong>"? This action cannot be undone and will remove the service form and all its configurations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
              <AlertDialogCancel onClick={handleDeleteCancel} className="bg-white border-gray-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm} 
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default ServiceCatalogAdmin;
