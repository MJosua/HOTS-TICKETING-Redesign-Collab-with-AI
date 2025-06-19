
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, CheckSquare, X, Send, Calendar, User, DollarSign, Loader2 } from 'lucide-react';
import ProgressionBar from "@/components/ui/ProgressionBar";
import RejectModal from "@/components/modals/RejectModal";
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchTicketDetail, approveTicket, rejectTicket, clearTicketDetail } from '@/store/slices/ticketsSlice';
import { useToast } from '@/hooks/use-toast';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { ticketDetail, isLoadingDetail, detailError, isSubmitting } = useAppSelector(state => state.tickets);

  useEffect(() => {
    if (id) {
      dispatch(fetchTicketDetail(id));
    }
    
    return () => {
      dispatch(clearTicketDetail());
    };
  }, [dispatch, id]);

  const handleApprove = async () => {
    if (!ticketDetail || !id) return;

    const currentStep = ticketDetail.current_step || 1;
    
    try {
      await dispatch(approveTicket({ 
        ticketId: id, 
        approvalOrder: currentStep 
      })).unwrap();
      
      toast({
        title: "Success",
        description: "Ticket approved successfully!",
        variant: "default",
      });
      
      // Refresh ticket data
      dispatch(fetchTicketDetail(id));
    } catch (error: any) {
      toast({
        title: "Approval Error",
        description: error || "Failed to approve ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (reason: string) => {
    if (!ticketDetail || !id) return;

    const currentStep = ticketDetail.current_step || 1;
    
    try {
      await dispatch(rejectTicket({ 
        ticketId: id, 
        approvalOrder: currentStep,
        rejectionRemark: reason
      })).unwrap();
      
      toast({
        title: "Success",
        description: "Ticket rejected successfully!",
        variant: "default",
      });
      
      // Refresh ticket data
      dispatch(fetchTicketDetail(id));
    } catch (error: any) {
      toast({
        title: "Rejection Error",
        description: error || "Failed to reject ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement chat message sending
      console.log('Sending message:', chatMessage);
      setChatMessage('');
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

  const formatApprovalSteps = () => {
    if (!ticketDetail?.list_approval) return [];
    
    return ticketDetail.list_approval.map((approver, index) => ({
      id: `${approver.approver_id}-${index}`,
      name: approver.approver_name,
      status: approver.approval_status === 1 ? 'approved' as const : 
              approver.approval_status === 2 ? 'rejected' as const : 
              approver.approval_order === ticketDetail.current_step ? 'pending' as const :
              'waiting' as const,
      approver: approver.approver_name
    }));
  };

  if (isLoadingDetail) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading ticket details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (detailError || !ticketDetail) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <X className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Failed to Load Ticket</h2>
            <p className="text-muted-foreground">{detailError || 'Ticket not found'}</p>
            <Button onClick={() => navigate('/task-list')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const approvalSteps = formatApprovalSteps();

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
              <h1 className="text-2xl font-bold text-foreground">#{ticketDetail.ticket_id}</h1>
              <p className="text-muted-foreground">{ticketDetail.service_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleApprove} 
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckSquare className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectModalOpen(true)}
              className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50"
              disabled={isSubmitting}
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
            <Card className="bg-card shadow-sm border">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg">Request Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Requester</p>
                      <p className="font-medium">{ticketDetail.created_by_name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created Date</p>
                      <p className="font-medium">{new Date(ticketDetail.creation_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{ticketDetail.team_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge style={{ backgroundColor: ticketDetail.color, color: 'white' }}>
                      {ticketDetail.status}
                    </Badge>
                  </div>
                </div>
                
                {ticketDetail.reason && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-foreground bg-muted/50 p-3 rounded-md">{ticketDetail.reason}</p>
                  </div>
                )}

                {/* Custom Form Data */}
                {ticketDetail.custom_columns && Object.keys(ticketDetail.custom_columns).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Form Data</p>
                    <div className="bg-muted/50 p-3 rounded-md space-y-2">
                      {Object.entries(ticketDetail.custom_columns).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Files Attached */}
            {ticketDetail.files && ticketDetail.files.length > 0 && (
              <Card className="bg-card shadow-sm border">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="text-lg">Attached Files</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {ticketDetail.files.map((file) => (
                      <div key={file.upload_id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="font-medium">{file.filename}</span>
                        <span className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approval Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {approvalSteps.length > 0 ? (
                  <ProgressionBar steps={approvalSteps} showDetails={true} className="flex-col space-y-4 space-x-0" />
                ) : (
                  <p className="text-muted-foreground">No approval workflow</p>
                )}
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Discussion</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {ticketDetail.chat_messages && ticketDetail.chat_messages.length > 0 ? (
                    ticketDetail.chat_messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isRequester ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          msg.isRequester 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-foreground'
                        }`}>
                          <p className="text-xs font-medium mb-1">{msg.user}</p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-75 mt-1">{msg.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center">No messages yet</p>
                  )}
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
        taskId={ticketDetail.ticket_id.toString()}
      />
    </AppLayout>
  );
};

export default TicketDetail;
