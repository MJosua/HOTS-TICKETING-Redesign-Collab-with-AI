
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, User } from 'lucide-react';
import { WidgetProps } from '@/types/widgetTypes';

const ApprovalProgress: React.FC<WidgetProps> = ({ 
  ticketData, 
  userData 
}) => {
  // Use actual ticket data if available, otherwise use sample data
  const approvalSteps = ticketData?.list_approval || [
    { order: 1, name: 'Direct Manager', status: 1, date: '2025-01-22' },
    { order: 2, name: 'Department Head', status: 1, date: '2025-01-22' },
    { order: 3, name: 'IT Manager', status: 0, date: null },
    { order: 4, name: 'Finance Director', status: 0, date: null },
  ];

  const currentStep = ticketData?.current_step || 3;
  const approvedCount = approvalSteps.filter((step: any) => step.status === 1).length;
  const totalSteps = approvalSteps.length;
  const progressPercentage = (approvedCount / totalSteps) * 100;

  const getStepStatus = (step: any) => {
    if (step.status === 1) return 'approved';
    if (step.status === 2) return 'rejected';
    if (step.order === currentStep) return 'pending';
    return 'waiting';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Approval Workflow</CardTitle>
          <Badge variant="outline">
            {approvedCount}/{totalSteps} Complete
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {approvalSteps.map((step: any, index: number) => {
            const status = getStepStatus(step);
            
            return (
              <div 
                key={step.order || index} 
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  status === 'pending' ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      Step {step.order || index + 1}: {step.approver_name || step.name}
                    </p>
                    <Badge variant="outline" className={getStatusColor(status)}>
                      {status}
                    </Badge>
                  </div>
                  {step.approval_date || step.date ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      {status === 'approved' ? 'Approved' : 'Processed'} on{' '}
                      {new Date(step.approval_date || step.date).toLocaleDateString()}
                    </p>
                  ) : status === 'pending' ? (
                    <p className="text-xs text-orange-600 mt-1">
                      Awaiting approval
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        
        {progressPercentage < 100 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next:</strong> Waiting for approval from{' '}
              {approvalSteps.find((s: any) => s.order === currentStep)?.approver_name || 
               approvalSteps.find((s: any) => s.order === currentStep)?.name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalProgress;
