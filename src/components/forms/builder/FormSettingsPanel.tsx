
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormConfig } from '@/types/formTypes';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useAppSelector } from '@/hooks/useAppSelector';

interface FormSettingsPanelProps {
  config: FormConfig;
  onUpdate: (config: FormConfig) => void;
}

export const FormSettingsPanel: React.FC<FormSettingsPanelProps> = ({
  config,
  onUpdate
}) => {
  const { categoryList } = useCatalogData();
  const { workflowGroups } = useAppSelector(state => state.userManagement);

  const updateConfig = (updates: Partial<FormConfig>) => {
    onUpdate({ ...config, ...updates });
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Hardware': '💻',
      'Software': '💾',
      'Support': '🛠️',
      'HRGA': '👥',
      'Marketing': '📢'
    };
    return iconMap[categoryName] || '📋';
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Form Title *</Label>
            <Input
              id="title"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              placeholder="e.g., IT Support Request"
            />
          </div>

          <div>
            <Label htmlFor="url">URL Path *</Label>
            <Input
              id="url"
              value={config.url}
              onChange={(e) => updateConfig({ url: e.target.value })}
              placeholder="e.g., /it-support"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description || ''}
              onChange={(e) => updateConfig({ description: e.target.value })}
              placeholder="Brief description of the form"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={config.category} 
              onValueChange={(value) => updateConfig({ category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryList.map((category) => (
                  <SelectItem key={category.category_id} value={category.category_name}>
                    <span className="mr-2">{getCategoryIcon(category.category_name)}</span>
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="apiEndpoint">API Endpoint</Label>
            <Input
              id="apiEndpoint"
              value={config.apiEndpoint || ''}
              onChange={(e) => updateConfig({ apiEndpoint: e.target.value })}
              placeholder="e.g., /api/it-support"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workflowGroup">Workflow Group *</Label>
            <Select
              value={config.m_workflow_groups?.toString() || ''}
              onValueChange={(value) => updateConfig({ m_workflow_groups: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workflow group" />
              </SelectTrigger>
              <SelectContent>
                {workflowGroups
                  .filter(wg => wg.is_active)
                  .map((workflowGroup) => (
                    <SelectItem key={workflowGroup.id} value={workflowGroup.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{workflowGroup.name}</span>
                        <span className="text-sm text-gray-500">{workflowGroup.description}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {config.approval && (
            <div className="space-y-2">
              <Label>Approval Mode</Label>
              <Select
                value={config.approval.mode}
                onValueChange={(value: 'sequential' | 'parallel') => 
                  updateConfig({ 
                    approval: { ...config.approval!, mode: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Version:</span>
            <span className="font-mono">{config.metadata?.version || '1.0'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Field Count:</span>
            <span className={`font-mono ${
              (config.metadata?.fieldCount || 0) >= (config.metadata?.maxFields || 16) 
                ? 'text-red-600' 
                : 'text-green-600'
            }`}>
              {config.metadata?.fieldCount || 0} / {config.metadata?.maxFields || 16}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Sections:</span>
            <span className="font-mono">{config.sections?.length || 0}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
