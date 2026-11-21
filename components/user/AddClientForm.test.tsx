import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GraphQLError } from "graphql";
import { ADD_CLIENT } from "@/helpers/mutations/user";
import { GET_TRAINERS } from "@/helpers/queries/user";
import AddClientForm from "./AddClientForm";

const added = {
  id: "c9",
  email: "dana@example.com",
  name: "Dana Ruiz",
  username: "user-1a2b3c4d",
  image: null,
  createAt: null,
  role: "client",
  trainer: { id: "t1", name: "Sam Rivera" },
};

const adds = (input, result) => ({
  request: { query: ADD_CLIENT, variables: { input } },
  result,
});
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

const renderForm = (props, mocks = []) => {
  const onAdded = jest.fn();
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AddClientForm onAdded={onAdded} onCancel={jest.fn()} {...props} />
    </MockedProvider>
  );
  return onAdded;
};

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Add client" }));

describe("AddClientForm", () => {
  it("adds a trainer's client by name and email", async () => {
    const onAdded = renderForm({ chooseTrainer: false, askEmail: true }, [
      adds(
        { name: "Dana Ruiz", email: "dana@example.com" },
        { data: { addClient: added } }
      ),
    ]);
    expect(screen.queryByLabelText("Trainer")).not.toBeInTheDocument();

    type("Name", " Dana Ruiz ");
    type("Email", "dana@example.com");
    submit();

    await waitFor(() =>
      expect(onAdded).toHaveBeenCalledWith(
        expect.objectContaining({ id: "c9" })
      )
    );
  });

  it("has owners choose the trainer before adding", async () => {
    const onAdded = renderForm({ chooseTrainer: true, askEmail: true }, [
      trainers,
      adds(
        { name: "Dana", email: "dana@example.com", trainerId: "t2" },
        { data: { addClient: added } }
      ),
    ]);
    await screen.findByRole("option", { name: "Jordan Patel" });

    type("Name", "Dana");
    type("Email", "dana@example.com");
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Choose a trainer"
    );

    type("Trainer", "t2");
    submit();
    await waitFor(() => expect(onAdded).toHaveBeenCalled());
  });

  it("shows why the server said no", async () => {
    const onAdded = renderForm({ chooseTrainer: false, askEmail: true }, [
      adds(
        { name: "Dana", email: "dana@example.com" },
        {
          errors: [
            new GraphQLError(
              "That email already belongs to an account in a gym."
            ),
          ],
        }
      ),
    ]);

    type("Name", "Dana");
    type("Email", "dana@example.com");
    submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "already belongs to an account"
    );
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("asks only for a name in the demo", async () => {
    const onAdded = renderForm({ chooseTrainer: false, askEmail: false }, [
      adds({ name: "Dana" }, { data: { addClient: added } }),
    ]);
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();

    type("Name", "Dana");
    submit();
    await waitFor(() => expect(onAdded).toHaveBeenCalled());
  });
});
