
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
  async (page: number = 1) => {
    const response = await axios.get(`${API_URL}/hots_ticket/my_tiket?page=${page}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      },
    });
    return { ...response.data, currentPage: page };
  }
);

export const fetchAllTickets = createAsyncThunk(
  'tickets/fetchAllTickets',
  async (page: number = 1) => {
    const response = await axios.get(`${API_URL}/hots_ticket/all_tiket?page=${page}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      },
    });
    return { ...response.data, currentPage: page };
  }
);

export const fetchTaskList = createAsyncThunk(
  'tickets/fetchTaskList',
  async (page: number = 1) => {
    const response = await axios.get(`${API_URL}/hots_ticket/task_list?page=${page}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      },
    });
    return { ...response.data, currentPage: page };
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
        state.myTickets.data = action.payload.data;
        state.myTickets.totalData = action.payload.totalData;
        state.myTickets.totalPage = action.payload.totalPage;
        state.myTickets.currentPage = action.payload.currentPage;
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.myTickets.isLoading = false;
        state.myTickets.error = action.error.message || 'Failed to fetch my tickets';
      })
      // All Tickets
      .addCase(fetchAllTickets.pending, (state) => {
        state.allTickets.isLoading = true;
        state.allTickets.error = null;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.allTickets.isLoading = false;
        state.allTickets.data = action.payload.data;
        state.allTickets.totalData = action.payload.totalData;
        state.allTickets.totalPage = action.payload.totalPage;
        state.allTickets.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.allTickets.isLoading = false;
        state.allTickets.error = action.error.message || 'Failed to fetch all tickets';
      })
      // Task List
      .addCase(fetchTaskList.pending, (state) => {
        state.taskList.isLoading = true;
        state.taskList.error = null;
      })
      .addCase(fetchTaskList.fulfilled, (state, action) => {
        state.taskList.isLoading = false;
        state.taskList.data = action.payload.data;
        state.taskList.totalData = action.payload.totalData;
        state.taskList.totalPage = action.payload.totalPage;
        state.taskList.currentPage = action.payload.currentPage;
      })
      .addCase(fetchTaskList.rejected, (state, action) => {
        state.taskList.isLoading = false;
        state.taskList.error = action.error.message || 'Failed to fetch task list';
      });
  },
});

export const { clearErrors } = ticketsSlice.actions;
export default ticketsSlice.reducer;
