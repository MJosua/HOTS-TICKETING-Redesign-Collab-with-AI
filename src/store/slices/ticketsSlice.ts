import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { TicketsResponse, TicketsState, Ticket } from '@/types/ticketTypes';

const initialState: TicketsState = {
  myTickets: {
    data: [],
    totalData: 0,
    totalPage: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
  },
  allTickets: {
    data: [],
    totalData: 0,
    totalPage: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
  },
  taskList: {
    data: [],
    totalData: 0,
    totalPage: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
  },
  taskCount: 0,
  isSubmitting: false,
  ticketDetail: null,
  isLoadingDetail: false,
  detailError: null,
};

// Async thunks for API calls
export const fetchMyTickets = createAsyncThunk(
  'tickets/fetchMyTickets',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/hots_ticket/my_ticket?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        },
      });
      
      console.log('My Tickets API Response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch my tickets');
      }
      
      return { ...response.data, currentPage: page };
    } catch (error: any) {
      console.error('My Tickets API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const fetchAllTickets = createAsyncThunk(
  'tickets/fetchAllTickets',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/hots_ticket/all_ticket?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        },
      });
      
      console.log('All Tickets API Response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch all tickets');
      }
      
      return { ...response.data, currentPage: page };
    } catch (error: any) {
      console.error('All Tickets API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const fetchTaskList = createAsyncThunk(
  'tickets/fetchTaskList',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/hots_ticket/task_list?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        },
      });
      
      console.log('Task List API Response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch task list');
      }
      
      return { ...response.data, currentPage: page };
    } catch (error: any) {
      console.error('Task List API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const fetchTicketDetail = createAsyncThunk(
  'tickets/fetchTicketDetail',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/hots_ticket/detail/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        },
      });
      
      console.log('Ticket Detail API Response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch ticket detail');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Ticket Detail API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async ({ serviceId, ticketData }: { serviceId: string, ticketData: any }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/hots_ticket/create/ticket/${serviceId}`, ticketData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Create Ticket API Response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to create ticket');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Create Ticket API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const uploadFiles = createAsyncThunk(
  'tickets/uploadFiles',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/hots_ticket/upload/files/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload Files API Response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to upload files');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Upload Files API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const fetchTaskCount = createAsyncThunk(
  'tickets/fetchTaskCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/hots_ticket/task_count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
        },
      });
      
      console.log('Task Count API Response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch task count');
      }
      
      return response.data.count || 0;
    } catch (error: any) {
      console.error('Task Count API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const approveTicket = createAsyncThunk(
  'tickets/approveTicket',
  async ({ ticketId, approvalOrder, comment }: { ticketId: string, approvalOrder: number, comment?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/hots_ticket/approve/${ticketId}`, {
        approval_order: approvalOrder,
        comment: comment || ''
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Approve Ticket API Response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to approve ticket');
      }
      
      return { ticketId, approvalOrder };
    } catch (error: any) {
      console.error('Approve Ticket API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const rejectTicket = createAsyncThunk(
  'tickets/rejectTicket',
  async ({ ticketId, approvalOrder, rejectionRemark }: { ticketId: string, approvalOrder: number, rejectionRemark: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/hots_ticket/reject/${ticketId}`, {
        approval_order: approvalOrder,
        rejection_remark: rejectionRemark
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Reject Ticket API Response:', response.data);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to reject ticket');
      }
      
      return { ticketId, approvalOrder };
    } catch (error: any) {
      console.error('Reject Ticket API Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.myTickets.error = null;
      state.allTickets.error = null;
      state.taskList.error = null;
      state.detailError = null;
    },
    setCurrentPage: (state, action: PayloadAction<{ type: 'myTickets' | 'allTickets' | 'taskList', page: number }>) => {
      state[action.payload.type].currentPage = action.payload.page;
    },
    clearTicketDetail: (state) => {
      state.ticketDetail = null;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    // My Tickets
    builder
      .addCase(fetchMyTickets.pending, (state) => {
        state.myTickets.isLoading = true;
        state.myTickets.error = null;
      })
      .addCase(fetchMyTickets.fulfilled, (state, action) => {
        state.myTickets.isLoading = false;
        state.myTickets.data = action.payload.data || [];
        state.myTickets.totalData = action.payload.totalData || 0;
        state.myTickets.totalPage = action.payload.totalPage || 0;
        state.myTickets.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.myTickets.isLoading = false;
        state.myTickets.error = action.payload as string || 'Failed to fetch my tickets';
        state.myTickets.data = [];
      })
      // All Tickets
      .addCase(fetchAllTickets.pending, (state) => {
        state.allTickets.isLoading = true;
        state.allTickets.error = null;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.allTickets.isLoading = false;
        state.allTickets.data = action.payload.data || [];
        state.allTickets.totalData = action.payload.totalData || 0;
        state.allTickets.totalPage = action.payload.totalPage || 0;
        state.allTickets.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.allTickets.isLoading = false;
        state.allTickets.error = action.payload as string || 'Failed to fetch all tickets';
        state.allTickets.data = [];
      })
      // Task List
      .addCase(fetchTaskList.pending, (state) => {
        state.taskList.isLoading = true;
        state.taskList.error = null;
      })
      .addCase(fetchTaskList.fulfilled, (state, action) => {
        state.taskList.isLoading = false;
        state.taskList.data = action.payload.data || [];
        state.taskList.totalData = action.payload.totalData || 0;
        state.taskList.totalPage = action.payload.totalPage || 0;
        state.taskList.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchTaskList.rejected, (state, action) => {
        state.taskList.isLoading = false;
        state.taskList.error = action.payload as string || 'Failed to fetch task list';
        state.taskList.data = [];
      })
      // Ticket Detail
      .addCase(fetchTicketDetail.pending, (state) => {
        state.isLoadingDetail = true;
        state.detailError = null;
      })
      .addCase(fetchTicketDetail.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        state.ticketDetail = action.payload;
      })
      .addCase(fetchTicketDetail.rejected, (state, action) => {
        state.isLoadingDetail = false;
        state.detailError = action.payload as string || 'Failed to fetch ticket detail';
        state.ticketDetail = null;
      })
      // Task Count
      .addCase(fetchTaskCount.pending, (state) => {
        // Optional: could add loading state
      })
      .addCase(fetchTaskCount.fulfilled, (state, action) => {
        state.taskCount = action.payload;
      })
      .addCase(fetchTaskCount.rejected, (state, action) => {
        console.error('Failed to fetch task count:', action.payload);
      })
      // Approve Ticket
      .addCase(approveTicket.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(approveTicket.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const ticket = state.taskList.data.find(t => t.ticket_id.toString() === action.payload.ticketId);
        if (ticket && ticket.list_approval) {
          const approval = ticket.list_approval.find(a => a.approval_order === action.payload.approvalOrder);
          if (approval) {
            approval.approval_status = 1;
          }
        }
      })
      .addCase(approveTicket.rejected, (state, action) => {
        state.isSubmitting = false;
        console.error('Failed to approve ticket:', action.payload);
      })
      // Reject Ticket
      .addCase(rejectTicket.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(rejectTicket.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const ticket = state.taskList.data.find(t => t.ticket_id.toString() === action.payload.ticketId);
        if (ticket && ticket.list_approval) {
          const approval = ticket.list_approval.find(a => a.approval_order === action.payload.approvalOrder);
          if (approval) {
            approval.approval_status = 2;
          }
        }
      })
      .addCase(rejectTicket.rejected, (state, action) => {
        state.isSubmitting = false;
        console.error('Failed to reject ticket:', action.payload);
      })
      // Create Ticket
      .addCase(createTicket.pending, (state) => {
        // Could add a creating state if needed
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        // Ticket created successfully - could refresh the list
      })
      .addCase(createTicket.rejected, (state, action) => {
        // Could set an error state for ticket creation
      })
      // Upload Files
      .addCase(uploadFiles.pending, (state) => {
        // Could add an uploading state if needed
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        // Files uploaded successfully
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        // Could set an error state for file upload
      });
  },
});

export const { clearErrors, setCurrentPage, clearTicketDetail } = ticketsSlice.actions;
export default ticketsSlice.reducer;
