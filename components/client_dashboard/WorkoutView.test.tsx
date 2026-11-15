import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { GET_PLANS } from "@/helpers/queries/plans";
import WorkoutView from "./WorkoutView";

jest.mock("next/router", () => ({ useRouter: () => ({ push: jest.fn() }) }));

const noPlans = (variables: Record<string, string>) => ({
  request: { query: GET_PLANS, variables },
  result: { data: { plans: [] } },
});

describe("WorkoutView", () => {
  it("gives trainers a way to start a plan", async () => {
    render(
      <MockedProvider mocks={[noPlans({ clientId: "c1" })]}>
        <WorkoutView clientId="c1" canBuild />
      </MockedProvider>
    );

    expect(
      screen.getByRole("tab", { name: "Start a plan" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Start a plan" })
    ).toBeInTheDocument();
  });

  it("shows clients their plans with no way to build one", async () => {
    render(
      <MockedProvider mocks={[noPlans({})]}>
        <WorkoutView clientId="c1" canBuild={false} />
      </MockedProvider>
    );

    expect(
      await screen.findByText(/Your trainer hasn't sent you a plan yet/)
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
