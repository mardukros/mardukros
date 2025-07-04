
export interface SystemEvent {
  id: string;
  type: string;
  timestamp: string;
  data: any;
}

export interface ErrorEvent extends SystemEvent {
  type: 'error';
  data: {
    message: string;
    stack?: string;
    code?: string;
  };
}
