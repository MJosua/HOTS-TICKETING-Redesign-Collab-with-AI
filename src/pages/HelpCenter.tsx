
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { Search, BookOpen, Video, FileText, MessageCircle, Star, Clock, Users, ArrowRight } from 'lucide-react';

const HelpCenter = () => {
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
      color: "bg-blue-100 text-blue-800",
      articleCount: 12
    },
    {
      name: "Service Requests",  
      description: "Everything about creating and managing service requests",
      icon: FileText,
      color: "bg-green-100 text-green-800",
      articleCount: 18
    },
    {
      name: "Approval Workflows",
      description: "Understanding approval processes and workflows",
      icon: Users,
      color: "bg-purple-100 text-purple-800",
      articleCount: 8
    },
    {
      name: "Troubleshooting",
      description: "Common issues and how to resolve them",
      icon: MessageCircle,
      color: "bg-orange-100 text-orange-800",
      articleCount: 15
    }
  ];

  const videoTutorials = [
    {
      title: "Quick Start Guide",
      duration: "5:32",
      thumbnail: "/placeholder.svg",
      description: "Get started with the service portal in 5 minutes"
    },
    {
      title: "Advanced Form Features",
      duration: "8:15",
      thumbnail: "/placeholder.svg",
      description: "Learn about advanced form features and customizations"
    },
    {
      title: "Admin Panel Overview",
      duration: "12:45",
      thumbnail: "/placeholder.svg",
      description: "Complete overview of the admin panel functionality"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers, guides, and support for all your questions</p>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or tutorials..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">User Guide</h3>
              <p className="text-sm text-gray-600">Complete user documentation</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Video className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600">Step-by-step video guides</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">API Documentation</h3>
              <p className="text-sm text-gray-600">Technical API references</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600">Get direct help from our team</p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Articles */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Popular Articles</h2>
            <Button variant="outline">
              View All Articles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {article.rating}
                    </div>
                    <div>{article.views} views</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <div className="text-sm text-blue-600">{category.articleCount} articles</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Video Tutorials</h2>
            <Button variant="outline">
              View All Videos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-t-lg">
                    <div className="bg-white bg-opacity-90 rounded-full p-3">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <p className="text-sm text-gray-600">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help you.
            </p>
            <div className="flex justify-center gap-4">
              <Button>Contact Support</Button>
              <Button variant="outline">Schedule a Call</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HelpCenter;
