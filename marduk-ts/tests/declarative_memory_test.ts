import {
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";

const declarativeFacts = [
  { id: 1, fact: "Chaos theory studies the behavior of dynamical systems that are highly sensitive to initial conditions." },
  { id: 2, fact: "Nonlinear equations are foundational to understanding dynamic systems." },
];

function queryFacts(query: string): string[] {
  return declarativeFacts
    .filter((fact) => fact.fact.toLowerCase().includes(query.toLowerCase()))
    .map((fact) => fact.fact);
}

Deno.test("queryFacts returns relevant facts", () => {
  const query = "Chaos";
  const results = queryFacts(query);
  assertEquals(results.length, 1);
  assertEquals(results[0], "Chaos theory studies the behavior of dynamical systems that are highly sensitive to initial conditions.");
});
