import { useAppSelector } from '@/hooks/useAppSelector';

export type VariableType = 'string' | 'string[]';

export interface SystemVariableContext {
  user?: {
    uid?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    department_name?: string;
    division_name?: string;
  };
  superior?: { name?: string; username?: string;[key: string]: any }[];
  departments?: { department_name: string;[key: string]: any }[];
  divisions?: { division_name: string;[key: string]: any }[];
  teams?: { team_name: string }[];
  factoryplants?: { plant_shortname?: string; plant_description?: string;[key: string]: any }[];
  srfsamplecategoryes?: { samplecat_name: string;[key: string]: any }[];
  linkeddistributors?: { company_name: string;[key: string]: any }[];
  skulist?: { product_name_complete: string;[key: string]: any }[];
}

export const useSystemVariableContext = (): SystemVariableContext => {
  const auth = useAppSelector(state => state.auth);
  const userManagement = useAppSelector(state => state.userManagement);
  const srf = useAppSelector(state => state.srf);
  const sku = useAppSelector(state => state.sku);

  return {
    user: auth.user,
    superior: userManagement.users?.filter(u =>
      u.role_name?.toLowerCase().includes('manager') ||
      u.role_name?.toLowerCase().includes('supervisor')
    ) || [],
    departments: userManagement.departments?.map(d => ({
      department_name: d.department_name,
      ...d
    })) || [],
    divisions: userManagement.departments?.map(d => ({
      division_name: d.department_name, // Use department_name as division_name fallback
      ...d
    })) || [],
    teams: userManagement.teams || [],
    factoryplants: srf.factoryplants?.map(f => ({
      plant_shortname: f.plant_shortname || '',
      plant_description: f.plant_description || '',
      ...f
    })) || [],
    srfsamplecategoryes: srf.srfsamplecategoryes?.map(s => ({
      samplecat_name: s.samplecat_name || '',
      ...s
    })) || [],
    linkeddistributors: srf.linkeddistributors?.map(d => ({
      company_name: d.company_name || '',
      ...d
    })) || [],
    skulist: sku.skulist || [],
  };
};


export interface SystemVariableEntry {
  key: string;
  type: VariableType;
  description: string;
  resolve: (ctx: SystemVariableContext) => string | string[];
}

export const SYSTEM_VARIABLE_ENTRIES: SystemVariableEntry[] = [
  {
    key: '${user}',
    type: 'string',
    description: 'Full name or UID of the current user',
    resolve: (ctx) => {
      const { firstname, lastname, uid } = ctx.user || {};
      if (firstname || lastname) return `${firstname || ''} ${lastname || ''}`.trim();
      return uid || '';
    },
  },
  {
    key: '${user.email}',
    type: 'string',
    description: 'Email address of the current user',
    resolve: (ctx) => ctx.user?.email || '',
  },
  {
    key: '${user.department}',
    type: 'string',
    description: 'Department name of the current user',
    resolve: (ctx) => ctx.user?.department_name || '',
  },
  {
    key: '${user.division}',
    type: 'string',
    description: 'Division name of the current user',
    resolve: (ctx) => ctx.user?.division_name || '',
  },
  {
    key: '${superior}',
    type: 'string[]',
    description: 'List of supervisors/managers',
    resolve: (ctx) => ctx.superior?.map(s => s.name || s.username) || [],
  },
  {
    key: '${departments}',
    type: 'string[]',
    description: 'All departments',
    resolve: (ctx) => ctx.departments?.map(d => d.department_name) || [],
  },
  {
    key: '${divisions}',
    type: 'string[]',
    description: 'All divisions',
    resolve: (ctx) => ctx.divisions?.map(d => d.division_name) || [],
  },
  {
    key: '${teams}',
    type: 'string[]',
    description: 'All teams',
    resolve: (ctx) => ctx.teams?.map(t => t.team_name) || [],
  },
  {
    key: '${factoryplants}',
    type: 'string[]',
    description: 'Factory plant objects with id and label for filtering',
    resolve: (ctx) =>
    (ctx.factoryplants?.map(f => ({
      plan_id: f.plan_id,
      label: f.plant_shortname,
      description: f.plant_description,
    })) || []),
  },
  {
    key: '${srfsamplecategoryes}',
    type: 'string[]',
    description: 'SRF sample category names',
    resolve: (ctx) => ctx.srfsamplecategoryes?.map(s => s.samplecat_name) || [],
  },
  {
    key: '${linkeddistributors}',
    type: 'string[]',
    description: 'Linked distributor names',
    resolve: (ctx) => ctx.linkeddistributors?.map(d => d.company_name) || [],
  },
  {
    key: '${skulist}',
    type: 'string[]',
    description: 'List All SKUs',
    resolve: (ctx) => ctx.skulist?.map(d => d.product_name_complete) || [],
  },
];
