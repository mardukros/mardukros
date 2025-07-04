import { TaskMessage, ResponseMessage } from "../types/messages.ts";

const ws = new WebSocket("ws://localhost:8080");

const workflows = [
  {
    id: 1,
    title: "Chaos Theory Analysis",
    steps: ["Define objectives", "Collect data", "Run simulations", "Analyze results"],
  },
  {
    id: 2,
    title: "Bug Resolution Workflow",
    steps: ["Identify issue", "Reproduce bug", "Fix code", "Test solution"],
  },
];

ws.onopen = () => {
  console.log("Procedural Memory connected to WebSocket server");
  ws.send(JSON.stringify({ type: "register", subsystem: "procedural_memory" }));
};

ws.onmessage = (event) => {
  const message: TaskMessage = JSON.parse(event.data);
  if (message.type === "task" && message.query.includes("workflow")) {
    const matchingWorkflows = queryWorkflows(message.query);
    const response: ResponseMessage = {
      type: "response",
      subsystem: "procedural_memory",
      task_id: message.task_id,
      result: matchingWorkflows,
    };
    ws.send(JSON.stringify(response));
  }
};

function queryWorkflows(query: string): string[] {
  return workflows
    .filter((workflow) => workflow.title.toLowerCase().includes(query.toLowerCase()))
    .map((workflow) => `${workflow.title}: ${workflow.steps.join(", ")}`);
}
