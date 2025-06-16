
import React, { useEffect, useState } from 'react';
import { DynamicForm } from './DynamicForm';
import { FormSkeleton } from '@/components/ui/FormSkeleton';
import { useCatalogData } from '@/hooks/useCatalogData';
import { FormConfig } from '@/types/formTypes';
import { useParams } from 'react-router-dom';

interface CatalogFormLoaderProps {
  servicePath: string;
  onSubmit: (data: any) => void;
}

export const CatalogFormLoader: React.FC<CatalogFormLoaderProps> = ({ servicePath, onSubmit }) => {
  const { serviceCatalog, isLoading: catalogLoading, fetchData } = useCatalogData();
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading || catalogLoading) {
    return <FormSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Form configuration not available</div>
      </div>
    );
  }

  return <DynamicForm config={formConfig} onSubmit={onSubmit} />;
};
