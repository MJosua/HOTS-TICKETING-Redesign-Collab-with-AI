
import React, { useState } from 'react';
import { CheckSquare, Clock, User, Calendar, Eye, Check, X, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const pendingTasks = [
  {
    id: "SPB-2024-001",
    type: "Surat Permintaan Barang",
    requester: "Ahmad Rahman",
    department: "Produksi",
    priority: "High",
    created: "2024-06-10",
    amount: "Rp 2,500,000",
    status: "Pending Approval"
  },
  {
    id: "AR-2024-015",
    type: "Asset Request",
    requester: "Siti Nurhaliza",
    department: "Marketing",
    priority: "Medium",
    created: "2024-06-09", 
    amount: "Rp 15,000,000",
    status: "Pending Approval"
  },
  {
    id: "IT-2024-089",
    type: "IT Support",
    requester: "Budi Santoso",
    department: "Finance",
    priority: "Low",
    created: "2024-06-08",
    amount: "-",
    status: "Pending Review"
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
    status: "Approved"
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
    status: "Rejected"
  }
];

const TaskList = () => {
  const [activeTab, setActiveTab] = useState("pending");

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

  return (
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
                <p className="text-xl font-semibold text-gray-900">{pendingTasks.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending ({pendingTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <CheckSquare className="w-4 h-4" />
            <span>Completed ({completedTasks.length})</span>
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
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono font-medium">{task.id}</TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{task.requester}</span>
                        </div>
                      </TableCell>
                      <TableCell>{task.department}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.amount}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{task.created}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        </div>
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
                    <TableHead>Completed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono font-medium">{task.id}</TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{task.requester}</span>
                        </div>
                      </TableCell>
                      <TableCell>{task.department}</TableCell>
                      <TableCell>{task.amount}</TableCell>
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
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        </div>
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
  );
};

export default TaskList;
