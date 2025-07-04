// Type guard functions
export function isResponseMessage(message) {
    return message.type === "response";
}
export function isTaskMessage(message) {
    return message.type === "task";
}
//# sourceMappingURL=messages.js.map