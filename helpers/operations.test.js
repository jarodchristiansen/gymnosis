/**
 * @jest-environment node
 */
import { buildASTSchema, validate } from "graphql";

import typeDefs from "../db/schema";
import * as planMutations from "./mutations/plans";
import * as userMutations from "./mutations/user";
import * as planQueries from "./queries/plans";
import * as postQueries from "./queries/posts";
import * as userQueries from "./queries/user";

// Every query and mutation the client sends, checked against the server's schema, so a typo or
// a removed field fails here instead of at build time or in the browser.
const schema = buildASTSchema(typeDefs);
const operations = Object.entries({
  ...planMutations,
  ...userMutations,
  ...planQueries,
  ...postQueries,
  ...userQueries,
}).filter(([, doc]) =>
  doc?.definitions?.some((d) => d.kind === "OperationDefinition")
);

describe("client operations", () => {
  it("covers every module", () => {
    expect(operations.length).toBeGreaterThan(10);
  });

  it.each(operations)("%s matches the schema", (_, doc) => {
    expect(validate(schema, doc).map((e) => e.message)).toEqual([]);
  });
});
