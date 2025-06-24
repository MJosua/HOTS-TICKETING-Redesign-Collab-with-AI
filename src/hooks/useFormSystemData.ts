
import { useEffect } from 'react';
import { useAppDispatch } from './useAppSelector';
import { fetchUsers, fetchDepartments, fetchTeams, fetchRoles } from '@/store/slices/userManagementSlice';
import { useSystemDataLoader } from '@/utils/systemVariableResolver';

/**
 * Hook to ensure all necessary system data is loaded for forms
 * with system variables
 */
export const useFormSystemData = () => {
  const dispatch = useAppDispatch();
  const systemData = useSystemDataLoader();

  useEffect(() => {
    // Fetch all necessary data for system variables
    const fetchPromises = [];

    if (systemData.users.length === 0) {
      fetchPromises.push(dispatch(fetchUsers()));
    }
    
    if (systemData.departments.length === 0) {
      fetchPromises.push(dispatch(fetchDepartments()));
    }
    
    if (systemData.teams.length === 0) {
      fetchPromises.push(dispatch(fetchTeams()));
    }

    // Execute all fetches in parallel
    Promise.all(fetchPromises).catch(error => {
      console.error('Failed to fetch system data:', error);
    });
  }, [dispatch, systemData.users.length, systemData.departments.length, systemData.teams.length]);

  return systemData;
};
