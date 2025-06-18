
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

export interface Division {
  division_id: number;
  name: string;
  code: string;
  description: string;
  parent_division_id?: number;
  head_user_id?: number;
  head_name?: string;
  status: 'active' | 'inactive';
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowGroup {
  workflow_id: number;
  name: string;
  description: string;
  category_ids: number[];
  approval_steps: ApprovalStep[];
  created_at: string;
  updated_at: string;
}

export interface ApprovalStep {
  step_id: number;
  order: number;
  type: 'role' | 'specific_user' | 'superior' | 'team';
  value: string | number;
  description: string;
}

interface UserManagementState {
  users: UserType[];
  teams: Team[];
  divisions: Division[];
  workflowGroups: WorkflowGroup[];
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
  divisions: [],
  workflowGroups: [],
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
    console.log("users fetch", response.data.data);
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
    console.log("teams fetch", response.data.data);
    return response.data.data;
  }
);

export const fetchDivisions = createAsyncThunk(
  'userManagement/fetchDivisions',
  async () => {
    const response = await axios.get(`${API_URL}/hots_settings/get/division`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    console.log("divisions fetch", response.data.data);
    return response.data.data;
  }
);

export const fetchWorkflowGroups = createAsyncThunk(
  'userManagement/fetchWorkflowGroups',
  async () => {
    const response = await axios.get(`${API_URL}/hots_settings/get/workflow`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    console.log("workflow groups fetch", response.data.data);
    return response.data.data;
  }
);

export const createWorkflowGroup = createAsyncThunk(
  'userManagement/createWorkflowGroup',
  async (workflowData: Omit<WorkflowGroup, 'workflow_id' | 'created_at' | 'updated_at'>) => {
    const response = await axios.post(`${API_URL}/hots_settings/create/workflow`, workflowData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return response.data.data;
  }
);

export const updateWorkflowGroup = createAsyncThunk(
  'userManagement/updateWorkflowGroup',
  async ({ id, data }: { id: number; data: Partial<WorkflowGroup> }) => {
    const response = await axios.put(`${API_URL}/hots_settings/update/workflow/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return response.data.data;
  }
);

export const deleteWorkflowGroup = createAsyncThunk(
  'userManagement/deleteWorkflowGroup',
  async (id: number) => {
    await axios.delete(`${API_URL}/hots_settings/delete/workflow/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return id;
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
      })
      .addCase(fetchDivisions.fulfilled, (state, action) => {
        state.divisions = action.payload;
      })
      .addCase(fetchWorkflowGroups.fulfilled, (state, action) => {
        state.workflowGroups = action.payload;
      })
      .addCase(createWorkflowGroup.fulfilled, (state, action) => {
        state.workflowGroups.push(action.payload);
      })
      .addCase(updateWorkflowGroup.fulfilled, (state, action) => {
        const index = state.workflowGroups.findIndex(w => w.workflow_id === action.payload.workflow_id);
        if (index !== -1) {
          state.workflowGroups[index] = action.payload;
        }
      })
      .addCase(deleteWorkflowGroup.fulfilled, (state, action) => {
        state.workflowGroups = state.workflowGroups.filter(w => w.workflow_id !== action.payload);
      });
  },
});

export const { setStatusFilter, setTeamFilter, setRoleFilter, clearFilters } = userManagementSlice.actions;
export default userManagementSlice.reducer;
