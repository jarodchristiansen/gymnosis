import { Colors, BorderRadius, FontSize, FontWeight } from "@/styles/variables";
import { signIn } from "next-auth/react";
import type { ClientSafeProvider } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import ProviderContainer from "./ProviderContainer/ProviderContainer";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already linked to a different sign-in method.",
  OAuthSignin: "Could not connect to the provider. Please try again.",
  OAuthCallback: "Something went wrong during sign-in. Please try again.",
  CredentialsSignin: "Incorrect email or password.",
  SessionRequired: "You must be signed in to access that page.",
  Default: "An unexpected error occurred. Please try again.",
};

type Tab = "signin" | "signup";

interface SignInFormProps {
  providers: Record<string, ClientSafeProvider> | null;
  initialTab?: Tab;
}

const SignInForm = ({ providers, initialTab = "signin" }: SignInFormProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credError, setCredError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const isFirstRender = useRef(true);

  const oauthError =
    typeof router.query.error === "string"
      ? ERROR_MESSAGES[router.query.error] ?? ERROR_MESSAGES.Default
      : null;

  const errorMessage = credError ?? oauthError;

  // Sync URL to tab state — only on user-initiated tab changes, not on mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const path = activeTab === "signin" ? "SignIn" : "SignUp";
    router.replace(`/auth?path=${path}`, undefined, { shallow: true });
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: Tab) => {
    setCredError(null);
    setActiveTab(tab);
  };

  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setCredError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setCredError(
          ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.CredentialsSignin
        );
      } else if (result?.ok) {
        router.push("/");
      }
    } catch {
      setCredError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (providerId: string) => {
    setCredError(null);
    setLoadingProvider(providerId);
    try {
      await signIn(providerId, { redirect: true, callbackUrl: "/" });
    } catch {
      setLoadingProvider(null);
    }
  };

  return (
    <FormCard>
      <TabRow>
        <TabButton
          type="button"
          active={activeTab === "signin"}
          onClick={() => handleTabChange("signin")}
        >
          Sign In
          {activeTab === "signin" && <TabUnderline />}
        </TabButton>
        <TabButton
          type="button"
          active={activeTab === "signup"}
          onClick={() => handleTabChange("signup")}
        >
          Sign Up
          {activeTab === "signup" && <TabUnderline />}
        </TabButton>
      </TabRow>

      <FormBody>
        {errorMessage && <ErrorBanner role="alert">{errorMessage}</ErrorBanner>}

        {activeTab === "signin" && (
          <>
            <CredentialsForm onSubmit={handleCredentialsSubmit} noValidate>
              <FieldGroup>
                <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                <FieldInput
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel htmlFor="signin-password">Password</FieldLabel>
                <FieldInput
                  id="signin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FieldGroup>

              <SubmitButton
                type="submit"
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting ? <Spinner /> : "Sign In"}
              </SubmitButton>
            </CredentialsForm>

            <Divider>
              <DividerLine />
              <DividerText>or continue with</DividerText>
              <DividerLine />
            </Divider>

            <ProviderContainer
              providers={providers}
              loadingProvider={loadingProvider}
              onSignIn={handleOAuthSignIn}
            />
          </>
        )}

        {activeTab === "signup" && (
          <>
            <SignUpNote>
              Create your account by signing in with a provider below. If
              it&apos;s your first time, an account is automatically created.
            </SignUpNote>

            <ProviderContainer
              providers={providers}
              loadingProvider={loadingProvider}
              onSignIn={handleOAuthSignIn}
            />
          </>
        )}
      </FormBody>
    </FormCard>
  );
};

// ─── Styled Components ────────────────────────────────────────────────────────

const FormCard = styled.div`
  width: 100%;
`;

const TabRow = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const TabButton = styled.button<{ active: boolean }>`
  position: relative;
  flex: 1;
  background: none;
  border: none;
  padding: 16px 0;
  font-size: ${FontSize.medium};
  font-weight: ${FontWeight.semibold};
  color: ${({ active }) => (active ? Colors.brand.white : Colors.brand.muted)};
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: ${Colors.brand.white};
  }
`;

const TabUnderline = styled.span`
  position: absolute;
  bottom: -1px;
  left: 16px;
  right: 16px;
  height: 2px;
  background-color: ${Colors.brand.accent};
  border-radius: 1px;
`;

const FormBody = styled.div`
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ErrorBanner = styled.div`
  background-color: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${BorderRadius.medium};
  color: #fca5a5;
  font-size: 13px;
  padding: 10px 14px;
  line-height: 1.5;
`;

const CredentialsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: ${FontWeight.semibold};
  color: ${Colors.midGray};
`;

const FieldInput = styled.input`
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: ${BorderRadius.medium};
  color: ${Colors.brand.white};
  font-size: ${FontSize.medium};
  padding: 10px 14px;
  width: 100%;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${Colors.brand.muted};
  }

  &:focus {
    outline: none;
    border-color: ${Colors.brand.accent};
  }

  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px ${Colors.surface} inset;
    -webkit-text-fill-color: ${Colors.brand.white};
  }
`;

const SubmitButton = styled.button`
  background-color: ${Colors.brand.accent};
  color: ${Colors.brand.white};
  border: none;
  border-radius: ${BorderRadius.medium};
  font-size: ${FontSize.medium};
  font-weight: ${FontWeight.semibold};
  padding: 11px 0;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;

  &:hover:not(:disabled) {
    background-color: ${Colors.brand.accentHover};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.08);
`;

const DividerText = styled.span`
  font-size: 12px;
  color: ${Colors.brand.muted};
  white-space: nowrap;
`;

const SignUpNote = styled.p`
  font-size: 14px;
  color: ${Colors.midGray};
  line-height: 1.6;
  margin: 0;
  text-align: center;
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: ${Colors.brand.white};
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default SignInForm;
