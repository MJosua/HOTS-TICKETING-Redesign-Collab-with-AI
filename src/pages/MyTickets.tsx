import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import ProgressionBar from "@/components/ui/ProgressionBar";
import { highlightSearchTerm, searchInObject } from "@/utils/searchUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Grid, List, RefreshCw } from 'lucide-react';
import { AppLayout } from "@/components/layout/AppLayout";
import { useAppDispatch, useAppSelector } from '@/hooks/useAppSelector';
import { fetchMyTickets } from '@/store/slices/ticketsSlice';
import { convertTicketToDisplayFormat, getStatusColor, getPriorityColor } from '@/utils/ticketUtils';
import { TicketPagination } from '@/components/ui/TicketPagination';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const MyTickets = () => {
  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const dispatch = useAppDispatch();
  const { myTickets } = useAppSelector((state) => state.tickets);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMyTickets(1));
  }, [dispatch]);

  const tickets = myTickets.data.map(convertTicketToDisplayFormat);

  const filteredTickets = tickets.filter(ticket => {
    const statusFilter = filterStatus === 'all' || ticket.status === filterStatus;
    const priorityFilter = filterPriority === 'all' || ticket.priority === filterPriority;
    const searchFilter = searchInObject(ticket, searchValue);

    return statusFilter && priorityFilter && searchFilter;
  });

  const handleRowClick = (ticketId: string) => {
    navigate(`/ticket/${ticketId}`);
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchMyTickets(page));
  };

  const handleRefresh = () => {
    dispatch(fetchMyTickets(myTickets.currentPage));
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
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Priority</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Progress</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(ticket.id)}
                >
                  <TableCell className="font-medium text-primary">
                    {renderHighlightedText(ticket.id)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {renderHighlightedText(ticket.type)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(ticket.priority)} border`}>
                      {renderHighlightedText(ticket.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ProgressionBar steps={ticket.approvalSteps} />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {renderHighlightedText(ticket.amount)}
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
      {filteredTickets.map((ticket) => (
        <Card
          key={ticket.id}
          className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleRowClick(ticket.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-primary">
                {renderHighlightedText(ticket.id)}
              </CardTitle>
              <Badge className={`${getPriorityColor(ticket.priority)} border text-xs`}>
                {renderHighlightedText(ticket.priority)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {renderHighlightedText(ticket.type)}
              </p>
              <p className="text-xs text-muted-foreground">
                Created: {renderHighlightedText(ticket.created)}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Progress</p>
              <ProgressionBar steps={ticket.approvalSteps} />
            </div>

            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(ticket.status)} border text-xs`}>
                {renderHighlightedText(ticket.status)}
              </Badge>
              <span className="text-sm font-medium text-foreground">
                {renderHighlightedText(ticket.amount)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (myTickets.isLoading && myTickets.data.length === 0) {
    return (
      <AppLayout searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Search tickets...">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout searchValue={searchValue} onSearchChange={setSearchValue} searchPlaceholder="Search tickets...">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Tickets</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={myTickets.isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${myTickets.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
              {myTickets.totalData} Tickets
            </Badge>
          </div>
        </div>

        {/* Error display */}
        {myTickets.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{myTickets.error}</p>
            </CardContent>
          </Card>
        )}

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
                      <SelectItem value="Submitted">Submitted</SelectItem>
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

        {/* Pagination */}
        {myTickets.totalPage > 1 && (
          <TicketPagination
            currentPage={myTickets.currentPage}
            totalPages={myTickets.totalPage}
            totalItems={myTickets.totalData}
            onPageChange={handlePageChange}
          />
        )}

        {filteredTickets.length === 0 && !myTickets.isLoading && (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No tickets found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default MyTickets;
