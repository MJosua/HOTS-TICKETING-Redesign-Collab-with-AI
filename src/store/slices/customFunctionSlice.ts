
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { CustomFunctionState, CustomFunction, ServiceCustomFunction, CustomFunctionLog, GeneratedDocument, FunctionTemplate } from '@/types/customFunctionTypes';

const initialState: CustomFunctionState = {
  functions: [],
  serviceFunctions: [],
  functionLogs: [],
  generatedDocuments: [],
  templates: [],
  isLoading: false,
  isExecuting: false,
  error: null,
};

// Async thunks for API calls
export const fetchCustomFunctions = createAsyncThunk(
  'customFunction/fetchFunctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/hots_settings/custom_functions/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('tokek')}` }
      });
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch custom functions');
      }
      
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const fetchServiceFunctions = createAsyncThunk(
  'customFunction/fetchServiceFunctions',
  async (serviceId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/hots_settings/custom_functions/service/${serviceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('tokek')}` }
      });
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch service functions');
      }
      
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const createCustomFunction = createAsyncThunk(
  'customFunction/createFunction',
  async (functionData: Partial<CustomFunction>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/hots_settings/custom_functions/create`, functionData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('tokek')}` }
      });
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to create custom function');
      }
      
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const executeCustomFunction = createAsyncThunk(
  'customFunction/executeFunction',
  async ({ ticketId, functionId, params }: { ticketId: number, functionId: number, params?: any }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/hots_settings/custom_functions/execute/${functionId}`, {
        ticket_id: ticketId,
        params
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('tokek')}` }
      });
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to execute custom function');
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

export const uploadExcelFile = createAsyncThunk(
  'customFunction/uploadExcel',
  async ({ ticketId, file }: { ticketId: number, file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ticket_id', ticketId.toString());
      
      const response = await axios.post(`${API_URL}/hots_settings/custom_functions/upload_excel`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('tokek')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to upload Excel file');
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Network error');
    }
  }
);

const customFunctionSlice = createSlice({
  name: 'customFunction',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    setExecuting: (state, action: PayloadAction<boolean>) => {
      state.isExecuting = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Custom Functions
      .addCase(fetchCustomFunctions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomFunctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.functions = action.payload;
      })
      .addCase(fetchCustomFunctions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Service Functions
      .addCase(fetchServiceFunctions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceFunctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.serviceFunctions = action.payload;
      })
      .addCase(fetchServiceFunctions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Custom Function
      .addCase(createCustomFunction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomFunction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.functions.push(action.payload);
      })
      .addCase(createCustomFunction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Execute Custom Function
      .addCase(executeCustomFunction.pending, (state) => {
        state.isExecuting = true;
        state.error = null;
      })
      .addCase(executeCustomFunction.fulfilled, (state, action) => {
        state.isExecuting = false;
      })
      .addCase(executeCustomFunction.rejected, (state, action) => {
        state.isExecuting = false;
        state.error = action.payload as string;
      })
      // Upload Excel
      .addCase(uploadExcelFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadExcelFile.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(uploadExcelFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearErrors, setExecuting } = customFunctionSlice.actions;
export default customFunctionSlice.reducer;
