import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Play, FileText, Upload, Mail, Settings } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchCustomFunctions, createCustomFunction, executeCustomFunction } from '@/store/slices/customFunctionSlice';
import { useToast } from '@/hooks/use-toast';
import { CustomFunction } from '@/types/customFunctionTypes';

export default function CustomFunctionManager() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { functions, isLoading, isExecuting, error } = useAppSelector(state => state.customFunction);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFunction, setNewFunction] = useState<Partial<CustomFunction>>({
    name: '',
    type: 'document_generation',
    handler: '',
    config: {},
    is_active: true
  });

  useEffect(() => {
    dispatch(fetchCustomFunctions());
  }, [dispatch]);

  const handleCreateFunction = async () => {
    try {
      await dispatch(createCustomFunction(newFunction)).unwrap();
      toast({
        title: "Success",
        description: "Custom function created successfully",
      });
      setIsCreateModalOpen(false);
      setNewFunction({
        name: '',
        type: 'document_generation',
        handler: '',
        config: {},
        is_active: true
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to create custom function",
        variant: "destructive",
      });
    }
  };

  const handleTestFunction = async (functionId: number) => {
    try {
      await dispatch(executeCustomFunction({ 
        ticketId: 1, // Test ticket ID
        functionId,
        params: { test: true }
      })).unwrap();
      toast({
        title: "Success",
        description: "Function executed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to execute function",
        variant: "destructive",
      });
    }
  };

  const getFunctionIcon = (type: string) => {
    switch (type) {
      case 'document_generation': return <FileText className="w-4 h-4" />;
      case 'excel_processing': return <Upload className="w-4 h-4" />;
      case 'email_notification': return <Mail className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Custom Functions</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Function
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {functions.map((func) => (
          <Card key={func.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFunctionIcon(func.type)}
                  <div>
                    <CardTitle className="text-lg">{func.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Handler: {func.handler}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={func.is_active ? "default" : "secondary"}>
                    {func.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{func.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(func.created_date).toLocaleDateString()}
                </p>
                <div className="space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleTestFunction(func.id)}
                    disabled={isExecuting}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Test
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Custom Function</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="functionName">Function Name</Label>
                <Input
                  id="functionName"
                  value={newFunction.name}
                  onChange={(e) => setNewFunction({ ...newFunction, name: e.target.value })}
                  placeholder="Enter function name"
                />
              </div>
              
              <div>
                <Label htmlFor="functionType">Function Type</Label>
                <Select 
                  value={newFunction.type} 
                  onValueChange={(value) => setNewFunction({ ...newFunction, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select function type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document_generation">Document Generation</SelectItem>
                    <SelectItem value="excel_processing">Excel Processing</SelectItem>
                    <SelectItem value="email_notification">Email Notification</SelectItem>
                    <SelectItem value="api_integration">API Integration</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="functionHandler">Handler Function</Label>
                <Input
                  id="functionHandler"
                  value={newFunction.handler}
                  onChange={(e) => setNewFunction({ ...newFunction, handler: e.target.value })}
                  placeholder="Enter handler function name"
                />
              </div>
              
              <div>
                <Label htmlFor="functionConfig">Configuration (JSON)</Label>
                <Textarea
                  id="functionConfig"
                  value={JSON.stringify(newFunction.config, null, 2)}
                  onChange={(e) => {
                    try {
                      const config = JSON.parse(e.target.value);
                      setNewFunction({ ...newFunction, config });
                    } catch (error) {
                      // Invalid JSON, keep the string value
                    }
                  }}
                  placeholder="Enter configuration as JSON"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFunction} disabled={isLoading}>
                  Create Function
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
