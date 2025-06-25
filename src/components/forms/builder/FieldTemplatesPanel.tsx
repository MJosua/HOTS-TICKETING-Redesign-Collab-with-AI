
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField, FormSection, FieldTemplate } from '@/types/formTypes';
import { Plus, User, Mail, Phone, Calendar, FileText, Hash, DollarSign } from 'lucide-react';

interface FieldTemplatesPanelProps {
  onAddField: (sectionId: string, field: FormField) => void;
  sections: FormSection[];
}

const fieldTemplates: FieldTemplate[] = [
  {
    id: 'text-name',
    name: 'Full Name',
    description: 'Standard name input field',
    icon: 'User',
    field: {
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter full name',
      columnSpan: 2
    }
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Email input with validation',
    icon: 'Mail',
    field: {
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'example@company.com',
      columnSpan: 2
    }
  },
  {
    id: 'phone',
    name: 'Phone',
    description: 'Phone number input',
    icon: 'Phone',
    field: {
      label: 'Phone Number',
      type: 'tel',
      required: false,
      placeholder: '+1 (555) 123-4567',
      columnSpan: 1
    }
  },
  {
    id: 'date',
    name: 'Date',
    description: 'Date picker field',
    icon: 'Calendar',
    field: {
      label: 'Date',
      type: 'date',
      required: false,
      columnSpan: 1
    }
  },
  {
    id: 'textarea',
    name: 'Description',
    description: 'Multi-line text area',
    icon: 'FileText',
    field: {
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Enter description...',
      columnSpan: 3
    }
  },
  {
    id: 'number',
    name: 'Number',
    description: 'Numeric input field',
    icon: 'Hash',
    field: {
      label: 'Quantity',
      type: 'number',
      required: false,
      placeholder: '0',
      columnSpan: 1
    }
  },
  {
    id: 'currency',
    name: 'Currency',
    description: 'Money/price input',
    icon: 'DollarSign',
    field: {
      label: 'Amount',
      type: 'number',
      required: false,
      placeholder: '0.00',
      columnSpan: 1
    }
  }
];

const getIcon = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    User: <User className="w-4 h-4" />,
    Mail: <Mail className="w-4 h-4" />,
    Phone: <Phone className="w-4 h-4" />,
    Calendar: <Calendar className="w-4 h-4" />,
    FileText: <FileText className="w-4 h-4" />,
    Hash: <Hash className="w-4 h-4" />,
    DollarSign: <DollarSign className="w-4 h-4" />
  };
  return icons[iconName] || <FileText className="w-4 h-4" />;
};

export const FieldTemplatesPanel: React.FC<FieldTemplatesPanelProps> = ({
  onAddField,
  sections
}) => {
  const [selectedSection, setSelectedSection] = React.useState<string>('');

  const addFieldToSection = (template: FieldTemplate) => {
    if (!selectedSection) return;

    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: template.field.label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      ...template.field
    };

    onAddField(selectedSection, newField);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h2 className="text-lg font-semibold mb-4">Field Templates</h2>
        
        {sections.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Add to Section:</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a section...</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {fieldTemplates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-md">
                    {getIcon(template.icon)}
                  </div>
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => addFieldToSection(template)}
                  disabled={!selectedSection}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">Create a section first to add field templates.</p>
        </div>
      )}
    </div>
  );
};
