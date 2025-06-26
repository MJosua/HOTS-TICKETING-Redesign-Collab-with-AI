
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchRoles, fetchJobTitles, fetchSuperiors, UserType } from '@/store/slices/userManagementSlice';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  mode: 'add' | 'edit';
  onSave: (user: UserType) => void;
}

const UserModal = ({ isOpen, onClose, user, mode, onSave }: UserModalProps) => {
  const dispatch = useAppDispatch();
  const { users, roles, jobTitles, superiors, departments, teams } = useAppSelector(state => state.userManagement);

  const [formData, setFormData] = useState<UserType>({
    user_id: 0,
    firstname: '',
    lastname: '',
    uid: '',
    email: '',
    role_id: 0,
    role_name: '',
    department_id: 0,
    team_name: '',
    job_title: '',
    is_active: true,
    is_deleted: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchRoles());
      dispatch(fetchJobTitles());
      dispatch(fetchSuperiors());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData(user);
    } else {
      setFormData({
        user_id: 0,
        firstname: '',
        lastname: '',
        uid: '',
        email: '',
        role_id: 0,
        role_name: '',
        department_id: 0,
        team_name: '',
        job_title: '',
        is_active: true,
        is_deleted: false,
      });
    }
  }, [user, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('tokek');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (mode === 'add') {
        const response = await axios.post(`${API_URL}/hots_settings/post/user`, formData, { headers });

        if (response.data.success) {
          toast({
            title: "Success",
            description: "User created successfully",
          });
          onSave(formData);
          onClose();
        } else {
          throw new Error(response.data.message || 'Failed to create user');
        }
      } else {
        const response = await axios.put(`${API_URL}/hots_settings/update/user/${user?.user_id}`, formData, { headers });

        if (response.data.success) {
          toast({
            title: "Success",
            description: "User updated successfully",
          });
          onSave(formData);
          onClose();
        } else {
          throw new Error(response.data.message || 'Failed to update user');
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || 'Failed to save user',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof UserType, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-populate role_name when role_id changes
      if (field === 'role_id') {
        const selectedRole = roles.find(r => r.role_id === value);
        if (selectedRole) {
          newData.role_name = selectedRole.role_name;
        }
      }

      // Auto-populate job_title when jobtitle_id changes
      if (field === 'jobtitle_id') {
        const selectedJobTitle = jobTitles.find(j => j.jobtitle_id === value);
        if (selectedJobTitle) {
          newData.job_title = selectedJobTitle.job_title || selectedJobTitle.jobtitle_name;
        }
      }

      return newData;
    });
  };

  const getDepartmentName = (departmentId: number) => {
    const department = departments.find(d => d.department_id === departmentId);
    return department ? department.department_name : 'Unknown Department';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New User' : 'Edit User'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                value={formData.firstname}
                onChange={(e) => handleChange('firstname', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={(e) => handleChange('lastname', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="uid">User ID</Label>
            <Input
              id="uid"
              value={formData.uid}
              onChange={(e) => handleChange('uid', e.target.value)}
              placeholder="Enter user ID"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="department_id">Department</Label>
            <Select
              value={formData.department_id?.toString() || ""}
              onValueChange={(value) => handleChange('department_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments && departments.length > 0 ? (
                  departments.map((dept) => (
                    <SelectItem
                      key={dept.department_id}
                      value={dept.department_id.toString()}
                    >
                      {dept.department_shortname}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="1">HR</SelectItem>
                    <SelectItem value="2">IT</SelectItem>
                    <SelectItem value="3">Finance</SelectItem>
                    <SelectItem value="4">Marketing</SelectItem>
                    <SelectItem value="5">Operations</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jobtitle_id">Job Title</Label>
            <Select
              value={formData.jobtitle_id?.toString() || ""}
              onValueChange={(value) => handleChange("jobtitle_id", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job title" />
              </SelectTrigger>
              <SelectContent>
                {jobTitles
                  .filter(j => j.department_id === formData.department_id)
                  .map((job) => (
                    <SelectItem
                      key={job.jobtitle_id}
                      value={job.jobtitle_id.toString()}
                    >
                      {job.job_title || job.jobtitle_name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role_id">Role</Label>
            <Select
              value={formData.role_id ? formData.role_id.toString() : ""}
              onValueChange={(value) => handleChange('role_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem
                    key={role.role_id}
                    value={role.role_id != null ? role.role_id.toString() : `role-${Math.random()}`}
                  >
                    {role.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="superior_id">Superior</Label>
            <Select
              value={formData.superior_id ? formData.superior_id.toString() : "no_superior"}
              onValueChange={(value) => handleChange('superior_id', value === "no_superior" ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select superior" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_superior">No Superior</SelectItem>
                {users.map((user) => (
                  <SelectItem
                    key={user.user_id}
                    value={user.user_id != null ? user.user_id.toString() : `superior-${Math.random()}`}
                  >
                    {user.firstname} {user.lastname} ({user.role_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'add' ? 'Add User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
