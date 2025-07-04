import { TaskMessage, ResponseMessage } from "../types/messages.ts";

const ws = new WebSocket("ws://localhost:8080");

const semanticLinks = [
  { concept1: "Chaos Theory", concept2: "Dynamic Systems", relation: "is related to" },
  { concept1: "Dynamic Systems", concept2: "Nonlinear Equations", relation: "is foundational for" },
  { concept1: "Bug Fixes", concept2: "Procedural Workflows", relation: "requires" },
];

ws.onopen = () => {
  console.log("Semantic Memory connected to WebSocket server");
  ws.send(JSON.stringify({ type: "register", subsystem: "semantic_memory" }));
};

ws.onmessage = (event) => {
  const message: TaskMessage = JSON.parse(event.data);
  if (message.type === "task" && message.query.includes("relationship")) {
    const matchingLinks = querySemanticLinks(message.query);
    const response: ResponseMessage = {
      type: "response",
      subsystem: "semantic_memory",
      task_id: message.task_id,
      result: matchingLinks,
    };
    ws.send(JSON.stringify(response));
  }
};

function querySemanticLinks(query: string): string[] {
  return semanticLinks
    .filter(
      (link) =>
        link.concept1.toLowerCase().includes(query.toLowerCase()) ||
        link.concept2.toLowerCase().includes(query.toLowerCase())
    )
    .map((link) => `${link.concept1} ${link.relation} ${link.concept2}`);
}
