import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import TrainerFilter, { trainersIn } from "./TrainerFilter";

const sam = { id: "t1", name: "Sam Rivera" };
const jordan = { id: "t2", name: "Jordan Patel" };

describe("trainersIn", () => {
  it("lists each trainer once, by name, skipping missing ones", () => {
    expect(trainersIn([sam, null, jordan, sam, undefined])).toEqual([
      jordan,
      sam,
    ]);
  });
});

describe("TrainerFilter", () => {
  it("marks the chosen trainer and reports each choice", () => {
    const onChange = jest.fn();
    render(
      <TrainerFilter
        trainers={[jordan, sam]}
        selected="t1"
        onChange={onChange}
      />
    );

    expect(screen.getByRole("button", { name: "Sam Rivera" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      screen.getByRole("button", { name: "All trainers" })
    ).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "All trainers" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("stays out of the way with only one trainer", () => {
    const { container } = render(
      <TrainerFilter trainers={[sam]} selected={null} onChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
