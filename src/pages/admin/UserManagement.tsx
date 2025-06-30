
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import UserFilters from '@/components/filters/UserFilters';
import { UserModal } from '@/components/modals/UserModal';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import {
  fetchUsers,
  fetchDepartments,
  fetchRoles,
  fetchTeams,
  updateUser,
  deleteUser,
  UserType
} from '@/store/slices/userManagementSlice';
import { highlightSearchTerm, searchInObject } from '@/utils/searchUtils';
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import UserStatusBadge from '@/components/ui/UserStatusBadge';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { users, departments, roles, teams, isLoading, error } = useAppSelector(state => state.userManagement);

  const [searchValue, setSearchValue] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDepartments());
    dispatch(fetchRoles());
    dispatch(fetchTeams());
  }, [dispatch]);

  const filteredUsers = users.filter(user => {
    const roleFilter = selectedRole === 'all' || user.role_id.toString() === selectedRole;
    const departmentFilter = selectedDepartment === 'all' || user.department_id?.toString() === selectedDepartment;
    const teamFilter = selectedTeam === 'all' || user.team_id?.toString() === selectedTeam;
    const statusFilter = selectedStatus === 'all' || 
      (selectedStatus === 'active' && user.is_active) || 
      (selectedStatus === 'inactive' && !user.is_active);
    const searchFilter = searchInObject(user, searchValue);

    return roleFilter && departmentFilter && teamFilter && statusFilter && searchFilter;
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const user = users.find(u => u.user_id === userId);
      if (!user) return;

      await dispatch(updateUser({
        id: userId,
        data: { is_active: !user.is_active }
      })).unwrap();

      toast({
        title: "Success",
        description: "User status updated successfully",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast({
          title: "Success",
          description: "User deleted successfully",
          variant: "default",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error || "Failed to delete user",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveUser = async (userData: UserType) => {
    // Implementation for saving user
    console.log('Saving user:', userData);
    setIsModalOpen(false);
  };

  const renderHighlightedText = (text: string) => {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: highlightSearchTerm(text, searchValue)
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage system users, roles, and permissions</p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10"
                />
              </div>
              <UserFilters />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Department</th>
                    <th className="text-left p-2">Team</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">
                            {renderHighlightedText(`${user.firstname} ${user.lastname}`)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {renderHighlightedText(user.uid || '')}
                          </p>
                        </div>
                      </td>
                      <td className="p-2">
                        {renderHighlightedText(user.email)}
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">
                          {renderHighlightedText(user.role_name)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {renderHighlightedText(user.team_name || 'N/A')}
                      </td>
                      <td className="p-2">
                        {renderHighlightedText(user.team_name || 'N/A')}
                      </td>
                      <td className="p-2">
                        <UserStatusBadge isActive={user.is_active} />
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user.user_id)}
                          >
                            {user.is_active ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          user={editingUser}
          departments={departments}
          roles={roles}
        />
      </div>
    </AppLayout>
  );
};

export default UserManagement;
