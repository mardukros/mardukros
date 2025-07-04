import {
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";

const episodicEvents = [
  { id: 1, event: "Experiment A completed successfully", timestamp: "2024-12-10T12:00:00Z" },
  { id: 2, event: "Bug identified in Chaos Module", timestamp: "2024-12-11T09:30:00Z" },
];

function queryEvents(query: string): string[] {
  return episodicEvents
    .filter((event) => event.event.toLowerCase().includes(query.toLowerCase()))
    .map((event) => `${event.timestamp}: ${event.event}`);
}

Deno.test("queryEvents returns relevant events", () => {
  const query = "Experiment";
  const results = queryEvents(query);
  assertEquals(results.length, 1);
  assertEquals(results[0], "2024-12-10T12:00:00Z: Experiment A completed successfully");
});
