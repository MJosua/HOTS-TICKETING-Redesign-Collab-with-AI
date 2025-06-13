import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { CheckSquare, FileText, List, Settings, LogOut, Monitor, Users, Search, Home } from 'lucide-react';
import ProgressionBar from "@/components/ui/ProgressionBar";
import { cn } from "@/lib/utils";

const TaskList = () => {
  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock data with approval steps
  const [tasks] = useState([
    {
      id: "SPB-2024-001",
      type: "Surat Permintaan Barang",
      requester: "Ahmad Rahman",
      department: "Produksi",
      priority: "High",
      created: "2024-06-10",
      amount: "Rp 2,500,000",
      status: "Pending Approval",
      approvalSteps: [
        { id: '1', name: 'Supervisor', status: 'approved' as const },
        { id: '2', name: 'Manager', status: 'pending' as const },
        { id: '3', name: 'Director', status: 'waiting' as const },
      ]
    },
    {
      id: "IT-2024-045",
      type: "IT Support Request",
      requester: "Sari Dewi",
      department: "Finance",
      priority: "Medium",
      created: "2024-06-11",
      amount: "-",
      status: "In Progress",
      approvalSteps: [
        { id: '1', name: 'IT Manager', status: 'approved' as const },
        { id: '2', name: 'Head of IT', status: 'approved' as const },
      ]
    },
    {
      id: "AST-2024-078",
      type: "Asset Request",
      requester: "Budi Santoso",
      department: "HR",
      priority: "Low",
      created: "2024-06-09",
      amount: "Rp 1,200,000",
      status: "Approved",
      approvalSteps: [
        { id: '1', name: 'HR Manager', status: 'approved' as const },
        { id: '2', name: 'Finance Manager', status: 'approved' as const },
        { id: '3', name: 'Director', status: 'approved' as const },
      ]
    }
  ]);

  const filteredTasks = tasks.filter(task => {
    const searchRegex = new RegExp(searchValue, 'i');
    const statusFilter = filterStatus === 'all' || task.status === filterStatus;
    const priorityFilter = filterPriority === 'all' || task.priority === filterPriority;

    return searchRegex.test(task.id) && statusFilter && priorityFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Approval": return "bg-orange-100 text-orange-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Approved": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const navigate = useNavigate();

  const handleRowClick = (taskId: string) => {
    navigate(`/ticket/${taskId}`);
  };

  return (
    <AppLayout searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Search tasks...">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Task List</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              {filteredTasks.length} Tasks
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="status-filter">Status:</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="priority-filter">Priority:</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ticket ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTasks.map((task) => (
                    <tr 
                      key={task.id} 
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleRowClick(task.id)}
                    >
                      <td className="px-6 py-4 font-medium text-primary">{task.id}</td>
                      <td className="px-6 py-4 text-muted-foreground">{task.type}</td>
                      <td className="px-6 py-4 text-muted-foreground">{task.requester}</td>
                      <td className="px-6 py-4 text-muted-foreground">{task.department}</td>
                      <td className="px-6 py-4">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <ProgressionBar steps={task.approvalSteps} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{task.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TaskList;
