
import React, { useState } from 'react';
import { CheckSquare, Clock, User, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import ProgressionBar from "@/components/ui/ProgressionBar";

const approvalSteps = [
  { id: '1', name: 'Supervisor', status: 'approved' as const, date: '2024-06-10' },
  { id: '2', name: 'Manager', status: 'pending' as const },
  { id: '3', name: 'Director', status: 'waiting' as const },
];

const pendingTasks = [
  {
    id: "SPB-2024-001",
    type: "Surat Permintaan Barang",
    requester: "Ahmad Rahman",
    department: "Produksi",
    priority: "High",
    created: "2024-06-10",
    amount: "Rp 2,500,000",
    status: "Pending Approval",
    approvalSteps: approvalSteps
  },
  {
    id: "AR-2024-015",
    type: "Asset Request",
    requester: "Siti Nurhaliza",
    department: "Marketing",
    priority: "Medium",
    created: "2024-06-09", 
    amount: "Rp 15,000,000",
    status: "Pending Approval",
    approvalSteps: [
      { id: '1', name: 'Supervisor', status: 'approved' as const, date: '2024-06-09' },
      { id: '2', name: 'Manager', status: 'approved' as const, date: '2024-06-10' },
      { id: '3', name: 'Director', status: 'pending' as const },
    ]
  },
  {
    id: "IT-2024-089",
    type: "IT Support",
    requester: "Budi Santoso",
    department: "Finance",
    priority: "Low",
    created: "2024-06-08",
    amount: "-",
    status: "Pending Review",
    approvalSteps: [
      { id: '1', name: 'IT Head', status: 'pending' as const },
      { id: '2', name: 'CTO', status: 'waiting' as const },
    ]
  }
];

const completedTasks = [
  {
    id: "SPB-2024-002",
    type: "Surat Permintaan Barang", 
    requester: "John Doe",
    department: "Gudang",
    priority: "Medium",
    created: "2024-06-05",
    completed: "2024-06-07",
    amount: "Rp 1,200,000",
    status: "Approved",
    approvalSteps: [
      { id: '1', name: 'Supervisor', status: 'approved' as const, date: '2024-06-05' },
      { id: '2', name: 'Manager', status: 'approved' as const, date: '2024-06-06' },
      { id: '3', name: 'Director', status: 'approved' as const, date: '2024-06-07' },
    ]
  },
  {
    id: "AR-2024-014",
    type: "Asset Request",
    requester: "Jane Smith",
    department: "HR",
    priority: "High",
    created: "2024-06-03",
    completed: "2024-06-06",
    amount: "Rp 8,500,000", 
    status: "Rejected",
    approvalSteps: [
      { id: '1', name: 'Supervisor', status: 'approved' as const, date: '2024-06-03' },
      { id: '2', name: 'Manager', status: 'rejected' as const, date: '2024-06-06' },
    ]
  }
];

const TaskList = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchValue, setSearchValue] = useState("");

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
      case "Approved": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Pending Approval": return "bg-orange-100 text-orange-800";
      case "Pending Review": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filterTasks = (tasks: any[]) => {
    if (!searchValue) return tasks;
    return tasks.filter(task => 
      task.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      task.type.toLowerCase().includes(searchValue.toLowerCase()) ||
      task.requester.toLowerCase().includes(searchValue.toLowerCase()) ||
      task.department.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <AppLayout 
      searchValue={searchValue} 
      onSearchChange={setSearchValue}
      searchPlaceholder="Search tasks..."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task List</h1>
            <p className="text-gray-600">Review and approve pending requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Tasks</p>
                  <p className="text-xl font-semibold text-gray-900">{filterTasks(pendingTasks).length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending ({filterTasks(pendingTasks).length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4" />
              <span>Completed ({filterTasks(completedTasks).length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Pending Approvals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Approval Progress</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTasks(pendingTasks).map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-mono font-medium">
                          {highlightText(task.id, searchValue)}
                        </TableCell>
                        <TableCell>{highlightText(task.type, searchValue)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{highlightText(task.requester, searchValue)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{highlightText(task.department, searchValue)}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.amount}</TableCell>
                        <TableCell>
                          <ProgressionBar steps={task.approvalSteps} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{task.created}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5" />
                  <span>Completed Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Final Status</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTasks(completedTasks).map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-mono font-medium">
                          {highlightText(task.id, searchValue)}
                        </TableCell>
                        <TableCell>{highlightText(task.type, searchValue)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{highlightText(task.requester, searchValue)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{highlightText(task.department, searchValue)}</TableCell>
                        <TableCell>{task.amount}</TableCell>
                        <TableCell>
                          <ProgressionBar steps={task.approvalSteps} />
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{task.completed}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default TaskList;
