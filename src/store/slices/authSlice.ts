import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/sourceConfig';

interface UserData {
  id: string;
  username: string;
  uid: string;
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
  isTokenExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('tokek'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('tokek'),
  error: null,
  loginAttempts: 0,
  isLocked: false,
  isTokenExpired: false,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password, isReauthentication = false }: { 
    username: string; 
    password: string; 
    isReauthentication?: boolean;
  }, { rejectWithValue, getState }) => {
    try {
      console.log('Attempting login for:', username, 'isReauthentication:', isReauthentication);
      
      const response = await axios.post(`${API_URL}/hots_auth/login`, {
        uid: username,
        asin: password,
      });

      if (response.data.success) {
        const { tokek, userData } = response.data;
        localStorage.setItem('tokek', tokek);
        localStorage.setItem('isAuthenticated', 'true');
        console.log("LOGIN RESPONSE:", response.data);
        return { token: tokek, userData, isReauthentication };
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error: any) {
      console.log('Login failed:', error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Simplified logout - no async needed
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  localStorage.removeItem('tokek');
  localStorage.removeItem('isAuthenticated');
  console.log('User logged out, session cleared');
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
    clearToken: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.isTokenExpired = true;
      localStorage.removeItem('tokek');
    },
    resetTokenExpiration: (state) => {
      state.isTokenExpired = false;
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
        state.isTokenExpired = false;
        console.log('Login successful, user authenticated');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        
        // Only increment attempts if this is NOT a re-authentication
        if (!state.isTokenExpired) {
          state.loginAttempts += 1;
        }

        // Handle authentication state based on type of login
        if (!state.isTokenExpired) {
          // This is a fresh login attempt, clear everything on failure
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          localStorage.removeItem('tokek');
          localStorage.removeItem('isAuthenticated');
        } else {
          // This is a re-authentication attempt, keep user data but stay unauthenticated
          state.isAuthenticated = false;
          state.token = null;
        }

        // Check if account should be locked
        if (action.payload && typeof action.payload === 'string' &&
          action.payload.includes('Too many login attempt')) {
          state.isLocked = true;
        }
      })
      // Logout cases - simplified
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loginAttempts = 0;
        state.isLocked = false;
        state.isTokenExpired = false;
        state.isLoading = false;
      });
  },
});

export const { clearError, resetLoginAttempts, setLocked, clearToken, resetTokenExpiration } = authSlice.actions;
export default authSlice.reducer;
