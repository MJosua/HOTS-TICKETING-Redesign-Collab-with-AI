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

  console.log('useDynamicServiceRoutes - isLoading:', isLoading);
  console.log('useDynamicServiceRoutes - serviceCatalog:', serviceCatalog);

  // Return empty array while loading to avoid issues
  if (isLoading) {
    console.log('Still loading, returning empty routes array');
    return [];
  }

  // Filter active services that have valid nav_link
  const activeServices = serviceCatalog.filter(
    service => service.active === 1 && service.nav_link && service.nav_link.trim() !== ''
  );

  console.log('Active services for routing:', activeServices);

  const routes = activeServices.map((service) => {
    console.log(`Creating route for service: ${service.service_name} with nav_link: ${service.nav_link}`);
    return (
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
    );
  });

  console.log('Generated routes count:', routes.length);
  return routes;
};

// Keep the original component for backward compatibility but mark it as deprecated
export const DynamicServiceRoutes: React.FC<DynamicServiceRoutesProps> = ({ onSubmit }) => {
  const routes = useDynamicServiceRoutes(onSubmit);
  return <React.Fragment>{routes}</React.Fragment>;
};
