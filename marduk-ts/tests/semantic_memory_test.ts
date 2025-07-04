import {
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";

const semanticLinks = [
  { concept1: "Chaos Theory", concept2: "Dynamic Systems", relation: "is related to" },
  { concept1: "Dynamic Systems", concept2: "Nonlinear Equations", relation: "is foundational for" },
  { concept1: "Bug Fixes", concept2: "Procedural Workflows", relation: "requires" },
];

function querySemanticLinks(query: string): string[] {
  return semanticLinks
    .filter(
      (link) =>
        link.concept1.toLowerCase().includes(query.toLowerCase()) ||
        link.concept2.toLowerCase().includes(query.toLowerCase())
    )
    .map((link) => `${link.concept1} ${link.relation} ${link.concept2}`);
}

Deno.test("querySemanticLinks returns relevant links", () => {
  const query = "Dynamic Systems";
  const results = querySemanticLinks(query);
  assertEquals(results.length, 2);
  assertEquals(results[0], "Chaos Theory is related to Dynamic Systems");
  assertEquals(results[1], "Dynamic Systems is foundational for Nonlinear Equations");
});
