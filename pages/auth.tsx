import { DisplayHeading, Eyebrow } from "@/components/ui";
import {
  Colors,
  BorderRadius,
  FontFamily,
  MediaQueries,
} from "@/styles/variables";
import { getProviders } from "next-auth/react";
import type { GetServerSideProps } from "next";
import type { ClientSafeProvider } from "next-auth/react";
import Link from "next/link";
import styled from "styled-components";

import DemoLauncher from "../components/demo/DemoLauncher";
import SignInForm from "../components/forms/SignInForm";
import SEOHead from "../components/seo/SEOHead";

type AuthPageProps = {
  providers: Record<string, ClientSafeProvider> | null;
  initialTab: "signin" | "signup";
};

const AuthPage = ({ providers, initialTab }: AuthPageProps) => {
  return (
    <PageWrapper>
      <SEOHead
        isHomePage={false}
        metaTitle={
          initialTab === "signin"
            ? "Sign in — Gymnosis"
            : "Create an account — Gymnosis"
        }
        metaDescription="Sign in to Gymnosis, or try it first in a private demo gym."
        previewImage="/assets/gymnosis.png"
      />

      <PageInner>
        <Heading>
          <Eyebrow>Gymnosis</Eyebrow>
          <Title>Sign in</Title>
        </Heading>

        <CardWrapper>
          <SignInForm providers={providers} initialTab={initialTab} />
        </CardWrapper>
        <DemoSection aria-labelledby="demo-heading">
          <h2 id="demo-heading">Or look around first</h2>
          <DemoLauncher />
        </DemoSection>

        <FooterNote>
          Gymnosis is a portfolio project.{" "}
          <Link href="/terms-of-service">About and terms</Link>.
        </FooterNote>
      </PageInner>
    </PageWrapper>
  );
};

const DemoSection = styled.section`
  width: 100%;
  max-width: 420px;
  margin-top: 24px;

  h2 {
    margin: 0 0 12px;
    font-family: ${FontFamily.display};
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${Colors.lightGray};
    text-align: center;
  }
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();
  const path = context.query?.path;
  const initialTab = path === "SignUp" ? "signup" : "signin";

  return {
    props: {
      providers: providers ?? null,
      initialTab,
    },
  };
};

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 24px 16px 64px;
`;

const PageInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
  gap: 24px;
`;

const Heading = styled.div`
  width: 100%;
  text-align: center;
`;

const Title = styled(DisplayHeading)`
  font-size: 52px;
`;

const CardWrapper = styled.div`
  width: 100%;
  background-color: ${Colors.surface};
  border: 1px solid ${Colors.rule};
  border-radius: 8px;
  overflow: hidden;
`;

const FooterNote = styled.p`
  font-size: 12px;
  color: ${Colors.brand.muted};
  text-align: center;
  margin: 0;

  a {
    color: ${Colors.midGray};
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: ${Colors.brand.white};
    }
  }
`;

export default AuthPage;
