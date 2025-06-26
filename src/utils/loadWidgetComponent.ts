
import React, { lazy, ComponentType } from 'react';
import { WidgetProps } from '@/types/widgetTypes';

// Dynamic widget loader with error handling
export const loadWidgetComponent = async (componentPath: string): Promise<ComponentType<WidgetProps>> => {
  try {
    // Remove leading slash if present
    const cleanPath = componentPath.startsWith('/') ? componentPath.slice(1) : componentPath;
    
    // Dynamic import with proper error handling
    const module = await import(`../${cleanPath}`);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load widget component: ${componentPath}`, error);
    
    // Return a fallback error component
    return ({ widgetName }: WidgetProps) => {
      return React.createElement('div', {
        className: 'p-4 border border-red-200 rounded-lg bg-red-50'
      }, React.createElement('p', {
        className: 'text-red-600 text-sm'
      }, `Failed to load widget: ${widgetName || componentPath}`));
    };
  }
};

// Create lazy-loaded widget component
export const createLazyWidget = (componentPath: string) => {
  return lazy(() => loadWidgetComponent(componentPath).then(component => ({ default: component })));
};
