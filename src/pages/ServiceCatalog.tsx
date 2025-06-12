
import React from 'react';
import { Monitor, Lightbulb, Wrench, Database, Plane, FileText, Users, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const serviceCategories = [
  {
    title: "Hardware",
    icon: Monitor,
    color: "bg-orange-100 text-orange-600",
    services: [
      {
        title: "PC/Notebook Request",
        description: "Request a new or replacement computer/laptop",
        icon: Monitor,
        url: "/asset-request"
      },
      {
        title: "Idea Bank",
        description: "Submit and share your suggestions for improvement",
        icon: Lightbulb,
        url: "/idea-bank"
      }
    ]
  },
  {
    title: "Support",
    icon: Wrench,
    color: "bg-blue-100 text-blue-600",
    services: [
      {
        title: "IT Technical Support",
        description: "Get help with IT issues from our technical team",
        icon: Wrench,
        url: "/it-support"
      },
      {
        title: "Data Revision and Update Request",
        description: "Request updates or revisions to system data",
        icon: Database,
        url: "/data-revision"
      }
    ]
  },
  {
    title: "HRGA",
    icon: Users,
    color: "bg-green-100 text-green-600",
    services: [
      {
        title: "Business Trip Form",
        description: "Request approval for a business trip",
        icon: Plane,
        url: "/business-trip"
      },
      {
        title: "Travel Expense Settlement",
        description: "Submit post-trip expenses for reimbursement",
        icon: CreditCard,
        url: "/travel-expense"
      },
      {
        title: "New Employee Request",
        description: "Request new employee resource allocation",
        icon: Users,
        url: "/new-employee"
      },
      {
        title: "Sample Request Form",
        description: "Request product samples for testing or demo",
        icon: FileText,
        url: "/sample-request"
      }
    ]
  },
  {
    title: "Operations",
    icon: FileText,
    color: "bg-purple-100 text-purple-600",
    services: [
      {
        title: "Surat Permintaan Barang",
        description: "Request goods and materials for operations",
        icon: FileText,
        url: "/goods-request"
      }
    ]
  }
];

const ServiceCatalog = () => {
  return (
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
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <service.icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2">
                          {service.title}
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
                      onClick={() => window.location.href = service.url}
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
  );
};

export default ServiceCatalog;
