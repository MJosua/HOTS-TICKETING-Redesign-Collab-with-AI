
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
  ticketData?: any;
  formData?: any;
  userData?: any;
  serviceId?: string;
  currentDateRange?: { start: Date; end: Date };
  [key: string]: any;
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
