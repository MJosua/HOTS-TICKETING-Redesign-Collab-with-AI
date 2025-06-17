
import React from 'react';
import { Check, X, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ApprovalStep {
  id: string;
  name: string;
  status: 'approved' | 'rejected' | 'pending' | 'waiting';
  date?: string;
  approver?: string;
}

interface ProgressionBarProps {
  steps: ApprovalStep[];
  className?: string;
  showDetails?: boolean;
}

const ProgressionBar = ({ steps, className, showDetails = false }: ProgressionBarProps) => {
  const approvedCount = steps.filter(step => step.status === 'approved').length;
  const totalSteps = steps.length;

  if (!showDetails) {
    // Simple progress bar view
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        <span className="text-sm font-medium text-muted-foreground mr-2">
          {approvedCount}/{totalSteps}
        </span>
        {steps.map((step, index) => (
          <div
            key={`${step.id}-${index}`}
            className={cn(
              "h-2 w-8 rounded-full",
              {
                "bg-primary": step.status === 'approved',
                "bg-destructive": step.status === 'rejected',
                "bg-yellow-500": step.status === 'pending',
                "bg-muted": step.status === 'waiting'
              }
            )}
          />
        ))}
      </div>
    );
  }

  // Detailed view (for ticket detail page)
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {steps.map((step, index) => (
        <div key={`${step.id}-${step.name}-${index}`} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                {
                  "bg-primary text-primary-foreground": step.status === 'approved',
                  "bg-destructive text-destructive-foreground": step.status === 'rejected',
                  "bg-yellow-500 text-white": step.status === 'pending',
                  "bg-muted text-muted-foreground": step.status === 'waiting'
                }
              )}
            >
              {step.status === 'approved' && <Check className="w-4 h-4" />}
              {step.status === 'rejected' && <X className="w-4 h-4" />}
              {step.status === 'pending' && <Clock className="w-4 h-4" />}
              {step.status === 'waiting' && (index + 1)}
            </div>
            <span className="text-xs text-muted-foreground mt-1 text-center max-w-16 truncate">
              {step.name}
            </span>
            {showDetails && step.approver && (
              <span className="text-xs text-muted-foreground text-center max-w-20 truncate">
                {step.approver}
              </span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 flex-shrink-0",
                {
                  "bg-primary": step.status === 'approved',
                  "bg-destructive": step.status === 'rejected',
                  "bg-muted": step.status === 'waiting' || step.status === 'pending'
                }
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressionBar;
