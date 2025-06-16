
import React, { useState, useEffect } from 'react';
import { Monitor, Lightbulb, Wrench, Database, Plane, FileText, Users, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from '@/components/layout/AppLayout';
import { searchInObject } from '@/utils/searchUtils';
import { renderHighlightedText } from '@/utils/renderhighlight';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useNavigate } from 'react-router-dom';

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  'Hardware': Monitor,
  'Software': Database,
  'Support': Wrench,
  'HRGA': Users,
  'Marketing': FileText,
  'Operations': FileText,
};

// Color mapping for categories
const categoryColors: Record<string, string> = {
  'Hardware': 'bg-orange-100 text-orange-600',
  'Software': 'bg-purple-100 text-purple-600',
  'Support': 'bg-blue-100 text-blue-600',
  'HRGA': 'bg-green-100 text-green-600',
  'Marketing': 'bg-pink-100 text-pink-600',
  'Operations': 'bg-indigo-100 text-indigo-600',
};

// Service icon mapping
const serviceIcons: Record<string, any> = {
  'PC/Notebook Request': Monitor,
  'Idea Bank': Lightbulb,
  'IT Technical Support': Wrench,
  'Data Revision and Update Request': Database,
  'Business Trip Form': Plane,
  'Travel Expense Settlement': CreditCard,
  'New Employee Request': Users,
  'Sample Request Form': FileText,
  'Payment Advance Request': CreditCard,
};

const ServiceCatalog = () => {
  const [searchValue, setSearchValue] = useState('');
  
  const {
    serviceCatalog,
    categoryList,
    isLoading,
    error,
    initializeWithExampleData,
    getServicesByCategory,
    getCategoryName
  } = useCatalogData();

  // Initialize data on component mount
  useEffect(() => {
    if (serviceCatalog.length === 0 && categoryList.length === 0) {
      initializeWithExampleData();
      console.log("initializeWithExampleData",initializeWithExampleData)
    }
  }, []);

  // Group services by category for rendering
  const serviceCategories = categoryList.map(category => {
    const categoryServices = serviceCatalog.filter(service => 
      service.category_id === category.category_id && 
      service.active === 1 &&
      searchInObject(service, searchValue)
    );

    return {
      title: category.category_name,
      icon: categoryIcons[category.category_name] || FileText,
      color: categoryColors[category.category_name] || 'bg-gray-100 text-gray-600',
      services: categoryServices.map(service => ({
        title: service.service_name,
        description: service.service_description,
        icon: serviceIcons[service.service_name] || FileText,
        color: categoryColors[category.category_name] || 'bg-gray-100 text-gray-600',
        url: `/${service.nav_link}`
      }))
    };
  }).filter(category => category.services.length > 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading catalog...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading catalog: {error}</div>
        </div>
      </AppLayout>
    );
  }


  const navigate= useNavigate();  

  return (
    <AppLayout searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Search services...">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
            <p className="text-gray-600">Browse and request services available in HOTS</p>
          </div>
        </div>

        <div className="space-y-8">
          {serviceCategories.map((category) => (
            <div key={category.title}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.services.map((service) => (
                  <Card key={service.title} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <service.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2">
                            {renderHighlightedText(service.title, searchValue)}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/service-catalog${service.url}`)}
                      >
                        Request Service
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ServiceCatalog;
