import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// The browser calls its own deployment, so previews use their own API and the session cookie
// goes with the request. Server-side calls (the sitemap) need an absolute URL.
const graphqlUri = () => {
  if (typeof window !== "undefined") return "/api/graphql";
  if (process.env.BASE_URL) return `${process.env.BASE_URL}/api/graphql`;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/graphql`;
  }
  return "http://localhost:3000/api/graphql";
};

const client = new ApolloClient({
  dataIdFromObject: (o) => o.id,
  link: new HttpLink({ uri: graphqlUri() }),
  cache: new InMemoryCache(),
});

export default client;
