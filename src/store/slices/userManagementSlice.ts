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
  department_id: number;
  creation_date: string;
  finished_date?: string | null;
  member_count: number;
  leader_name?: string;
}

export interface TeamMember {
  member_id: number;
  team_id: number;
  user_id: number;
  member_desc: string;
  creation_date: string;
  finished_date?: string | null;
  team_leader: boolean;
  user_name?: string;
}

export interface Department {
  department_id: number;
  department_name: string;
  department_shortname: string;
  department_head?: number;
  description: string;
  finished_date?: string | null;
  created_date: string;
  head_name?: string;
  status: 'active' | 'inactive';
}

export interface WorkflowGroup {
  workflow_group_id: number;
  name: string;
  description: string;
  category_ids: number[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface WorkflowStepExecution {
  id: number;
  workflow_id: number;
  step_order: number;
  assigned_user_id: number;
  status: string;
  action_date: string;
  action_by_user_id?: number;
  comments?: string;
  rejection_reason?: string;
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
  teamMembers: TeamMember[];
  departments: Department[];
  workflowGroups: WorkflowGroup[];
  workflowStepExecutions: WorkflowStepExecution[];
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
  teamMembers: [],
  departments: [],
  workflowGroups: [],
  workflowStepExecutions: [],
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

export const createTeam = createAsyncThunk(
  'userManagement/createTeam',
  async (teamData: Omit<Team, 'team_id' | 'creation_date' | 'member_count'>) => {
    const response = await axios.post(`${API_URL}/hots_settings/post/team`, teamData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return response.data.data;
  }
);

export const updateTeam = createAsyncThunk(
  'userManagement/updateTeam',
  async ({ id, data }: { id: number; data: Partial<Team> }) => {
    const response = await axios.put(`${API_URL}/hots_settings/update/team/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return response.data.data;
  }
);

export const deleteTeam = createAsyncThunk(
  'userManagement/deleteTeam',
  async (id: number) => {
    await axios.delete(`${API_URL}/hots_settings/delete/team/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return id;
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'userManagement/fetchTeamMembers',
  async (teamId: number) => {
    const response = await axios.get(`${API_URL}/hots_settings/get/team_members/${teamId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return response.data.data;
  }
);

export const addTeamMember = createAsyncThunk(
  'userManagement/addTeamMember',
  async (memberData: Omit<TeamMember, 'member_id' | 'creation_date'>) => {
    const response = await axios.post(`${API_URL}/hots_settings/post/team_member`, memberData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return response.data.data;
  }
);

export const updateTeamMember = createAsyncThunk(
  'userManagement/updateTeamMember',
  async ({ id, data }: { id: number; data: Partial<TeamMember> }) => {
    const response = await axios.put(`${API_URL}/hots_settings/update/team_member/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return response.data.data;
  }
);

export const removeTeamMember = createAsyncThunk(
  'userManagement/removeTeamMember',
  async (id: number) => {
    await axios.delete(`${API_URL}/hots_settings/delete/team_member/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return id;
  }
);

export const fetchDepartments = createAsyncThunk(
  'userManagement/fetchDepartments',
  async () => {
    const response = await axios.get(`${API_URL}/hots_settings/get/departments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    console.log("departments fetch", response.data.data);
    return response.data.data;
  }
);

export const fetchWorkflowGroups = createAsyncThunk(
  'userManagement/fetchWorkflowGroups',
  async () => {
    const response = await axios.get(`${API_URL}/hots_settings/get/workflow_groups`, {
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
  async (workflowData: Omit<WorkflowGroup, 'workflow_group_id' | 'created_at' | 'updated_at'>) => {
    const response = await axios.post(`${API_URL}/hots_settings/post/workflow_group`, workflowData, {
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
    const response = await axios.put(`${API_URL}/hots_settings/update/workflow_group/${id}`, data, {
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
    await axios.delete(`${API_URL}/hots_settings/delete/workflow_group/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('tokek')}`,
      }
    });
    return id;
  }
);

export const fetchWorkflowStepExecutions = createAsyncThunk(
  'userManagement/fetchWorkflowStepExecutions',
  async (workflowId: number) => {
    const response = await axios.get(`${API_URL}/hots_settings/get/workflow_step_executions/${workflowId}`, {
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
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex(t => t.team_id === action.payload.team_id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter(t => t.team_id !== action.payload);
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.teamMembers = action.payload;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.teamMembers.push(action.payload);
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        const index = state.teamMembers.findIndex(m => m.member_id === action.payload.member_id);
        if (index !== -1) {
          state.teamMembers[index] = action.payload;
        }
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.teamMembers = state.teamMembers.filter(m => m.member_id !== action.payload);
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
      })
      .addCase(fetchWorkflowGroups.fulfilled, (state, action) => {
        state.workflowGroups = action.payload;
      })
      .addCase(createWorkflowGroup.fulfilled, (state, action) => {
        state.workflowGroups.push(action.payload);
      })
      .addCase(updateWorkflowGroup.fulfilled, (state, action) => {
        const index = state.workflowGroups.findIndex(w => w.workflow_group_id === action.payload.workflow_group_id);
        if (index !== -1) {
          state.workflowGroups[index] = action.payload;
        }
      })
      .addCase(deleteWorkflowGroup.fulfilled, (state, action) => {
        state.workflowGroups = state.workflowGroups.filter(w => w.workflow_group_id !== action.payload);
      })
      .addCase(fetchWorkflowStepExecutions.fulfilled, (state, action) => {
        state.workflowStepExecutions = action.payload;
      });
  },
});

export const { setStatusFilter, setTeamFilter, setRoleFilter, clearFilters } = userManagementSlice.actions;
export default userManagementSlice.reducer;
