
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from '@/hooks/useAppSelector';

const TaskListBadge = () => {
  const { taskList } = useAppSelector(state => state.tickets);
  
  // Count pending tasks (not rejected or accepted)
  const pendingCount = taskList.data.filter(ticket => 
    ticket.approval_status !== 2 && // not approved
    ticket.approval_status !== -1   // not rejected
  ).length;

  if (pendingCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2">
      {pendingCount}
    </Badge>
  );
};

export default TaskListBadge;
