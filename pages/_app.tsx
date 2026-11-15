import client from "../apollo-client";
import Layout from "../components/layout/layout";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

import "../styles/globals.css";

type AppPageProps = {
  session: Session | null;
} & Record<string, unknown>;

export default function MyApp({
  Component,
  pageProps,
}: AppProps<AppPageProps>) {
  const { session, ...restPageProps } = pageProps;

  return (
    <SessionProvider session={session}>
      <ApolloProvider client={client}>
        <Layout>
          <Component {...restPageProps} />
        </Layout>
      </ApolloProvider>
    </SessionProvider>
  );
}
