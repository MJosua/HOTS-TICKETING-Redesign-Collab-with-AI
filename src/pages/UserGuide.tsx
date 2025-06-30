
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, FileText, CheckSquare, MessageSquare, Clock } from 'lucide-react';

const UserGuide = () => {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">User Guide & Help</h1>
            <p className="text-muted-foreground">Everything you need to know about using HOTS</p>
          </div>
        </div>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="guide">Quick Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
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
                      <ul className="list-disc pl-6 space-y-1">
                        <li><Badge variant="secondary">Pending</Badge> - Request submitted, waiting for review</li>
                        <li><Badge variant="default">In Progress</Badge> - Being worked on by support team</li>
                        <li><Badge variant="outline">Waiting for Approval</Badge> - Requires manager approval</li>
                        <li><Badge variant="destructive">Rejected</Badge> - Request denied with reason</li>
                        <li><Badge variant="default">Completed</Badge> - Request fulfilled</li>
                      </ul>
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

          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Working with Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Creating a Ticket</h4>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to Service Catalog</li>
                    <li>Choose the appropriate service category</li>
                    <li>Fill all required fields (marked with *)</li>
                    <li>Attach any necessary files</li>
                    <li>Review your information and submit</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Ticket Details Page</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Status Timeline:</strong> See request progress</li>
                    <li><strong>Comments:</strong> Communicate with support team</li>
                    <li><strong>Attachments:</strong> View uploaded files</li>
                    <li><strong>Approval Flow:</strong> Track approval status</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Communication</h4>
                  <p>Use the comments section to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Provide additional information</li>
                    <li>Ask questions about your request</li>
                    <li>Respond to support team queries</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approval" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  Approval Process Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Understanding Approvals</h4>
                  <p>Some requests require approval from managers or department heads before processing. The approval workflow is automatic based on:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Request type and value</li>
                    <li>Your department and role</li>
                    <li>Company policies</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">For Approvers</h4>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Check your Task List regularly for pending approvals</li>
                    <li>Click on requests to review full details</li>
                    <li>Consider business impact and policy compliance</li>
                    <li>Approve or reject with clear comments</li>
                    <li>Escalate complex decisions if needed</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Approval Statuses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <Badge variant="secondary" className="mb-2">Pending</Badge>
                      <p className="text-sm">Waiting for approver action</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <Badge variant="default" className="mb-2">Approved</Badge>
                      <p className="text-sm">Request approved, processing continues</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <Badge variant="destructive" className="mb-2">Rejected</Badge>
                      <p className="text-sm">Request denied, see comments for reason</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <Badge variant="outline" className="mb-2">Escalated</Badge>
                      <p className="text-sm">Sent to higher authority</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  System Updates & News
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Latest Updates</h4>
                  <div className="space-y-3 mt-3">
                    <div className="border-l-2 border-blue-200 pl-4">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium">Widget System Enhancement</h5>
                        <Badge variant="outline">New</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Forms now support dynamic widgets for better user experience</p>
                      <p className="text-xs text-gray-500 mt-1">January 2025</p>
                    </div>
                    
                    <div className="border-l-2 border-green-200 pl-4">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium">Improved File Upload</h5>
                        <Badge variant="secondary">Updated</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Support for larger files and better preview functionality</p>
                      <p className="text-xs text-gray-500 mt-1">December 2024</p>
                    </div>
                    
                    <div className="border-l-2 border-orange-200 pl-4">
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium">Mobile Responsiveness</h5>
                        <Badge variant="outline">Enhanced</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Better mobile experience across all pages</p>
                      <p className="text-xs text-gray-500 mt-1">November 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Submit Request
                    </h4>
                    <ol className="text-sm space-y-1">
                      <li>1. Go to Service Catalog</li>
                      <li>2. Select service type</li>
                      <li>3. Fill required fields</li>
                      <li>4. Submit request</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      Handle Approvals
                    </h4>
                    <ol className="text-sm space-y-1">
                      <li>1. Check Task List</li>
                      <li>2. Review request details</li>
                      <li>3. Approve or reject</li>
                      <li>4. Add comments</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Track Progress
                    </h4>
                    <ol className="text-sm space-y-1">
                      <li>1. Visit My Tickets</li>
                      <li>2. Click on ticket</li>
                      <li>3. View status updates</li>
                      <li>4. Add comments if needed</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Get Help
                    </h4>
                    <ol className="text-sm space-y-1">
                      <li>1. Check this guide</li>
                      <li>2. Contact IT support</li>
                      <li>3. Ask your manager</li>
                      <li>4. Submit help request</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default UserGuide;
