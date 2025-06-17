
import React, { useEffect, useState } from 'react';
import { DynamicForm } from './DynamicForm';
import { FormSkeleton } from '@/components/ui/FormSkeleton';
import { useCatalogData } from '@/hooks/useCatalogData';
import { FormConfig } from '@/types/formTypes';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CatalogFormLoaderProps {
  servicePath: string;
  onSubmit: (data: any) => void;
}

export const CatalogFormLoader: React.FC<CatalogFormLoaderProps> = ({ servicePath, onSubmit }) => {
  const navigate = useNavigate();
  const { serviceCatalog, categoryList, isLoading: catalogLoading, fetchData } = useCatalogData();
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceInfo, setServiceInfo] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!catalogLoading && serviceCatalog.length > 0) {
      const service = serviceCatalog.find(s => s.nav_link === servicePath);
      
      if (!service) {
        setError(`Service not found for path: ${servicePath}`);
        setIsLoading(false);
        return;
      }

      setServiceInfo(service);

      if (service.form_json && service.form_json.trim() !== '') {
        try {
          const parsedConfig = JSON.parse(service.form_json);
          setFormConfig(parsedConfig);
          setError(null);
        } catch (parseError) {
          console.error(`Failed to parse form_json for service ${service.service_id}:`, parseError);
          setError('Invalid form configuration');
        }
      } else {
        setError('No form configuration available');
      }
      
      setIsLoading(false);
    }
  }, [catalogLoading, serviceCatalog, servicePath]);

  const getCategoryIcon = (categoryId: number) => {
    const category = categoryList.find(cat => cat.category_id === categoryId);
    const iconMap: { [key: string]: string } = {
      'Hardware': '💻',
      'Software': '💾',
      'Support': '🛠️',
      'HRGA': '👥',
      'Marketing': '📢'
    };
    return iconMap[category?.category_name || ''] || '📋';
  };

  const getCategoryColor = (categoryId: number) => {
    const category = categoryList.find(cat => cat.category_id === categoryId);
    const colorMap: { [key: string]: string } = {
      'Hardware': 'bg-blue-100 text-blue-800',
      'Software': 'bg-green-100 text-green-800',
      'Support': 'bg-orange-100 text-orange-800',
      'HRGA': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-pink-100 text-pink-800'
    };
    return colorMap[category?.category_name || ''] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryName = (categoryId: number) => {
    const category = categoryList.find(cat => cat.category_id === categoryId);
    return category?.category_name || 'Unknown';
  };

  if (isLoading || catalogLoading) {
    return <FormSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/service-catalog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Catalog
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/service-catalog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Service Catalog
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Form configuration not available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/service-catalog')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Service Catalog
        </Button>
        {serviceInfo && (
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(serviceInfo.category_id)}`}>
            <span className="mr-2">{getCategoryIcon(serviceInfo.category_id)}</span>
            {getCategoryName(serviceInfo.category_id)} - {serviceInfo.service_name}
          </div>
        )}
      </div>
      <DynamicForm config={formConfig} onSubmit={onSubmit} />
    </div>
  );
};
