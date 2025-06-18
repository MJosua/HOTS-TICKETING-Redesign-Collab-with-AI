
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WorkflowGroup } from '@/store/slices/userManagementSlice';

interface WorkflowGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowGroup: WorkflowGroup | null;
  mode: 'add' | 'edit';
  onSave: (workflowGroup: any) => void;
  users: any[];
}

const WorkflowGroupModal = ({ isOpen, onClose, workflowGroup, mode, onSave }: WorkflowGroupModalProps) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    category_ids: [],
    is_active: true
  });

  useEffect(() => {
    if (workflowGroup && mode === 'edit') {
      setFormData({
        name: workflowGroup.name,
        description: workflowGroup.description,
        category_ids: workflowGroup.category_ids,
        is_active: workflowGroup.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category_ids: [],
        is_active: true
      });
    }
  }, [workflowGroup, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  const handleSave = () => {
    const workflowToSave = mode === 'edit' && workflowGroup 
      ? { ...formData, workflow_group_id: workflowGroup.workflow_group_id }
      : formData;
    
    onSave(workflowToSave);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Create New Workflow Group' : 'Edit Workflow Group'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter workflow group name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this workflow group"
                rows={3}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Create Workflow Group' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowGroupModal;
