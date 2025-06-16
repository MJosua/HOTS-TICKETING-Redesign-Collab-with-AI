import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import ProgressionBar from "@/components/ui/ProgressionBar";
import { highlightSearchTerm, searchInObject } from "@/utils/searchUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Grid, List } from 'lucide-react';

const TaskList = () => {
  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

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
    const statusFilter = filterStatus === 'all' || task.status === filterStatus;
    const priorityFilter = filterPriority === 'all' || task.priority === filterPriority;
    const searchFilter = searchInObject(task, searchValue);

    return statusFilter && priorityFilter && searchFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Approval": return "bg-yellow-100 text-orange-800 border-orange-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const navigate = useNavigate();

  const handleRowClick = (taskId: string) => {
    navigate(`/ticket/${taskId}`);
  };

  const renderHighlightedText = (text: string) => {
    return (
      <span 
        dangerouslySetInnerHTML={{ 
          __html: highlightSearchTerm(text, searchValue) 
        }}
      />
    );
  };

  const TableView = () => (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Ticket ID</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Type</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Requester</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Department</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Priority</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Progress</TableHead>
                {/* <TableHead className="text-xs font-medium text-muted-foreground uppercase">Status</TableHead> */}
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow 
                  key={task.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(task.id)}
                >
                  <TableCell className="font-medium text-primary">
                    {renderHighlightedText(task.id)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {renderHighlightedText(task.type)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {renderHighlightedText(task.requester)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {renderHighlightedText(task.department)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(task.priority)} border`}>
                      {renderHighlightedText(task.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ProgressionBar steps={task.approvalSteps} />
                  </TableCell>
                  {/* <TableCell>
                    <Badge className={`${getStatusColor(task.status)} border`}>
                      {renderHighlightedText(task.status)}
                    </Badge>
                  </TableCell> */}
                  <TableCell className="font-medium text-foreground">
                    {renderHighlightedText(task.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTasks.map((task) => (
        <Card 
          key={task.id} 
          className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleRowClick(task.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-primary">
                {renderHighlightedText(task.id)}
              </CardTitle>
              <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
                {renderHighlightedText(task.priority)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {renderHighlightedText(task.type)}
              </p>
              <p className="text-xs text-muted-foreground">
                Requester: {renderHighlightedText(task.requester)}
              </p>
              <p className="text-xs text-muted-foreground">
                Department: {renderHighlightedText(task.department)}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Progress</p>
              <ProgressionBar steps={task.approvalSteps} />
            </div>

            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(task.status)} border text-xs`}>
                {renderHighlightedText(task.status)}
              </Badge>
              <span className="text-sm font-medium text-foreground">
                {renderHighlightedText(task.amount)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AppLayout searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Search tasks...">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Task List</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
              {filteredTasks.length} Tasks
            </Badge>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="status-filter" className="text-muted-foreground">Status:</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 border-input">
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
                  <Label htmlFor="priority-filter" className="text-muted-foreground">Priority:</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40 border-input">
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

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="px-3"
                >
                  <List className="w-4 h-4 mr-1" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="px-3"
                >
                  <Grid className="w-4 h-4 mr-1" />
                  Cards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {viewMode === 'table' ? <TableView /> : <CardView />}

        {filteredTasks.length === 0 && (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No tasks found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default TaskList;
