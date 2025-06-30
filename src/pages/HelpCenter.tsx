
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { Search, BookOpen, Video, FileText, MessageCircle, Star, Clock, Users, ArrowRight, HelpCircle, CheckSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const popularArticles = [
    {
      title: "How to Submit a Service Request",
      description: "Learn how to create and submit service requests through the system",
      category: "Getting Started",
      readTime: "3 min",
      rating: 4.8,
      views: 1250
    },
    {
      title: "Understanding Approval Workflows",
      description: "Guide to understanding how approval processes work in the system",
      category: "Workflows",
      readTime: "5 min",
      rating: 4.6,
      views: 890
    },
    {
      title: "Managing Your Tickets",
      description: "How to track, update, and manage your submitted tickets",
      category: "Ticket Management",
      readTime: "4 min",
      rating: 4.9,
      views: 1100
    },
    {
      title: "File Upload Guidelines",
      description: "Best practices for uploading files and attachments",
      category: "Files & Attachments",
      readTime: "2 min",
      rating: 4.5,
      views: 670
    }
  ];

  const categories = [
    {
      name: "Getting Started",
      description: "Basic guides to help you get up and running",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-700",
      articleCount: 12
    },
    {
      name: "Service Requests",  
      description: "Everything about creating and managing service requests",
      icon: FileText,
      color: "bg-green-100 text-green-700",
      articleCount: 18
    },
    {
      name: "Approval Workflows",
      description: "Understanding approval processes and workflows",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
      articleCount: 8
    },
    {
      name: "Troubleshooting",
      description: "Common issues and how to resolve them",
      icon: MessageCircle,
      color: "bg-orange-100 text-orange-700",
      articleCount: 15
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers, guides, and support for all your questions</p>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or tutorials..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">User Guides</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I submit a new service request?</AccordionTrigger>
                    <AccordionContent>
                      Go to the Service Catalog, select the service you need, fill out the required form fields, and click Submit. You'll receive a confirmation with your ticket number.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How can I track my requests?</AccordionTrigger>
                    <AccordionContent>
                      Visit the "My Tickets" page to see all your submitted requests, their current status, and any updates from the support team.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>What do the different ticket statuses mean?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Pending</Badge>
                          <span className="text-sm">Request submitted, waiting for review</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">In Progress</Badge>
                          <span className="text-sm">Being worked on by support team</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Waiting for Approval</Badge>
                          <span className="text-sm">Requires manager approval</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Rejected</Badge>
                          <span className="text-sm">Request denied with reason</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How do I approve requests in my task list?</AccordionTrigger>
                    <AccordionContent>
                      Check your Task List for pending approvals. Click on any item to review details, then use the Approve/Reject buttons. You can add comments to explain your decision.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Can I edit a request after submitting?</AccordionTrigger>
                    <AccordionContent>
                      Once submitted, requests cannot be edited directly. If changes are needed, contact the support team through the ticket comments or submit a new request.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularArticles.map((article, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">{article.category}</Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">{article.title}</h3>
                    <p className="text-gray-600 mb-4">{article.description}</p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {article.rating}
                      </div>
                      <div>{article.views} views</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                      <category.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-2 text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <div className="text-sm text-blue-600">{category.articleCount} articles</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Quick Start Guide",
                  duration: "5:32",
                  description: "Get started with the service portal in 5 minutes"
                },
                {
                  title: "Advanced Form Features",
                  duration: "8:15",
                  description: "Learn about advanced form features and customizations"
                },
                {
                  title: "Admin Panel Overview",
                  duration: "12:45",
                  description: "Complete overview of the admin panel functionality"
                }
              ].map((video, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Video className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {video.duration}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-gray-800">{video.title}</h3>
                    <p className="text-sm text-gray-600">{video.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Still need help?</h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help you.
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Contact Support</Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">Schedule a Call</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HelpCenter;
