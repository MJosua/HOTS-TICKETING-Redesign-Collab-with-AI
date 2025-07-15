import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, CheckSquare, X, Send, Calendar, User, DollarSign, Loader2, Download, Paperclip, PlaneIcon, Group, CheckCheck } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RejectModal from "@/components/modals/RejectModal";
import { FilePreview } from "@/components/ui/FilePreview";
import TaskApprovalActions from "@/components/ui/TaskApprovalActions";
import WidgetRenderer from "@/components/widgets/WidgetRenderer";
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchTicketDetail, approveTicket, rejectTicket, clearTicketDetail } from '@/store/slices/ticketsSlice';
import { fetchGeneratedDocuments, fetchFunctionLogs } from '@/store/slices/customFunctionSlice';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/sourceConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, FileText } from 'lucide-react';
import ExcelPreview from '@/components/ExcelPreview';
import TaskApprovalActionsSimple from '@/components/ui/TaskApprovalActionssimple';
import { WidgetConfig } from '@/types/widgetTypes';
import { getWidgetPresetById } from '@/models/widgets';
import { getWidgetById } from '@/registry/widgetRegistry';
import { CardCollapsible } from '@/components/ui/CardCollapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { SuggestionInsertInput } from '@/components/forms/SuggestionInsertInput';
import { fetchUsers } from '@/store/slices/userManagementSlice';
import { SuggestionInsertInputWrapper } from '@/components/forms/SuggestionInsertInputWrapper';
import axios from 'axios';
import { socket } from '@/lib/socket';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [refreshticketdetail, setRefreshticketdetail] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedToEmails, setSelectedToEmails] = useState<string[]>([]);
  const [selectedCcEmails, setSelectedCcEmails] = useState<string[]>([]);
  const [toInputValue, setToInputValue] = useState('');
  const [ccInputValue, setCcInputValue] = useState('');

  const { ticketDetail, isLoadingDetail, detailError, isSubmitting } = useAppSelector(state => state.tickets);



  useEffect(() => {
    if (ticketDetail) {
      if (ticketDetail?.service_id?.toString() === "6") {
        const toField = Array.isArray(ticketDetail.detail_rows)
          ? ticketDetail.detail_rows.find(
            (row) => row.lbl_col === "To" || row.order_col === 998
          )
          : null;

        if (toField?.cstm_col) {
          try {
            const parsed = JSON.parse(toField.cstm_col);
            if (Array.isArray(parsed)) {
              setSelectedToEmails(parsed);
            }
          } catch (err) {
            console.error("Failed to parse cstm_col as JSON:", err);
          }
        }
      }
    }
  }, [ticketDetail]);

  const { generatedDocuments, functionLogs, isLoading: isLoadingCustomFunction } = useAppSelector(state => state.customFunction);
  const { user } = useAppSelector(state => state.auth);
  const users = useAppSelector(state => state.userManagement.users);




  // Get assigned widgets for this ticket/service
  const assignedWidgets: WidgetConfig[] = useMemo(() => {
    if (!ticketDetail || !ticketDetail.service_id) return [];

    let ids: string[] = [];

    // Handle widget property safely - check if it exists
    const widgetData = (ticketDetail as any).widget;
    if (widgetData) {
      ids = Array.isArray(widgetData)
        ? widgetData
        : [widgetData];
    }

    return ids
      .map(getWidgetById)
      .filter((widget): widget is WidgetConfig => !!widget)
      .filter(widget => widget.applicableTo.includes('ticket_detail'));
  }, [ticketDetail]);

  console.log("assignedWidgets", assignedWidgets);

  useEffect(() => {
    if (id) {
      dispatch(fetchTicketDetail(id));
      dispatch(fetchGeneratedDocuments(parseInt(id)));
      dispatch(fetchFunctionLogs(parseInt(id)));
    }

    return () => {
      dispatch(clearTicketDetail());
    };
  }, [dispatch, id]);




  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

      dispatch(fetchTicketDetail(id));
    } catch (error: any) {
      toast({
        title: "Approval Error",
        description: error || "Failed to approve ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  console.log("ticketDetail", ticketDetail)

  useEffect(() => {
    if (ticketDetail) {
      if (ticketDetail?.service_id.toLocaleString() === "6") {
        try {
          const cstmCol = ticketDetail.detail_rows?.[0]?.cstm_col;
          if (cstmCol) {
            const parsed = JSON.parse(cstmCol);
            setSelectedToEmails(Array.isArray(parsed) ? parsed : []);
          }
        } catch (err) {
          console.error("Failed to parse cstm_col:", err);
          setSelectedToEmails([]);
        }
      }
    }
  }, [dispatch])

  const handleUpdateTicketDetail = async () => {
    if (!ticketDetail || !id) {

      console.log("!ticketDetail")
      return;
    }

    if (ticketDetail.service_id.toLocaleString() === "6") {
      const detailFields = [
        {
          cstm_col: JSON.stringify(selectedToEmails),
          lbl_col: "EmailTo",
          order_col: 998
        },
        {
          cstm_col: JSON.stringify(selectedCcEmails),
          lbl_col: "EmailCC",
          order_col: 999
        }
      ];

      try {
        const response = await fetch(`${API_URL}/hots_ticket/detail/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('tokek')}`
          },
          body: JSON.stringify({ detailFields })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update ticket detail');
        }

        toast({
          title: "Success",
          description: "Ticket detail updated successfully",
          variant: "default",
        });

        dispatch(fetchTicketDetail(id));
      } catch (error: any) {
        toast({
          title: "Update Error",
          description: error.message || "Failed to update ticket detail",
          variant: "destructive",
        });
      }
    }
  };

  const handleExecuteCustomFunction = async (functionId: number) => {
    if (!ticketDetail || !id) {
      console.log("!ticketDetail");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/hots_customfunction/execute/${functionId}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        },
        body: JSON.stringify({
          ticket_id: ticketDetail.ticket_id,
          mode: 'manual'
        })
      });

      if (!response.ok) {
        const raw = await response.text();
        let errorMessage = 'Failed to update ticket detail';

        try {
          const errorData = JSON.parse(raw);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = raw || errorMessage;
        }

        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: "Ticket detail updated successfully",
        variant: "default",
      });
      dispatch(fetchGeneratedDocuments(parseInt(id)));
      dispatch(fetchTicketDetail(id));
    } catch (error: any) {
      console.log("error", error)
      toast({
        title: "Update Error",
        description: error.message || "Failed to update ticket detail",
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
      approver: approver.approver_name,
      approver_leader: approver.approver_leader,
      date: approver.approval_date || null,
      order: approver.approval_order,
      assigned_team: ticketDetail.assigned_team

    }));
  };

  const getCustomFormData = () => {
    if (!ticketDetail?.detail_rows || !Array.isArray(ticketDetail.detail_rows)) return [];

    return ticketDetail.detail_rows
      .filter(row =>
        row.lbl_col?.trim() &&
        row.cstm_col?.trim() &&
        row.cstm_col !== '{}'
      )
      .sort((a, b) => a.order_col - b.order_col)
      .map(row => ({
        label: row.lbl_col,
        value: row.cstm_col
      }));
  };

  const canUserApprove = () => {
    if (!ticketDetail || !user) return false;

    return ticketDetail.list_approval?.some(
      approver =>
        approver.approval_order === ticketDetail.current_step &&
        approver.approver_id === user.user_id &&
        approver.approval_status === 0
    );
  };

  const handleFileDownload = (filePath: string, fileName: string) => {
    const downloadUrl = `${API_URL}/hots_ticket/download/file/${filePath}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';

    fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`
      }
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
        toast({
          title: "Download Error",
          description: "Failed to download file. Please try again.",
          variant: "destructive",
        });
      });
  };



  const handleGeneratedDocumentDownload = (documentPath: string, fileName: string) => {
    const downloadUrl = `${API_URL}/${documentPath}`;
    console.log("downloadUrl", downloadUrl)
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';

    fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`
      }
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
        toast({
          title: "Download Error",
          description: "Failed to download generated document. Please try again.",
          variant: "destructive",
        });
      });
  };

  const extractFirstUrl = (rawValue: string | string[]): string => {
    try {
      if (Array.isArray(rawValue)) return rawValue[0];

      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) return parsed[0];
    } catch (err) {
      console.warn("Failed to parse file URL:", err);
    }

    return typeof rawValue === 'string' ? rawValue : '';
  };

  const hasFetchedUsersRef = useRef(false);




  const [comment, setComment] = useState("");
  const [data_comment, setData_comment] = useState([]);
  const [data_comment_count, setData_comment_count] = useState([]);
  const commentContainerRef = useRef(null);
  // Initialize socket connection (only once on mount)

  const groupedMessages = data_comment?.reduce((groups, msg) => {
    const date = msg.date_created;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, typeof data_comment>);

  const scrollToBottom = () => {
    if (commentContainerRef.current) {
      commentContainerRef.current.scrollTop = commentContainerRef.current.scrollHeight;
    }
  };


  const [isLoading, setIsLoading] = useState(false);

  const handleComment = () => {
    if ((!comment || comment.trim() === '') && !image) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append('comment', comment.trim());
    if (image) formData.append('file', image);

    axios.post(
      `${API_URL}/hots_ticket/comment/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tokek")}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    ).then(() => {
      setIsLoading(false);
      setComment('');
      setImage(null);
      getData_comment();
      socket.emit('message', comment.trim());
    }).catch(() => {
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Error when uploading comment.',
        variant: 'destructive',
        duration: 3000,
        // isClosable: true, // Not supported in shadcn toast
      });
    });
  };


  // Function to fetch comments from the server
  const getData_comment = () => {
    axios.get(`${API_URL}/hots_ticket/comment/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("tokek")}`,
      },
    })
      .then((res) => {


        setData_comment(res.data.comment_list);
        setData_comment_count(res.data.comment_count);
        scrollToBottom();
      })
      .catch((err) => {
        console.error("Error fetching comments:", err);
      });
  };

  useEffect(() => {
    getData_comment();
  }, [setData_comment_count]);


  // Function to handle adding a new comment



  useEffect(() => {
    const onMessage = () => {
      getData_comment();
      scrollToBottom();
    };

    socket.on('message', onMessage);

    return () => {
      socket.off('message', onMessage);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [data_comment]);


  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset the height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to the scroll height
    }
  };

  useEffect(() => {
    adjustHeight(); // Adjust height on mount and when comment changes
  }, [comment]);

  const [fulfilment_comment, setfullfillment] = useState(null)

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [url, setURL] = useState("");

  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        setImage(blob);  // Store the actual file
        const imgURL = URL.createObjectURL(blob);
        setImagePreview(imgURL); // Display image thumb
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault(); // Prevent default action (form submission)
      setComment((prev) => prev + '\n'); // Add a new line
    } else if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default action to avoid new line
      handleComment(); // Submit the form
    }
  };


  const handleImage = (e) => {
    setImage(e.target.files[0]);  // Store the actual file, not URL.createObjectURL
    setImagePreview(URL.createObjectURL(e.target.files[0]));
    // onCloseModalUploadImage(); // Function not defined
  };
  // Handle form submit to send comment and image


  const renderPreview = (filename: string | string[], fileUrl: string | string[]) => {
    const safeUrl = extractFirstUrl(fileUrl);
    const safeFilename = extractFirstUrl(filename);
    const ext = getFileExtension(safeFilename);

    if (!safeUrl) return <p className="text-gray-400">Preview not available</p>;

    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return <img src={
        `${API_URL}${safeUrl.replace(/\\/g, '/')}`}
        alt="Preview" className="max-h-48 rounded shadow border" />;
    }

    if (ext === 'pdf') {
      return <iframe src={
        `${API_URL}${safeUrl.replace(/\\/g, '/')}`} className="w-full h-64 border rounded" title="PDF preview" />;
    }

    if (ext === 'xlsx' || ext === 'xls') {
      return <ExcelPreview url={`${API_URL}${safeUrl.replace(/\\/g, '/')}`} />
    }

    return (
      <a href={
        `${API_URL}${safeUrl.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        Open File
      </a>
    );
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



  const approvalSteps = formatApprovalSteps();
  const approvedCount = approvalSteps.filter(step => step.status === 'approved').length;
  const progressPercentage = approvalSteps.length > 0 ? (approvedCount / approvalSteps.length) * 100 : 0;
  const customFormData = getCustomFormData();

  const isFullyApproved = approvalSteps.length > 0 && approvedCount === approvalSteps.length;



  if (
    !hasFetchedUsersRef.current &&
    ticketDetail &&
    user &&
    isFullyApproved &&
    user.team_id_linked?.toString() === ticketDetail.assigned_team?.toString() &&
    ticketDetail.service_id?.toString() === "6" &&
    users?.length === 0
  ) {
    dispatch(fetchUsers());
    hasFetchedUsersRef.current = true;
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

  const getFileExtension = (filename: string) =>
    filename.split('.').pop()?.toLowerCase() || '';

  const currentApprover = ticketDetail?.list_approval?.find(
    approver => approver.approval_order === ticketDetail.current_step
  );




  return (
    <AppLayout>
      <div className="space-y-6 relative z-0">
        <div className="sticky top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">#{ticketDetail?.ticket_id}</h1>
                <p className="text-muted-foreground">{ticketDetail?.service_name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            <CardCollapsible
              title="Request Information"
              description="Details about the current request"
              defaultOpen
            >
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
                <div className="flex items-center space-x-2">
                  <Group className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{ticketDetail.department_name || ticketDetail.team_name || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCheck className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge style={{ backgroundColor: ticketDetail.color, color: 'white' }}>
                      {ticketDetail.status}
                    </Badge>
                  </div>
                </div>
                
              </div>

              {ticketDetail.reason && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-foreground bg-muted/50 p-3 rounded-md">{ticketDetail.reason}</p>
                </div>
              )}
            </CardCollapsible>

            {/* Render assigned widgets after request information */}
            {assignedWidgets.map(widget => (
              <WidgetRenderer
                key={widget.id}
                config={widget}
                data={{
                  ticketData: ticketDetail,
                  userData: user,
                  serviceId: ticketDetail?.service_id?.toString(),
                }}
              />
            ))}

            {/* Custom Form Data Table */}
            {customFormData.length > 0 && (
              <CardCollapsible
                title="Ticket Details"
                description="Details about the current ticket"
                defaultOpen
              >
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customFormData.map((field, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{field.label}</TableCell>
                          <TableCell>
                            {typeof field.value === 'string' && field.value.includes('/files/hots/it_support/') ? (
                              <div className="flex items-center space-x-2">
                                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                                    <DialogHeader>
                                      <DialogTitle>{field.label}</DialogTitle>
                                    </DialogHeader>
                                    <div className="mt-4">
                                      {renderPreview(field.value, field.value)}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            ) : (
                              <span>{field.value}</span>
                            )}
                          </TableCell>
                          {typeof field.value === 'string' && field.value.includes('/files/hots/it_support/') && (
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  window.open(`${API_URL}/${extractFirstUrl(field.value)}`, '_blank');
                                }}
                              >
                                Download
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>

              </CardCollapsible>
            )}

            {/* Files Attached */}
            {ticketDetail.files && ticketDetail.files.length > 0 && (
              <Card className="bg-card shadow-sm border">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="text-lg">Attached Files</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {ticketDetail.files.map((file) => (
                      <FilePreview
                        key={file.upload_id}
                        fileName={file.filename}
                        filePath={file.path}
                        fileSize={file.size}
                        onDownload={() => handleFileDownload(file.path, file.filename)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Documents */}
            {(isLoadingCustomFunction || (generatedDocuments && generatedDocuments.length > 0)) && (
              <CardCollapsible
                title="Ticket Item"
                description="Generated or Uploaded Items Organized Here"
                defaultOpen
              >
                <CardContent className="p-6">
                  {isLoadingCustomFunction ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="text-sm text-muted-foreground">Loading generated documents...</p>
                      </div>
                    </div>
                  ) : generatedDocuments && generatedDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {(() => {
                        console.log("generatedDocuments", generatedDocuments);
                        return null;
                      })()}
                      {generatedDocuments.map((document) => (
                        <FilePreview
                          generated={true}
                          key={document.id}
                          fileName={document.file_name}
                          filePath={document.file_path}
                          uploadDate={document.generated_date}
                          onDownload={() => handleGeneratedDocumentDownload(document.file_path, document.file_name)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No generated documents found</p>
                  )}
                </CardContent>
              </CardCollapsible>
            )}
          </div>

          <div className="space-y-6">
            {isFullyApproved &&
              user?.team_id_linked?.toString() === ticketDetail?.assigned_team?.toString() && (
                <CardCollapsible
                  title="Service Config"
                  color="bg-white"
                  description="Details about the current progress"
                  defaultOpen
                >

                  <CardContent className="p-4 space-y-4">
                    {ticketDetail?.service_id?.toString() === "6" && (
                      <>
                        <div>
                          <p className="font-semibold">Document Generation</p>
                        </div>

                        <div>
                          <Label className="block mb-1 font-medium">To:</Label>
                          <SuggestionInsertInputWrapper
                            suggestions={users.filter(u => u.email && u.email.trim() !== '').map(u => `${u.firstname} ${u.lastname}`)}
                            placeholder="Type or select from suggestions then enter"
                            onAdd={(value) => {
                              const trimmedValue = value.trim().toLowerCase();
                              const selectedUser = users.find(u => `${u.firstname} ${u.lastname}`.toLowerCase() === trimmedValue);
                              if (selectedUser && !selectedToEmails.includes(selectedUser.email)) {
                                setSelectedToEmails([...selectedToEmails, selectedUser.email]);
                              } else if (!selectedToEmails.includes(value)) {
                                setSelectedToEmails([...selectedToEmails, value]);
                              }
                              setToInputValue('');
                            }}
                          >

                          </SuggestionInsertInputWrapper>
                          {selectedToEmails?.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {selectedToEmails.map((email) => (
                                <span
                                  key={email}
                                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                                >
                                  {email}
                                  <button
                                    type="button"
                                    className="ml-2 rounded-full hover:bg-blue-200 p-0.5"
                                    onClick={() => setSelectedToEmails(selectedToEmails.filter(e => e !== email))}
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="block mb-1 font-medium">CC:</Label>
                          <SuggestionInsertInputWrapper
                            suggestions={users.filter(u => u.email && u.email.trim() !== '').map(u => `${u.firstname} ${u.lastname}`)}
                            placeholder="Type or select from suggestions then enter"
                            onAdd={(value) => {
                              const trimmedValue = value.trim().toLowerCase();
                              const selectedUser = users.find(u => `${u.firstname} ${u.lastname}`.toLowerCase() === trimmedValue);
                              if (selectedUser && !selectedCcEmails.includes(selectedUser.email)) {
                                setSelectedCcEmails([...selectedCcEmails, selectedUser.email]);
                              } else if (!selectedCcEmails.includes(value)) {
                                setSelectedCcEmails([...selectedCcEmails, value]);
                              }
                              setCcInputValue('');
                            }}
                          />
                          {selectedCcEmails?.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {selectedCcEmails.map((email) => (
                                <span
                                  key={email}
                                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                                >
                                  {email}
                                  <button
                                    type="button"
                                    className="ml-2 rounded-full hover:bg-blue-200 p-0.5"
                                    onClick={() => setSelectedCcEmails(selectedCcEmails.filter(e => e !== email))}
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className=" border-t flex justify-between items-center">
                          <Button onClick={() => { handleUpdateTicketDetail() }}>
                            Update Email
                          </Button>
                          <Button variant="outline"
                            onClick={() => { handleExecuteCustomFunction(5) }}
                            disabled={selectedToEmails?.length === 0}
                          >
                            Generate Document
                          </Button >
                        </div>

                      </>
                    )}
                  </CardContent>
                </CardCollapsible>
              )}



            <CardCollapsible
              title="Approval Progress"
              color="bg-white"
              description="Details about the current progress"
              defaultOpen
            >
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {canUserApprove() && (
                    <div className="flex items-center justify-center w-full space-y-2">
                      <TaskApprovalActionsSimple
                        ticketId={ticketDetail.ticket_id.toString()}
                        approvalOrder={ticketDetail.current_step || 1}
                        canApprove={canUserApprove()}
                        currentStatus={currentApprover?.approval_status || 0}
                        currentUserId={user?.user_id}
                        assignedToId={currentApprover?.approver_id}
                        refreshticketdetail={refreshticketdetail}
                        setRefreshticketdetail={setRefreshticketdetail}
                      />
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{approvedCount}/{approvalSteps.length} approved</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                <div className="space-y-3">


                  {approvalSteps
                    .filter((a) => {
                      if (!user?.user_id) {
                        // user not loaded yet: fallback to only show leaders
                        return Number(a.approver_leader) === 1;
                      }

                      const userIsApprover = approvalSteps.some((x) =>
                        x.id.startsWith(`${user.user_id}-`)
                      );

                      return userIsApprover || Number(a.approver_leader) === 1;
                    })
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step.status === 'approved' ? 'bg-green-500 text-white' :
                          step.status === 'rejected' ? 'bg-red-500 text-white' :
                            step.status === 'pending' ? 'bg-yellow-500 text-white' :
                              'bg-gray-300 text-gray-600'
                          }`}>
                          {step.order}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{step.name}</p>
                          {step.date && (
                            <p className="text-xs text-muted-foreground">
                              {step.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(step.date).toLocaleDateString()}
                            </p>
                          )}
                          {step.status === 'pending' && (
                            <p className="text-xs text-yellow-600">Pending approval</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </CardCollapsible>

            <CardCollapsible
              title="Discussion"
              color="bg-white"
              description="Details about the current progress"
              defaultOpen
            >
              <CardContent className="p-0">
                <div className="h-64 overflow-y-auto p-4 space-y-3">

                  <div
                    ref={commentContainerRef}
                  >
                    {groupedMessages && Object.entries(groupedMessages).length > 0 ? (
                      Object.entries(groupedMessages).map(([date, messages]) => (
                        <div key={date} className="mb-6">
                          <div className="text-center text-xs text-muted-foreground mb-2">
                            {date}
                          </div>

                          {(messages as any[]).map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex mb-1 ${msg.sender_id === user.user_id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${msg.sender_id === user.user_id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                                  }`}
                              >
                                <p className="text-xs font-medium mb-1">{msg.sender}</p>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                <p className="text-xs opacity-75 mt-1 text-end">{msg.time_created}</p>
                              </div>

                              {msg.attachment_url && (
                                <div className="px-4 pt-3">
                                  <div className="relative inline-block max-w-fit">
                                    <img
                                      onClick={() => {
                                        setURL(`${API_URL}${msg.attachment_url}`);
                                        // onOpenModalViewImage();
                                      }}
                                      className="rounded shadow h-[90px] w-[90px] cursor-pointer object-cover"
                                      src={`${API_URL}${msg.attachment_url}`}
                                      alt="Uploaded"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center">No messages yet</p>
                    )}

                  </div>
                </div>
                <div className="border-t p-4">
                  <div className="w-full mb-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleComment();
                      }}
                      className="relative flex items-center w-full"
                    >
                      <div className="flex-1">
                        <textarea
                          ref={textareaRef}
                          placeholder="Enter Comment"
                          onKeyDown={handleKeyDown}
                          rows={1}
                          maxLength={500}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          onPaste={handlePaste}
                          disabled={isLoading || Number(ticketDetail.status) >= 2}
                          className="w-full px-4 py-2 min-h-[30px] max-h-[120px] resize-none border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        />
                      </div>

                      <div className="absolute right-2 flex space-x-2">
                        <button
                          type="button"
                          // onClick={onOpenModalUploadImage}
                          disabled={isLoading || Number(ticketDetail.status) >= 2}
                          className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>


                        <button
                          type="submit"
                          disabled={isLoading || Number(ticketDetail.status) >= 2}
                          className="text-gray-600 hover:text-blue-600 disabled:opacity-50"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </form>

                    {image && (
                      <div className="w-full border mt-1 px-3 mb-2">
                        <div className="flex px-3 pt-4 pb-3">
                          <div className="relative max-w-fit">
                            <button
                              type="button"
                              onClick={() => setImage(null)}
                              className="absolute top-0 right-0 text-gray-700 hover:text-red-500 mt-[-9px]"
                            >
                               {/* <IoIosCloseCircle size={20} /> - Icon not imported */}
                               <X size={20} />
                            </button>

                            <img
                              src={imagePreview}
                              alt="Uploaded"
                              className="rounded shadow img-thumbnail h-[90px] w-[90px] object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </CardContent>
            </CardCollapsible>


          </div>
        </div>
      </div>

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onReject={handleReject}
        taskId={ticketDetail?.ticket_id.toString() || ''}
      />
    </AppLayout>
  );
};

export default TicketDetail;
