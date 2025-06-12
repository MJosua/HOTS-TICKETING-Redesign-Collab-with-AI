
import React from 'react';
import { Check, X, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ApprovalStep {
  id: string;
  name: string;
  status: 'approved' | 'rejected' | 'pending' | 'waiting';
  date?: string;
}

interface ProgressionBarProps {
  steps: ApprovalStep[];
  className?: string;
}

const ProgressionBar = ({ steps, className }: ProgressionBarProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                {
                  "bg-blue-500 text-white": step.status === 'approved',
                  "bg-red-500 text-white": step.status === 'rejected',
                  "bg-orange-500 text-white": step.status === 'pending',
                  "bg-gray-200 text-gray-500": step.status === 'waiting'
                }
              )}
            >
              {step.status === 'approved' && <Check className="w-4 h-4" />}
              {step.status === 'rejected' && <X className="w-4 h-4" />}
              {step.status === 'pending' && <Clock className="w-4 h-4" />}
              {step.status === 'waiting' && (index + 1)}
            </div>
            <span className="text-xs text-gray-600 mt-1 text-center max-w-16 truncate">
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 flex-shrink-0",
                {
                  "bg-blue-500": step.status === 'approved',
                  "bg-red-500": step.status === 'rejected',
                  "bg-gray-200": step.status === 'waiting' || step.status === 'pending'
                }
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressionBar;
