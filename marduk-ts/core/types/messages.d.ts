export interface Message {
    type: "register" | "task" | "response";
}
export interface RegisterMessage extends Message {
    type: "register";
    subsystem: string;
}
export interface TaskMessage extends Message {
    type: "task";
    query: string;
    task_id: number;
    target?: string;
    priority?: number;
    condition?: {
        type: "deferred";
        prerequisite: string;
    };
    status?: "pending" | "completed" | "deferred";
}
export interface ResponseMessage extends Message {
    type: "response";
    subsystem: string;
    task_id: number;
    result: any;
}
export declare function isResponseMessage(message: Message): message is ResponseMessage;
export declare function isTaskMessage(message: Message): message is TaskMessage;
//# sourceMappingURL=messages.d.ts.map