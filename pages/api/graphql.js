import { ApolloServer } from "apollo-server-micro";
import Cors from "micro-cors";

import connectDb from "../../db/config";
import resolvers from "../../db/resolvers/index";

import typeDefs from "../../db/schema";

connectDb();

export const config = {
  api: {
    bodyParser: false,
  },
};

const cors = Cors({
  allowMethods: ["POST", "OPTIONS"],
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return {};
  },
  engine: {
    reportSchema: true,
  },
  playground: {
    settings: {
      "editor.theme": "dark",
      "request.credentials": "include",
    },
  },
});

const startServer = server.start();

export default cors(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;
  await server.createHandler({ path: "/api/graphql" })(req, res);
});
