import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GraphQLError } from "graphql";
import { ASSIGN_TRAINER } from "@/helpers/mutations/user";
import { GET_TRAINERS } from "@/helpers/queries/user";
import AssignTrainer from "./AssignTrainer";

const trainers = {
  request: { query: GET_TRAINERS },
  result: {
    data: {
      trainers: [
        { id: "t1", name: "Sam Rivera" },
        { id: "t2", name: "Jordan Patel" },
      ],
    },
  },
};
const assigns = (result) => ({
  request: {
    query: ASSIGN_TRAINER,
    variables: { clientId: "c1", trainerId: "t2" },
  },
  result,
});

const open = async (mocks) => {
  render(
    <MockedProvider mocks={[trainers, ...mocks]} addTypename={false}>
      <AssignTrainer clientId="c1" current={{ id: "t1", name: "Sam Rivera" }} />
    </MockedProvider>
  );
  expect(screen.getByText("Sam Rivera")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Change" }));
  await screen.findByRole("option", { name: "Jordan Patel" });
  fireEvent.change(screen.getByLabelText("Trainer"), {
    target: { value: "t2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
};

describe("AssignTrainer", () => {
  it("moves the client to the chosen trainer", async () => {
    await open([
      assigns({
        data: {
          assignTrainer: {
            id: "c1",
            email: null,
            name: "Riley Chen",
            username: null,
            image: null,
            createAt: null,
            role: "client",
            trainer: { id: "t2", name: "Jordan Patel" },
          },
        },
      }),
    ]);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument()
    );
  });

  it("keeps the form open and says why when it fails", async () => {
    await open([
      assigns({
        errors: [new GraphQLError("Choose a trainer from the client's gym.")],
      }),
    ]);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Choose a trainer from the client's gym."
    );
    expect(screen.getByLabelText("Trainer")).toBeInTheDocument();
  });
});
