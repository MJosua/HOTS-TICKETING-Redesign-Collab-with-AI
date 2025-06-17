import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FormConfig } from '@/types/formTypes';
import { ServiceCatalogItem } from '@/store/slices/catalogSlice';

interface ServiceCatalogTableProps {
  forms: FormConfig[];
  serviceCatalog: ServiceCatalogItem[];
  onEdit: (formId: string) => void;
  onDelete: (formId: string) => void;
  onReload: () => void;
  isDeleting: boolean;
  isReloading: boolean;
}

export const ServiceCatalogTable: React.FC<ServiceCatalogTableProps> = ({
  forms,
  serviceCatalog,
  onEdit,
  onDelete,
  onReload,
  isDeleting,
  isReloading
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Service Forms ({forms.length})</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onReload} 
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
            {forms.map((form) => {
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
                        onClick={() => onEdit(form.id!)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(form.id!)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onReload}
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
  );
};
