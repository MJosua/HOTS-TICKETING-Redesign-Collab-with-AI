
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormConfig } from '@/types/formTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ServiceCatalogAdmin = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockForms: FormConfig[] = [
      {
        id: '1',
        title: 'IT Support Request',
        url: '/it-support',
        category: 'Support',
        description: 'Request IT technical support',
        apiEndpoint: '/api/it-support',
        approval: { steps: ['Supervisor', 'IT Team'], mode: 'sequential' },
        fields: [
          { label: 'Type of Support', type: 'select', options: ['Hardware', 'Software', 'Account'], required: true },
          { label: 'Issue Description', type: 'textarea', required: true }
        ]
      },
      {
        id: '2',
        title: 'Asset Request',
        url: '/asset-request', 
        category: 'Hardware',
        description: 'Request laptop or other assets',
        apiEndpoint: '/api/asset-request',
        approval: { steps: ['Manager', 'IT Head'], mode: 'sequential' },
        fields: [
          { label: 'Asset Type', type: 'select', options: ['Laptop', 'Desktop', 'Monitor'], required: true },
          { label: 'Justification', type: 'textarea', required: true }
        ]
      }
    ];
    setForms(mockForms);
  }, []);

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (formId: string) => {
    navigate(`/admin/service-catalog/edit/${formId}`);
  };

  const handleDelete = (formId: string) => {
    setForms(forms.filter(form => form.id !== formId));
  };

  const handleCreate = () => {
    navigate('/admin/service-catalog/create');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Catalog Admin</h1>
            <p className="text-gray-600">Manage dynamic service forms and their configurations</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Form
          </Button>
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
            <CardTitle>Service Forms ({filteredForms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>API Endpoint</TableHead>
                  <TableHead>Approval Steps</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{form.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{form.url}</TableCell>
                    <TableCell className="font-mono text-sm">{form.apiEndpoint}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {form.approval?.steps.map((step, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {step}
                          </Badge>
                        ))}
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
                          onClick={() => handleDelete(form.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ServiceCatalogAdmin;
