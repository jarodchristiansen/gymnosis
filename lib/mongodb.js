// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
// NextAuth's adapter uses this client during OAuth sign-in. Without a short timeout an
// unreachable database looks like a hung request: the driver waits 30s, Vercel kills it at 10s.
const options = {
  serverSelectionTimeoutMS: 5000,
};

const connect = (client) =>
  client.connect().catch((err) => {
    console.error("[db] adapter connection failed:", err);
    throw err;
  });

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

function createMongoClientPromise() {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      const devClient = new MongoClient(uri, options);
      global._mongoClientPromise = connect(devClient);
    }
    return global._mongoClientPromise;
  }

  const prodClient = new MongoClient(uri, options);
  return connect(prodClient);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
const clientPromise = createMongoClientPromise();
// The connection starts when this module loads, before anything awaits it. Mark the failure as
// handled so it can't crash the function; the adapter still gets the rejection when it awaits.
clientPromise.catch(() => {});

export default clientPromise;
