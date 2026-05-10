import { Colors, BorderRadius, MediaQueries } from "@/styles/variables";
import { getProviders } from "next-auth/react";
import type { GetServerSideProps } from "next";
import type { ClientSafeProvider } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

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
        metaTitle={initialTab === "signin" ? "Sign In" : "Sign Up"}
        metaDescription="Sign in to access everything Gymnosis has to offer."
        previewImage="/assets/assets-page.png"
      />

      <PageInner>
        <BrandMark>
          <Link href="/">
            <Image
              src="/assets/dumbbell.svg"
              height={36}
              width={36}
              alt="Gymnosis logo"
            />
          </Link>
          <BrandName>Gymnosis</BrandName>
        </BrandMark>

        <CardWrapper>
          <SignInForm providers={providers} initialTab={initialTab} />
        </CardWrapper>

        <FooterNote>
          By continuing you agree to our{" "}
          <Link href="/terms-of-service">Terms of Service</Link>.
        </FooterNote>
      </PageInner>
    </PageWrapper>
  );
};

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
  min-height: 100vh;
  background-color: ${Colors.midnight};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
`;

const PageInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
  gap: 24px;
`;

const BrandMark = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
`;

const BrandName = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: ${Colors.brand.accent};
  letter-spacing: -0.3px;
`;

const CardWrapper = styled.div`
  width: 100%;
  background-color: ${Colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${BorderRadius.large};
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
