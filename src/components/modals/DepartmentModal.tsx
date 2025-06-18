
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppSelector } from '@/hooks/useAppSelector';
import { Department } from '@/store/slices/userManagementSlice';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: Department | null;
  mode: 'add' | 'edit';
  onSave: (department: any) => void;
}

const DepartmentModal = ({ isOpen, onClose, department, mode, onSave }: DepartmentModalProps) => {
  const { users } = useAppSelector(state => state.userManagement);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head_user_id: '',
    status: 'active'
  });

  useEffect(() => {
    if (department && mode === 'edit') {
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description,
        head_user_id: department.head_user_id?.toString() || '',
        status: department.status
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        head_user_id: '',
        status: 'active'
      });
    }
  }, [department, mode, isOpen]);

  const handleSave = () => {
    const departmentToSave = {
      ...formData,
      head_user_id: formData.head_user_id ? parseInt(formData.head_user_id) : null
    };
    onSave(departmentToSave);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Department' : 'Edit Department'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter department name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Department Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="Enter department code"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="head">Department Head</Label>
            <Select value={formData.head_user_id} onValueChange={(value) => setFormData({...formData, head_user_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select department head" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No head assigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id.toString()}>
                    {user.firstname} {user.lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {mode === 'add' ? 'Add Department' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentModal;
