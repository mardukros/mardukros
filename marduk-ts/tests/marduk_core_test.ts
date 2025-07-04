import {
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { ResponseMessage } from "../types/messages.ts";

// Mock function for logResponse
function logResponse(response: ResponseMessage) {
  const logs = [];
  logs.push({ timestamp: new Date().toISOString(), response });
  return logs;
}

Deno.test("logResponse adds response to logs", () => {
  const response: ResponseMessage = {
    type: "response",
    subsystem: "test_subsystem",
    task_id: 1,
    result: "Test result",
  };

  const logs = logResponse(response);
  assertEquals(logs.length, 1);
  assertEquals(logs[0].response, response);
});
