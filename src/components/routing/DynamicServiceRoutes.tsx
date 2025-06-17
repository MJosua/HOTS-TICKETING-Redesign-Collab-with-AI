
import React, { useEffect, useMemo } from 'react';
import { Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CatalogFormLoader } from '@/components/forms/CatalogFormLoader';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchCatalogData, selectServiceCatalog, selectCatalogLoading } from '@/store/slices/catalogSlice';

interface DynamicServiceRoutesProps {
  onSubmit: (data: any) => void;
}

export const useDynamicServiceRoutes = (onSubmit: (data: any) => void) => {
  const dispatch = useAppDispatch();
  const serviceCatalog = useAppSelector(selectServiceCatalog);
  const isLoading = useAppSelector(selectCatalogLoading);

  // Only fetch data if the store is empty and we're not already loading
  useEffect(() => {
    if (serviceCatalog.length === 0 && !isLoading) {
      console.log('Fetching catalog data because store is empty');
      dispatch(fetchCatalogData());
    }
  }, [dispatch, serviceCatalog.length, isLoading]);

  // Memoize the routes to prevent unnecessary re-renders
  const routes = useMemo(() => {
    console.log('useDynamicServiceRoutes - Creating routes with:', {
      isLoading,
      serviceCatalogLength: serviceCatalog.length,
      serviceCatalog: serviceCatalog.slice(0, 3) // Log first 3 items only
    });

    // Return empty array while loading to avoid issues
    if (isLoading || serviceCatalog.length === 0) {
      console.log('Still loading or no data, returning empty routes array');
      return [];
    }

    // Filter active services that have valid nav_link
    const activeServices = serviceCatalog.filter(
      service => service.active === 1 && service.nav_link && service.nav_link.trim() !== ''
    );

    console.log('Active services for routing:', activeServices.map(s => ({ 
      id: s.service_id, 
      name: s.service_name, 
      nav_link: s.nav_link 
    })));

    const generatedRoutes = activeServices.map((service) => {
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

    console.log('Generated routes count:', generatedRoutes.length);
    return generatedRoutes;
  }, [serviceCatalog, isLoading, onSubmit]);

  return routes;
};

// Keep the original component for backward compatibility but mark it as deprecated
export const DynamicServiceRoutes: React.FC<DynamicServiceRoutesProps> = ({ onSubmit }) => {
  const routes = useDynamicServiceRoutes(onSubmit);
  return <React.Fragment>{routes}</React.Fragment>;
};
