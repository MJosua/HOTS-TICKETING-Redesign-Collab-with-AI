
import React, { Suspense, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createLazyWidget } from '@/utils/loadWidgetComponent';
import { WidgetConfig, WidgetProps } from '@/types/widgetTypes';

interface WidgetRendererProps {
  config: WidgetConfig;
  data?: WidgetProps;
  className?: string;
}

const WidgetSkeleton = () => (
  <Card className="mb-6">
    <CardContent className="p-6">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-32 w-full mb-4" />
      <div className="flex space-x-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </CardContent>
  </Card>
);

const WidgetError = ({ error, widgetName }: { error: string; widgetName: string }) => (
  <Alert className="mb-6 border-orange-200 bg-orange-50">
    <AlertDescription className="text-orange-800">
      Widget "{widgetName}" could not be loaded: {error}
    </AlertDescription>
  </Alert>
);

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  config,
  data = {},
  className = ""
}) => {
  const LazyWidget = useMemo(() => {
    try {
      return createLazyWidget(config.componentPath);
    } catch (error) {
      console.error(`Failed to create lazy widget for ${config.name}:`, error);
      return null;
    }
  }, [config.componentPath, config.name]);

  if (!LazyWidget) {
    return <WidgetError error="Component creation failed" widgetName={config.name} />;
  }

  const widgetProps: WidgetProps = {
    ...data,
    ...config.props,
    widgetId: config.id,
    widgetName: config.name,
  };

  return (
    <div className={`widget-container ${className}`} data-widget-id={config.id}>
      <Suspense fallback={<WidgetSkeleton />}>
        <LazyWidget {...widgetProps} />
      </Suspense>
    </div>
  );
};

export default WidgetRenderer;
