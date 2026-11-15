import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UPDATE_USERNAME } from "@/helpers/mutations/user";
import UsernameForm from "./UsernameForm";

const save = (username: string, result) => ({
  request: { query: UPDATE_USERNAME, variables: { input: { username } } },
  result,
});

const renderForm = (mocks = [], onSaved = jest.fn()) => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <UsernameForm current="old-name" onCancel={jest.fn()} onSaved={onSaved} />
    </MockedProvider>
  );
  return onSaved;
};

const submitAs = (username: string) => {
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: username },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
};

describe("UsernameForm", () => {
  it("explains the rule instead of sending a username the server would refuse", async () => {
    const onSaved = renderForm();
    submitAs("no spaces!");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Usernames are 3 to 30"
    );
    expect(screen.getByLabelText("Username")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("shows the server's reason when a save fails", async () => {
    const onSaved = renderForm([
      save("taken-name", {
        errors: [new GraphQLError("That username is taken.")],
      }),
    ]);
    submitAs("taken-name");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That username is taken."
    );
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("reports back once the new username is saved", async () => {
    const onSaved = renderForm([
      save("new-name", {
        data: {
          updateUsername: {
            id: "u1",
            createAt: null,
            email: "a@example.invalid",
            image: null,
            name: "A",
            username: "new-name",
          },
        },
      }),
    ]);
    submitAs("  new-name ");

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });
});
