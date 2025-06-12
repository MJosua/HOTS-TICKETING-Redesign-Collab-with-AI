
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarContent, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, CheckSquare, X, Send, Calendar, User, DollarSign } from 'lucide-react';
import ProgressionBar from "@/components/ui/ProgressionBar";
import RejectModal from "@/components/modals/RejectModal";

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Mock data - in real app would fetch based on ID
  const ticket = {
    id: "SPB-2024-001",
    type: "Surat Permintaan Barang",
    requester: "Ahmad Rahman",
    department: "Produksi",
    priority: "High",
    created: "2024-06-10",
    amount: "Rp 2,500,000",
    status: "Pending Approval",
    description: "Request for additional raw materials for production line 3. We need to increase capacity for upcoming orders.",
    items: [
      { name: "Raw Material A", quantity: 100, unit: "kg", price: "Rp 15,000" },
      { name: "Raw Material B", quantity: 50, unit: "kg", price: "Rp 25,000" },
      { name: "Packaging Material", quantity: 1000, unit: "pcs", price: "Rp 2,500" }
    ],
    approvalSteps: [
      { id: '1', name: 'Supervisor', status: 'approved' as const, date: '2024-06-10' },
      { id: '2', name: 'Manager', status: 'pending' as const },
      { id: '3', name: 'Director', status: 'waiting' as const },
    ]
  };

  const chatMessages = [
    { id: 1, user: "Ahmad Rahman", message: "I need this urgently for production", time: "10:30", isRequester: true },
    { id: 2, user: "Supervisor", message: "Approved from my end. The quantities look reasonable.", time: "11:45", isRequester: false },
    { id: 3, user: "Ahmad Rahman", message: "Thank you! When can I expect the final approval?", time: "12:00", isRequester: true }
  ];

  const handleApprove = () => {
    console.log('Approved ticket:', id);
    // Handle approval logic
  };

  const handleReject = (reason: string) => {
    console.log('Rejected ticket:', id, 'Reason:', reason);
    // Handle rejection logic
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      console.log('Sending message:', chatMessage);
      setChatMessage('');
      // Handle sending chat message
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{ticket.id}</h1>
              <p className="text-gray-600">{ticket.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckSquare className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectModalOpen(true)}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Information */}
            <Card className="bg-white shadow-sm border">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg">Request Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Requester</p>
                      <p className="font-medium">{ticket.requester}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Created Date</p>
                      <p className="font-medium">{ticket.created}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">{ticket.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Items Requested */}
            <Card className="bg-white shadow-sm border">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Items Requested</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ticket.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-gray-700">{item.quantity}</td>
                          <td className="px-6 py-4 text-gray-700">{item.unit}</td>
                          <td className="px-6 py-4 text-gray-700">{item.price}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {new Intl.NumberFormat('id-ID', { 
                              style: 'currency', 
                              currency: 'IDR' 
                            }).format(item.quantity * parseInt(item.price.replace(/[^\d]/g, '')))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-6 py-4 font-bold text-right">Total Amount:</td>
                        <td className="px-6 py-4 font-bold text-lg">{ticket.amount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approval Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressionBar steps={ticket.approvalSteps} className="flex-col space-y-4 space-x-0" />
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Discussion</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isRequester ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        msg.isRequester 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-xs font-medium mb-1">{msg.user}</p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-75 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Textarea
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[40px] max-h-[120px]"
                      rows={1}
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onReject={handleReject}
      />
    </AppLayout>
  );
};

export default TicketDetail;
