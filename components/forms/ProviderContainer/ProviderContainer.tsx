import { Colors, BorderRadius, FontSize, FontWeight } from "@/styles/variables";
import type { ClientSafeProvider } from "next-auth/react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import styled from "styled-components";

interface ProviderContainerProps {
  providers: Record<string, ClientSafeProvider> | null;
  loadingProvider?: string | null;
  onSignIn?: (providerId: string) => void;
}

const KNOWN_PROVIDER_IDS = new Set(["github", "facebook", "google", "twitter"]);

const PROVIDER_CONFIG: Record<
  string,
  {
    label: string;
    Icon: React.ElementType;
    variant: "google" | "github" | "default";
  }
> = {
  google: { label: "Continue with Google", Icon: FaGoogle, variant: "google" },
  github: { label: "Continue with GitHub", Icon: FaGithub, variant: "github" },
};

const ProviderContainer = ({
  providers,
  loadingProvider = null,
  onSignIn,
}: ProviderContainerProps) => {
  if (!providers) return null;

  const oauthProviders = Object.values(providers).filter(
    (p) => p.type !== "credentials"
  );

  if (!oauthProviders.length) return null;

  return (
    <ButtonStack>
      {oauthProviders.map((provider) => {
        const config = PROVIDER_CONFIG[provider.id];
        const isLoading = loadingProvider === provider.id;
        const isDisabled = loadingProvider !== null;
        const Icon = config?.Icon;
        const label = config?.label ?? `Continue with ${provider.name}`;
        const variant = config?.variant ?? "default";
        const testId = KNOWN_PROVIDER_IDS.has(provider.id)
          ? `login-${provider.id}`
          : "login-na";

        return (
          <ProviderButton
            key={provider.id}
            type="button"
            variant={variant}
            disabled={isDisabled}
            onClick={() => onSignIn?.(provider.id)}
            aria-label={label}
            data-testid={testId}
          >
            <ButtonInner>
              {isLoading ? (
                <Spinner variant={variant} />
              ) : (
                Icon && <Icon size={18} aria-hidden="true" />
              )}
              <span>{label}</span>
            </ButtonInner>
          </ProviderButton>
        );
      })}
    </ButtonStack>
  );
};

// ─── Styled Components ────────────────────────────────────────────────────────

const ButtonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const ProviderButton = styled.button<{
  variant: "google" | "github" | "default";
}>`
  width: 100%;
  border-radius: ${BorderRadius.medium};
  padding: 11px 16px;
  font-size: ${FontSize.medium};
  font-weight: ${FontWeight.semibold};
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.15s ease;
  min-height: 44px;

  ${({ variant }) =>
    variant === "google" &&
    `
    background-color: #ffffff;
    color: #1f1f1f;
    border: 1px solid rgba(0,0,0,0.12);
    &:hover:not(:disabled) { background-color: #f5f5f5; }
  `}

  ${({ variant }) =>
    variant === "github" &&
    `
    background-color: #24292e;
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.12);
    &:hover:not(:disabled) { background-color: #2f363d; }
  `}

  ${({ variant }) =>
    variant === "default" &&
    `
    background-color: ${Colors.surface};
    color: ${Colors.brand.white};
    border: 1px solid rgba(255,255,255,0.12);
    &:hover:not(:disabled) { background-color: rgba(255,255,255,0.07); }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Spinner = styled.span<{ variant: "google" | "github" | "default" }>`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid
    ${({ variant }) =>
      variant === "google" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.3)"};
  border-top-color: ${({ variant }) =>
    variant === "google" ? "#1f1f1f" : "#ffffff"};
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default ProviderContainer;
