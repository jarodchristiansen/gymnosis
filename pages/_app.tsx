import client from "../apollo-client";
import Layout from "../components/layout/layout";
import { pageview } from "../lib/gtag";
import { ApolloProvider } from "@apollo/client";
import Hotjar from "@hotjar/browser";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect } from "react";

import "../styles/globals.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "bootstrap/dist/css/bootstrap.css";

type AppPageProps = {
  session: Session | null;
} & Record<string, unknown>;

export default function MyApp({
  Component,
  pageProps,
}: AppProps<AppPageProps>) {
  const { session, ...restPageProps } = pageProps;
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };

    if (process.env.BASE_URL !== "http://localhost:3000") {
      router.events.on("routeChangeComplete", handleRouteChange);

      return () => {
        router.events.off("routeChangeComplete", handleRouteChange);
      };
    }
  }, [router.events]);

  useEffect(() => {
    const siteId = 3557571;
    const hotjarVersion = 6;

    Hotjar.init(siteId, hotjarVersion);
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-76XSR5BMS5"
        nonce="90123lkjasdfmnsdljkasdpoi0"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-76XSR5BMS5', {
            page_path: window.location.pathname,
          });
        `,
        }}
      />

      <SessionProvider session={session}>
        <ApolloProvider client={client}>
          <Layout>
            <Component {...restPageProps} />
          </Layout>
        </ApolloProvider>
      </SessionProvider>
    </>
  );
}
