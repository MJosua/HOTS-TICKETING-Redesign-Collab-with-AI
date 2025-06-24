
import { useAppSelector } from '@/hooks/useAppSelector';
import { useEffect, useState } from 'react';

export interface SystemVariableContext {
  user?: any;
  superior?: any[];
  departments?: any[];
  divisions?: any[];
  teams?: any[];
  users?: any[];
  isLoading?: boolean;
}

/**
 * Enhanced system variable resolver with support for:
 * - Nested variables: ${user.manager.name}
 * - Filterable lists: ${departments(filter: "region = 'east'")}
 * - Fallback values: ${user.email || 'default@email.com'}
 */
export const resolveSystemVariable = (
  value: string,
  context: SystemVariableContext
): string | string[] => {
  if (!value || !value.includes('${')) return value;

  // Handle fallback syntax: ${variable || 'fallback'}
  const fallbackMatch = value.match(/\$\{([^}]+)\s*\|\|\s*['"]([^'"]+)['"]\}/);
  if (fallbackMatch) {
    const [, variablePart, fallbackValue] = fallbackMatch;
    const resolvedVariable = resolveSystemVariable(`\${${variablePart}}`, context);
    return (resolvedVariable && resolvedVariable !== '') ? resolvedVariable : fallbackValue;
  }

  // Handle nested object access: ${user.manager.name}
  const nestedMatch = value.match(/\$\{(\w+(?:\.\w+)+)\}/);
  if (nestedMatch) {
    const [, path] = nestedMatch;
    const pathParts = path.split('.');
    let current = context;
    
    for (const part of pathParts) {
      current = current?.[part];
      if (!current) break;
    }
    
    return current || '';
  }

  // Handle filtered variables: ${departments(filter: "region = 'east'")}
  const filterMatch = value.match(/\$\{(\w+)\(filter:\s*"([^"]+)"\)\}/);
  if (filterMatch) {
    const [, variableName, filterExpression] = filterMatch;
    
    // Parse filter like "region = 'east'" or "name contains 'manager'"
    const filterParts = filterExpression.split(/\s*(=|contains|!=)\s/);
    if (filterParts.length >= 3) {
      const [filterKey, operator, filterValue] = filterParts;
      const cleanFilterValue = filterValue.replace(/['"]/g, '');
      
      const dataArray = context[variableName as keyof SystemVariableContext];
      if (Array.isArray(dataArray)) {
        return dataArray
          .filter(item => {
            const itemValue = item[filterKey]?.toString().toLowerCase() || '';
            const searchValue = cleanFilterValue.toLowerCase();
            
            switch (operator) {
              case '=': return itemValue === searchValue;
              case 'contains': return itemValue.includes(searchValue);
              case '!=': return itemValue !== searchValue;
              default: return true;
            }
          })
          .map(item => item.name || item.department_name || item.team_name || item.username || item.toString());
      }
    }
  }

  // Handle simple variables
  switch (value) {
    case '${user}':
      return context.user?.username || context.user?.name || '';
    case '${user.email}':
      return context.user?.email || '';
    case '${user.department}':
      return context.user?.department_name || '';
    case '${user.division}':
      return context.user?.division_name || '';
    case '${user.id}':
      return context.user?.user_id?.toString() || context.user?.id?.toString() || '';
    case '${superior}':
      return context.superior?.map(s => s.name || s.username) || [];
    case '${departments}':
      return context.departments?.map(d => d.department_name) || [];
    case '${divisions}':
      return context.divisions?.map(d => d.division_name) || [];
    case '${teams}':
      return context.teams?.map(t => t.team_name) || [];
    case '${users}':
      return context.users?.map(u => u.username || u.name) || [];
    default:
      return value;
  }
};

/**
 * Hook to get system variable context with loading state
 */
export const useSystemVariableContext = (): SystemVariableContext => {
  const auth = useAppSelector(state => state.auth);
  const userManagement = useAppSelector(state => state.userManagement);
  
  // Check if essential data is still loading
  const isLoading = userManagement.isLoading || 
    (!auth.user && auth.isLoading) ||
    (userManagement.users.length === 0 && !userManagement.error) ||
    (userManagement.departments.length === 0 && !userManagement.error);
  
  return {
    user: auth.user,
    superior: userManagement.users?.filter(u => 
      u.role_name?.toLowerCase().includes('manager') || 
      u.role_name?.toLowerCase().includes('supervisor') ||
      u.role_name?.toLowerCase().includes('lead')
    ) || [],
    departments: userManagement.departments || [],
    divisions: userManagement.departments || [], // Use departments since divisions doesn't exist
    teams: userManagement.teams || [],
    users: userManagement.users || [],
    isLoading
  };
};

/**
 * Hook to ensure system data is loaded before rendering forms
 */
export const useSystemDataLoader = () => {
  const context = useSystemVariableContext();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Mark as ready when we have user data and at least some reference data
    const hasUser = !!context.user;
    const hasReferenceData = 
      context.departments.length > 0 || 
      context.teams.length > 0 || 
      context.users.length > 0;
    
    if (hasUser && (hasReferenceData || !context.isLoading)) {
      setIsReady(true);
    }
  }, [context]);
  
  return {
    ...context,
    isReady
  };
};

/**
 * Get available system variables for auto-complete/suggestions
 */
export const getAvailableSystemVariables = (): string[] => {
  return [
    '${user}',
    '${user.email}',
    '${user.department}',
    '${user.division}',
    '${user.id}',
    '${superior}',
    '${departments}',
    '${divisions}',
    '${teams}',
    '${users}',
    '${departments(filter: "department_name contains \'IT\'")}',
    '${users(filter: "role_name contains \'manager\'")}',
    '${user.email || \'default@company.com\'}'
  ];
};
