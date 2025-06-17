import React from 'react';
import { Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CatalogFormLoader } from '@/components/forms/CatalogFormLoader';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useCatalogData } from '@/hooks/useCatalogData';

interface DynamicServiceRoutesProps {
  onSubmit: (data: any) => void;
}

export const useDynamicServiceRoutes = (onSubmit: (data: any) => void) => {
  const { serviceCatalog, isLoading } = useCatalogData();

  // Don't render routes while loading
  if (isLoading) {
    return [];
  }

  // Filter active services that have valid nav_link
  const activeServices = serviceCatalog.filter(
    service => service.active === 1 && service.nav_link && service.nav_link.trim() !== ''
  );

  return activeServices.map((service) => (
    <Route
      key={service.service_id}
      path={`/service-catalog/${service.nav_link}`}
      element={
        <ProtectedRoute>
          <AppLayout>
            <CatalogFormLoader
              servicePath={service.nav_link}
              onSubmit={onSubmit}
            />
          </AppLayout>
        </ProtectedRoute>
      }
    />
  ));
};

// Keep the original component for backward compatibility but mark it as deprecated
export const DynamicServiceRoutes: React.FC<DynamicServiceRoutesProps> = ({ onSubmit }) => {
  const routes = useDynamicServiceRoutes(onSubmit);
  return <React.Fragment>{routes}</React.Fragment>;
};
