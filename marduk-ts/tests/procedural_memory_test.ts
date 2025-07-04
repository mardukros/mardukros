import {
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";

const workflows = [
  {
    id: 1,
    title: "Chaos Theory Analysis",
    steps: ["Define objectives", "Collect data", "Run simulations", "Analyze results"],
  },
];

function queryWorkflows(query: string): string[] {
  return workflows
    .filter((workflow) => workflow.title.toLowerCase().includes(query.toLowerCase()))
    .map((workflow) => `${workflow.title}: ${workflow.steps.join(", ")}`);
}

Deno.test("queryWorkflows returns relevant workflows", () => {
  const query = "Chaos";
  const results = queryWorkflows(query);
  assertEquals(results.length, 1);
  assertEquals(results[0], "Chaos Theory Analysis: Define objectives, Collect data, Run simulations, Analyze results");
});
