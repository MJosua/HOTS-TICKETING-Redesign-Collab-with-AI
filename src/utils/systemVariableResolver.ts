
import { useAppSelector } from '@/hooks/useAppSelector';

export interface SystemVariableContext {
  user?: any;
  superior?: any[];
  departments?: any[];
  divisions?: any[];
  teams?: any[];
}

/**
 * Resolves system variables in field values and options
 */
export const resolveSystemVariable = (
  value: string,
  context: SystemVariableContext
): string | string[] => {
  if (!value || !value.includes('${')) return value;

  // Handle simple variables
  if (value === '${user}') {
    return context.user?.username || context.user?.name || '';
  }

  if (value === '${user.email}') {
    return context.user?.email || '';
  }

  if (value === '${user.department}') {
    return context.user?.department_name || '';
  }

  if (value === '${user.division}') {
    return context.user?.division_name || '';
  }

  // Handle array variables for select options
  if (value === '${superior}') {
    return context.superior?.map(s => s.name || s.username) || [];
  }

  if (value === '${departments}') {
    return context.departments?.map(d => d.department_name) || [];
  }

  if (value === '${divisions}') {
    return context.divisions?.map(d => d.division_name) || [];
  }

  if (value === '${teams}') {
    return context.teams?.map(t => t.team_name) || [];
  }

  // Handle filtered variables (basic implementation)
  const filterMatch = value.match(/\$\{(\w+)\(filter:\s*"([^"]+)"\)\}/);
  if (filterMatch) {
    const [, variableName, filterExpression] = filterMatch;
    
    // Parse simple filter like "name = john"
    const filterParts = filterExpression.split('=').map(p => p.trim());
    if (filterParts.length === 2) {
      const [filterKey, filterValue] = filterParts;
      const cleanFilterValue = filterValue.replace(/['"]/g, '');
      
      if (variableName === 'superior' && context.superior) {
        return context.superior
          .filter(s => s[filterKey]?.toLowerCase().includes(cleanFilterValue.toLowerCase()))
          .map(s => s.name || s.username) || [];
      }
      
      if (variableName === 'departments' && context.departments) {
        return context.departments
          .filter(d => d[filterKey]?.toLowerCase().includes(cleanFilterValue.toLowerCase()))
          .map(d => d.department_name) || [];
      }
    }
  }

  // If no variable found, return original value
  return value;
};

/**
 * Hook to get system variable context from Redux store
 */
export const useSystemVariableContext = (): SystemVariableContext => {
  const auth = useAppSelector(state => state.auth);
  const userManagement = useAppSelector(state => state.userManagement);
  
  return {
    user: auth.user,
    superior: userManagement.users?.filter(u => 
      u.role_name?.toLowerCase().includes('manager') || 
      u.role_name?.toLowerCase().includes('supervisor')
    ) || [],
    departments: userManagement.departments || [],
    divisions: userManagement.divisions || [],
    teams: userManagement.teams || []
  };
};
