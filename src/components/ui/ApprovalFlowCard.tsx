
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Check, X, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalStep {
  id: string;
  name: string;
  status: 'approved' | 'rejected' | 'pending' | 'waiting';
  date?: string;
  approver?: string;
  role?: string;
}

interface ApprovalFlowCardProps {
  title?: string;
  steps: ApprovalStep[];
  mode?: 'sequential' | 'parallel';
  className?: string;
}

export const ApprovalFlowCard: React.FC<ApprovalFlowCardProps> = ({ 
  title = "Approval Flow", 
  steps, 
  mode = 'sequential',
  className 
}) => {
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getStepColors = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          text: 'text-green-800 dark:text-green-300',
          border: 'border-green-300 dark:border-green-700',
          icon: 'text-green-600 dark:text-green-400'
        };
      case 'rejected':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-300 dark:border-red-700',
          icon: 'text-red-600 dark:text-red-400'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-300 dark:border-yellow-700',
          icon: 'text-yellow-600 dark:text-yellow-400'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-300 dark:border-gray-600',
          icon: 'text-gray-500 dark:text-gray-400'
        };
    }
  };

  const getConnectorColor = (currentStatus: string, nextStatus?: string) => {
    if (currentStatus === 'approved') return 'bg-green-300 dark:bg-green-600';
    if (currentStatus === 'rejected') return 'bg-red-300 dark:bg-red-600';
    return 'bg-gray-300 dark:bg-gray-600';
  };

  return (
    <Card className={cn("shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <Badge variant="outline" className="text-xs font-medium">
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-start overflow-x-auto pb-2">
          <div className="flex items-center space-x-2 min-w-max">
            {steps.map((step, index) => {
              const colors = getStepColors(step.status);
              const isLast = index === steps.length - 1;
              
              return (
                <React.Fragment key={index}>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col items-center cursor-pointer group">
                        <div
                          className={cn(
                            "relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg",
                            colors.bg,
                            colors.border
                          )}
                        >
                          <div className={cn("transition-colors", colors.icon)}>
                            {getStepIcon(step.status)}
                          </div>
                          {step.status === 'pending' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p className={cn("text-xs font-medium truncate max-w-16", colors.text)}>
                            {step.name}
                          </p>
                          {step.date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {step.date}
                            </p>
                          )}
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">{step.name}</h4>
                        {step.approver && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Approver:</span> {step.approver}
                          </p>
                        )}
                        {step.role && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Role:</span> {step.role}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge variant="outline" className={cn("text-xs", colors.text, colors.bg)}>
                            {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                          </Badge>
                        </div>
                        {step.date && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Date:</span> {step.date}
                          </p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  
                  {!isLast && (
                    <div className="flex items-center">
                      <div 
                        className={cn(
                          "h-0.5 w-8 transition-colors duration-300",
                          getConnectorColor(step.status, steps[index + 1]?.status)
                        )}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
