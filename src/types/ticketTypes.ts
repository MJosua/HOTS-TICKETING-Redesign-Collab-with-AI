
export interface Approver {
  approver_id: number;
  approver_name: string;
  approval_order: number;
  approval_status: number;
}

export interface Ticket {
  ticket_id: number;
  creation_date: string;
  service_id: number;
  service_name: string;
  approval_level?: number;
  assigned_to: string | null;
  status: string;
  color: string;
  team_name: string | null;
  last_update: string | null;
  reason: string;
  fulfilment_comment: string | null;
  approval_status: number;
  list_approval: Approver[] | null;
  team_leader_id: number | null;
  created_by_name?: string;
}

export interface TicketsResponse {
  success: boolean;
  message: string;
  totalData: number;
  totalPage: number;
  data: Ticket[];
}

export interface CreateTicketResponse {
  success: boolean;
  message: string;
  ticket_id?: number;
}

export interface UploadFilesResponse {
  success: boolean;
  message: string;
  files?: Array<{
    upload_id: number;
    filename: string;
    path: string;
    size: number;
  }>;
}

export interface TicketsState {
  myTickets: {
    data: Ticket[];
    totalData: number;
    totalPage: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
  };
  allTickets: {
    data: Ticket[];
    totalData: number;
    totalPage: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
  };
  taskList: {
    data: Ticket[];
    totalData: number;
    totalPage: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
  };
}
