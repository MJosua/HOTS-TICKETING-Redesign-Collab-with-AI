
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { 
  fetchServiceFunctions,
  assignFunctionToService,
  fetchCustomFunctions 
} from '@/store/slices/customFunctionSlice';
import { useToast } from '@/hooks/use-toast';

interface ServiceFunctionAssignmentProps {
  serviceId: number;
  serviceName: string;
}

export default function ServiceFunctionAssignment({ serviceId, serviceName }: ServiceFunctionAssignmentProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { functions, serviceFunctions, isLoading } = useAppSelector(state => state.customFunction);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    function_id: '',
    trigger_event: '',
    execution_order: 1,
    config: '{}'
  });

  useEffect(() => {
    dispatch(fetchCustomFunctions());
    dispatch(fetchServiceFunctions(serviceId));
  }, [dispatch, serviceId]);

  const handleAssignFunction = async () => {
    if (!newAssignment.function_id || !newAssignment.trigger_event) {
      toast({
        title: "Error",
        description: "Please select both function and trigger event",
        variant: "destructive",
      });
      return;
    }

    try {
      let config = {};
      try {
        config = JSON.parse(newAssignment.config);
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid JSON configuration",
          variant: "destructive",
        });
        return;
      }

      await dispatch(assignFunctionToService({
        service_id: serviceId,
        function_id: parseInt(newAssignment.function_id),
        trigger_event: newAssignment.trigger_event,
        execution_order: newAssignment.execution_order,
        config
      })).unwrap();

      toast({
        title: "Success",
        description: "Function assigned to service successfully",
      });
      
      setIsAssignModalOpen(false);
      setNewAssignment({
        function_id: '',
        trigger_event: '',
        execution_order: 1,
        config: '{}'
      });
      
      // Refresh service functions
      dispatch(fetchServiceFunctions(serviceId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to assign function to service",
        variant: "destructive",
      });
    }
  };

  const triggerEvents = [
    { value: 'on_created', label: 'On Created' },
    { value: 'on_approved', label: 'On Approved' },
    { value: 'on_step_approved', label: 'On Step Approved' },
    { value: 'on_rejected', label: 'On Rejected' },
    { value: 'on_final_approved', label: 'On Final Approved' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Function Assignments for "{serviceName}"</h3>
        <Button onClick={() => setIsAssignModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Assign Function
        </Button>
      </div>

      <div className="space-y-3">
        {serviceFunctions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No functions assigned to this service yet.</p>
        ) : (
          serviceFunctions.map((assignment) => {
            const func = functions.find(f => f.id === assignment.function_id);
            return (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{func?.name || 'Unknown Function'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{assignment.trigger_event}</Badge>
                          <Badge variant="secondary">Order: {assignment.execution_order}</Badge>
                          <Badge variant={assignment.is_active ? "default" : "secondary"}>
                            {assignment.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Assign Function to Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="functionSelect">Select Function</Label>
                <Select 
                  value={newAssignment.function_id} 
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, function_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a function" />
                  </SelectTrigger>
                  <SelectContent>
                    {functions.filter(f => f.is_active).map((func) => (
                      <SelectItem key={func.id} value={func.id.toString()}>
                        {func.name} ({func.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="triggerEvent">Trigger Event</Label>
                <Select 
                  value={newAssignment.trigger_event} 
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, trigger_event: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerEvents.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="executionOrder">Execution Order</Label>
                <Input
                  id="executionOrder"
                  type="number"
                  min="1"
                  value={newAssignment.execution_order}
                  onChange={(e) => setNewAssignment({ ...newAssignment, execution_order: parseInt(e.target.value) || 1 })}
                />
              </div>
              
              <div>
                <Label htmlFor="config">Configuration (JSON)</Label>
                <Textarea
                  id="config"
                  value={newAssignment.config}
                  onChange={(e) => setNewAssignment({ ...newAssignment, config: e.target.value })}
                  placeholder="Enter configuration as JSON"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignFunction} disabled={isLoading}>
                  Assign Function
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
