
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

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.myTickets.error = null;
      state.allTickets.error = null;
      state.taskList.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<{ type: 'myTickets' | 'allTickets' | 'taskList', page: number }>) => {
      state[action.payload.type].currentPage = action.payload.page;
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

export const { clearErrors, setCurrentPage } = ticketsSlice.actions;
export default ticketsSlice.reducer;
