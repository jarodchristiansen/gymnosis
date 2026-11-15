import { ApolloServer } from "apollo-server-micro";

import connectDb from "../../db/config";
import resolvers from "../../db/resolvers/index";
import typeDefs from "../../db/schema";
import { viewerFromRequest } from "../../lib/viewer";

connectDb();

export const config = {
  api: {
    bodyParser: false,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Resolvers authorize against the viewer; null means signed out.
  context: async ({ req, res }) => ({
    viewer: await viewerFromRequest(req, res),
  }),
  csrfPrevention: true,
});

const startServer = server.start();

// Same-origin only: the app is the only client, so there are no CORS headers to send.
export default async function handler(req, res) {
  await startServer;
  await server.createHandler({ path: "/api/graphql" })(req, res);
}
