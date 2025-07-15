
export interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  componentPath: string;
  applicableTo: ('form' | 'ticket_detail')[];
  dataRequirements?: string[];
  category?: string;
}

export interface ServiceWidgetAssignment {
  service_id: string;
  widget_ids: string[];
}

export interface WidgetProps {
  serviceInfo?: any;
  formData?: any;
  userData?: any;
  serviceId?: string;
  widgetId?: string;
  widgetName?: string;
  ticketData?: any;
  currentDateRange?: {
    start: Date;
    end: Date;
  };
}

export interface WidgetConfig extends WidgetPreset {
  props?: WidgetProps;
}


export interface meetingroomwidgetdata {
  ticketdata?: any;
  cstm_col?: any;
  lbl_col?: any;
  order_col?: any;
}
