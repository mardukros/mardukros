export interface Message {
  type: "register" | "task" | "response" | "error";
  timestamp?: string;
}

export interface RegisterMessage extends Message {
  type: "register";
  subsystem: string;
}

export interface TaskMessage extends Message {
  type: "task";
  task_id: number;
  query: string;
  target?: string;
}

export interface ResponseMessage extends Message {
  type: "response";
  task_id: number;
  subsystem: string;
  result: unknown;
}

export interface ErrorMessage extends Message {
  type: "error";
  task_id: number;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}