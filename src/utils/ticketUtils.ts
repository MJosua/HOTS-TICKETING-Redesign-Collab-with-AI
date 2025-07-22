
import { Ticket, Approver } from '@/types/ticketTypes';

export const convertTicketToDisplayFormat = (ticket: Ticket) => {
  // Convert approval list to steps format
  const approvalSteps = ticket.list_approval?.map((approver: Approver, index: number) => ({
    id: approver.approver_id.toString(),
    name: approver.approver_name,
    approver_leader: approver.approver_leader,
    approval_order: approver.approval_order,
    status: approver.approval_status === 1 ? 'approved' as const : 
            approver.approval_status === 2 ? 'rejected' as const : 
            'pending' as const,
    date: approver.approval_date,
    approver: approver.approver_name,
    approval_status: approver.approval_status
  })) || [];

  // Determine priority based on approval level
  const getPriority = (level: number) => {
    if (level >= 3) return 'High';
    if (level === 2) return 'Medium';
    return 'Low';
  };

  return {
    id: ticket.ticket_id.toString(),
    type: ticket.service_name,
    requester: ticket.created_by_name || "Current User",
    department: ticket.department_name || "Unknown Department",
    priority: getPriority(ticket.approval_level || 1),
    created: ticket.creation_date,
    amount: "-", // Not provided in API
    status: ticket.status,
    approvalSteps: approvalSteps,
    current_step: ticket.current_step,
  };
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "submitted": return "bg-yellow-100 text-orange-800 border-orange-200";
    case "onservice": return "bg-orange-100 text-orange-800 border-orange-200";
    case "in progress": return "bg-blue-100 text-blue-800 border-blue-200";
    case "approved": return "bg-green-100 text-green-800 border-green-200";
    case "rejected": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High": return "bg-red-100 text-red-800 border-red-200";
    case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Low": return "bg-green-100 text-green-800 border-green-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
