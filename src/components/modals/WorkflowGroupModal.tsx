import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';

interface ApprovalStep {
  order: number;
  type: 'role' | 'specific_user' | 'superior' | 'team';
  value: string | number;
  description: string;
}

interface WorkflowGroup {
  id: string;
  name: string;
  description: string;
  category_ids: number[];
  approval_steps: ApprovalStep[];
}

interface UserType {
  user_id: number;
  firstname: string;
  lastname: string;
  uid: string;
  role_name: string;
  team_name: string;
}

interface WorkflowGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowGroup: WorkflowGroup | null;
  mode: 'add' | 'edit';
  onSave: (workflowGroup: WorkflowGroup) => void;
  users: UserType[];
}

const WorkflowGroupModal = ({ isOpen, onClose, workflowGroup, mode, onSave, users }: WorkflowGroupModalProps) => {
  const { teams } = useAppSelector(state => state.userManagement);
  const [formData, setFormData] = useState<WorkflowGroup>({
    id: '',
    name: '',
    description: '',
    category_ids: [],
    approval_steps: []
  });


  useEffect(() => {
    if (workflowGroup && mode === 'edit') {
      setFormData(workflowGroup);
    } else {
      setFormData({
        id: Date.now().toString(),
        name: '',
        description: '',
        category_ids: [],
        approval_steps: []
      });
    }
  }, [workflowGroup, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addApprovalStep = () => {
    const newStep: ApprovalStep = {
      order: formData.approval_steps.length + 1,
      type: 'role',
      value: '',
      description: ''
    };
    setFormData({
      ...formData,
      approval_steps: [...formData.approval_steps, newStep]
    });
  };

  const updateApprovalStep = (index: number, field: keyof ApprovalStep, value: any) => {
    const newSteps = [...formData.approval_steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, approval_steps: newSteps });
  };

  const removeApprovalStep = (index: number) => {
    const newSteps = formData.approval_steps.filter((_, i) => i !== index);
    // Reorder the remaining steps
    const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i + 1 }));
    setFormData({ ...formData, approval_steps: reorderedSteps });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...formData.approval_steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newSteps.length) {
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
      // Update order numbers
      newSteps.forEach((step, i) => step.order = i + 1);
      setFormData({ ...formData, approval_steps: newSteps });
    }
  };

  const getUniqueRoles = () => {
    const roles = users.map(user => user.role_name).filter(role => role != null && role !== '');
    return [...new Set(roles)];
  };

  const getUniqueTeams = () => {
    return teams.map(team => team.team_name).filter(teamName => teamName != null && teamName !== '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Approval Steps</CardTitle>
                <Button type="button" size="sm" onClick={addApprovalStep}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.approval_steps.map((step, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Step {step.order}</Badge>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moveStep(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => moveStep(index, 'down')}
                          disabled={index === formData.approval_steps.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeApprovalStep(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Approval Type</Label>
                      <Select
                        value={step.type}
                        onValueChange={(value: 'role' | 'specific_user' | 'superior' | 'team') => 
                          updateApprovalStep(index, 'type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="role">By Role</SelectItem>
                          <SelectItem value="specific_user">Specific User</SelectItem>
                          <SelectItem value="superior">Direct Superior</SelectItem>
                          <SelectItem value="team">By Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {step.type === 'role' && (
                      <div className="grid gap-2">
                        <Label>Role</Label>
                        <Select
                          value={step.value ? step.value.toString() : ""}
                          onValueChange={(value) => updateApprovalStep(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {getUniqueRoles().map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {step.type === 'team' && (
                      <div className="grid gap-2">
                        <Label>Team</Label>
                        <Select
                          value={step.value ? step.value.toString() : ""}
                          onValueChange={(value) => updateApprovalStep(index, 'value', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {getUniqueTeams().map((team) => (
                              <SelectItem key={team} value={team}>
                                {team}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {step.type === 'specific_user' && (
                      <div className="grid gap-2">
                        <Label>User</Label>
                        <Select
                          value={step.value ? step.value.toString() : ""}
                          onValueChange={(value) => updateApprovalStep(index, 'value', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {users
                            .map((user) => (
                              <SelectItem key={user.user_id} value={user.user_id}>
                                {user.firstname} {user.lastname} ({user.role_name}) - {user.user_id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Input
                        value={step.description}
                        onChange={(e) => updateApprovalStep(index, 'description', e.target.value)}
                        placeholder="Describe this approval step"
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {formData.approval_steps.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No approval steps defined. Click "Add Step" to create one.
                </div>
              )}
            </CardContent>
          </Card>

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
