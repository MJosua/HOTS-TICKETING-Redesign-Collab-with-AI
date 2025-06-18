
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';

export interface UserType {
  user_id: number;
  firstname: string;
  lastname: string;
  uid: string;
  email: string;
  role_id: number;
  role_name: string;
  department_id: number;
  team_name: string;
  team_id?: number;
  job_title: string;
  superior_id?: number;
  finished_date?: string | null;
  is_active: boolean;
}

export interface Team {
  team_id: number;
  team_name: string;
  team_shortname: string;
  team_leader: number;
  department_id: number;
  description: string;
  member_count: number;
  leader_firstname?: string;
  leader_lastname?: string;
}

interface UserManagementState {
  users: UserType[];
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  filters: {
    status: 'all' | 'active' | 'deleted';
    team: string;
    role: string;
  };
}

const initialState: UserManagementState = {
  users: [],
  teams: [],
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    team: '',
    role: '',
  },
};

export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async () => {
    const response = await axios.get(`${API_URL}/hots_settings/get/user`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return response.data.data;
  }
);

export const fetchTeams = createAsyncThunk(
  'userManagement/fetchTeams',
  async () => {
    const response = await axios.get(`${API_URL}/hots_settings/get/team`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return response.data.data;
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<'all' | 'active' | 'deleted'>) => {
      state.filters.status = action.payload;
    },
    setTeamFilter: (state, action: PayloadAction<string>) => {
      state.filters.team = action.payload;
    },
    setRoleFilter: (state, action: PayloadAction<string>) => {
      state.filters.role = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        team: '',
        role: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.map((user: any) => ({
          ...user,
          is_active: !user.finished_date,
        }));
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teams = action.payload;
      });
  },
});

export const { setStatusFilter, setTeamFilter, setRoleFilter, clearFilters } = userManagementSlice.actions;
export default userManagementSlice.reducer;
