import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import { API_URL } from '@/config/sourceConfig';
import { useToast } from '@/hooks/use-toast';

interface User {
  user_id?: number;
  firstname: string;
  lastname: string;
  uid: string;
  email: string;
  role_id: number;
  role_name: string;
  department_id: number;
  team_name: string;
  job_title: string;
  superior_id?: number;
  team_id?: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  mode: 'add' | 'edit';
  onSave: (user: User) => void;
}

const UserModal = ({ isOpen, onClose, user, mode, onSave }: UserModalProps) => {
  const [formData, setFormData] = useState<User>({
    firstname: '',
    lastname: '',
    uid: '',
    email: '',
    role_id: 0,
    role_name: '',
    department_id: 0,
    team_name: '',
    job_title: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData(user);
    } else {
      setFormData({
        firstname: '',
        lastname: '',
        uid: '',
        email: '',
        role_id: 0,
        role_name: '',
        department_id: 0,
        team_name: '',
        job_title: ''
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

  const handleChange = (field: keyof User, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <Label htmlFor="team_name">Team</Label>
            <Select value={formData.team_name} onValueChange={(value) => handleChange('team_name', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role_name">Role</Label>
            <Select value={formData.role_name} onValueChange={(value) => handleChange('role_name', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrator">Administrator</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Executor">Executor</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              value={formData.job_title}
              onChange={(e) => handleChange('job_title', e.target.value)}
              placeholder="Enter job title"
            />
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
