
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppSelector } from '@/hooks/useAppSelector';
import { Team } from '@/store/slices/userManagementSlice';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team?: Team | null;
  mode: 'add' | 'edit';
  onSave: (team: any) => void;
}

const TeamModal = ({ isOpen, onClose, team, mode, onSave }: TeamModalProps) => {
  const { departments } = useAppSelector(state => state.userManagement);
  const [formData, setFormData] = useState({
    team_name: '',
    department_id: '',
  });

  useEffect(() => {
    if (team && mode === 'edit') {
      setFormData({
        team_name: team.team_name,
        department_id: team.department_id.toString(),
      });
    } else {
      setFormData({
        team_name: '',
        department_id: '',
      });
    }
  }, [team, mode, isOpen]);

  const handleSave = () => {
    console.log("Submitting form data:", formData);

    const teamToSave = {
      ...formData,
      department_id: parseInt(formData.department_id)
    };
    onSave(teamToSave);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Team' : 'Edit Team'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team_name">Team Name</Label>
            <Input
              id="team_name"
              value={formData.team_name}
              onChange={(e) => setFormData({...formData, team_name: e.target.value})}
              placeholder="Enter team name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department_id} onValueChange={(value) => setFormData({...formData, department_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.department_id} value={department.department_id.toString()}>
                    {department.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {mode === 'add' ? 'Add Team' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamModal;
