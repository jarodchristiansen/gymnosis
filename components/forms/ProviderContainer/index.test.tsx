import { MockedProvider } from "@apollo/client/testing";
import { fireEvent, render, screen } from "@testing-library/react";

import ProviderContainer from "./ProviderContainer";

describe("ProviderContainer", () => {
  const providers = {
    credentials: {
      callbackUrl: '"http://localhost:3000/api/auth/callback/credentials"',
      id: "credentials",
      name: "Credentials",
      signinUrl: "http://localhost:3000/api/auth/signin/credentials",
      type: "credentials" as const,
    },
    facebook: {
      callbackUrl: "http://localhost:3000/api/auth/callback/facebook",
      id: "facebook",
      name: "Facebook",
      signinUrl: "http://localhost:3000/api/auth/signin/facebook",
      type: "oauth" as const,
    },
    github: {
      callbackUrl: "http://localhost:3000/api/auth/callback/github",
      id: "github",
      name: "GitHub",
      signinUrl: "http://localhost:3000/api/auth/signin/github",
      type: "oauth" as const,
    },
    google: {
      callbackUrl: "http://localhost:3000/api/auth/callback/google",
      id: "google",
      name: "Google",
      signinUrl: "http://localhost:3000/api/auth/signin/google",
      type: "oauth" as const,
    },
    twitter: {
      callbackUrl: "http://localhost:3000/api/auth/callback/twitter",
      id: "twitter",
      name: "Twitter",
      signinUrl: "http://localhost:3000/api/auth/signin/twitter",
      type: "oauth" as const,
    },
    default: {
      callbackUrl: "http://localhost:3000/api/auth/callback/default",
      id: "default",
      name: "Default",
      signinUrl: "http://localhost:3000/api/auth/signin/default",
      type: "oauth" as const,
    },
  };

  it("Should render the Providers as sign in options", () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProviderContainer providers={providers} />
      </MockedProvider>
    );

    expect(screen.getByTestId("login-github")).toBeTruthy();
    expect(screen.getByTestId("login-facebook")).toBeTruthy();
    expect(screen.getByTestId("login-google")).toBeTruthy();
    expect(screen.getByTestId("login-twitter")).toBeTruthy();
  });

  it("Should render unaccounted for providers as login-nas", () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ProviderContainer providers={providers} />
      </MockedProvider>
    );

    expect(screen.getByTestId("login-na")).toBeTruthy();
  });
});
