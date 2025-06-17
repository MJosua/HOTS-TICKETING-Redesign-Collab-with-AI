
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/sourceConfig';

interface UserData {
  id: string;
  username: string;
  email?: string;
  role?: string;
  [key: string]: any;
}
interface AuthState {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  loginAttempts: number;
  isLocked: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('tokek'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('tokek'),
  error: null,
  loginAttempts: 0,
  isLocked: false,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/hots_auth/login`, {
        uid: username,
        asin: password,
      });

      if (response.data.success) {
        const { tokek, userData } = response.data;
        localStorage.setItem('tokek', tokek);
        localStorage.setItem('isAuthenticated', 'true');
        console.log("LOGIN RESPONSE:", response.data);
        return { token: tokek, userData };
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  localStorage.removeItem('tokek');
  localStorage.removeItem('isAuthenticated');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.isLocked = false;
    },
    setLocked: (state) => {
      state.isLocked = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.userData;
        state.error = null;
        state.loginAttempts = 0;
        state.isLocked = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        state.loginAttempts += 1;

        // Check if account should be locked
        if (action.payload && typeof action.payload === 'string' &&
          action.payload.includes('Too many login attempt')) {
          state.isLocked = true;
        }
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loginAttempts = 0;
        state.isLocked = false;
      });
  },
});

export const { clearError, resetLoginAttempts, setLocked } = authSlice.actions;
export default authSlice.reducer;
