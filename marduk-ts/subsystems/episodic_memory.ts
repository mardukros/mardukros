import { TaskMessage, ResponseMessage } from "../types/messages.ts";

const ws = new WebSocket("ws://localhost:8080");

const episodicEvents = [
  { id: 1, event: "Experiment A completed successfully", timestamp: "2024-12-10T12:00:00Z" },
  { id: 2, event: "Bug identified in Chaos Module", timestamp: "2024-12-11T09:30:00Z" },
];

ws.onopen = () => {
  console.log("Episodic Memory connected to WebSocket server");
  ws.send(JSON.stringify({ type: "register", subsystem: "episodic_memory" }));
};

ws.onmessage = (event) => {
  const message: TaskMessage = JSON.parse(event.data);
  if (message.type === "task" && message.query.includes("event")) {
    const recentEvents = queryEvents(message.query);
    const response: ResponseMessage = {
      type: "response",
      subsystem: "episodic_memory",
      task_id: message.task_id,
      result: recentEvents,
    };
    ws.send(JSON.stringify(response));
  }
};

function queryEvents(query: string): string[] {
  return episodicEvents
    .filter((event) => event.event.toLowerCase().includes(query.toLowerCase()))
    .map((event) => `${event.timestamp}: ${event.event}`);
}
