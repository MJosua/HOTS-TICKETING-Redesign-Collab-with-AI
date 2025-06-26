
import { WidgetPreset } from '@/types/widgetTypes';

export const widgetPresets: WidgetPreset[] = [
  {
    id: "gantt_room_schedule",
    name: "Room Usage Gantt Chart",
    description: "Display current week's room usage as a Gantt chart",
    componentPath: "widgets/GanttRoomUsage",
    applicableTo: ["form", "ticket_detail"],
    dataRequirements: ["roomData", "scheduleData"],
    category: "Scheduling"
  },
  {
    id: "stock_overview",
    name: "Stock Overview",
    description: "Show real-time item stock status",
    componentPath: "widgets/StockOverview",
    applicableTo: ["form"],
    dataRequirements: ["stockData"],
    category: "Inventory"
  },
  {
    id: "approval_progress",
    name: "Approval Progress",
    description: "Show approval step progress bar",
    componentPath: "widgets/ApprovalProgress",
    applicableTo: ["ticket_detail"],
    dataRequirements: ["approvalData"],
    category: "Workflow"
  },
  {
    id: "team_workload",
    name: "Team Workload Chart",
    description: "Display current team workload and capacity",
    componentPath: "widgets/TeamWorkload",
    applicableTo: ["form", "ticket_detail"],
    dataRequirements: ["teamData", "workloadData"],
    category: "Analytics"
  },
  {
    id: "recent_requests",
    name: "Recent Similar Requests",
    description: "Show recent requests of the same type",
    componentPath: "widgets/RecentRequests",
    applicableTo: ["form"],
    dataRequirements: ["historyData"],
    category: "History"
  }
];

export const getWidgetPresetById = (id: string): WidgetPreset | undefined => {
  return widgetPresets.find(widget => widget.id === id);
};

export const getWidgetPresetsByCategory = (category: string): WidgetPreset[] => {
  return widgetPresets.filter(widget => widget.category === category);
};

export const getWidgetCategories = (): string[] => {
  return [...new Set(widgetPresets.map(widget => widget.category).filter(Boolean))];
};
