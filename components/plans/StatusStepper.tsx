import { Colors, FontFamily } from "@/styles/variables";
import styled from "styled-components";
import type { PlanStatus } from "./types";

const STEPS: { status: PlanStatus; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "approved", label: "Approved" },
  { status: "delivered", label: "Sent" },
];

/**
 * Where a plan is in review: draft, approved, sent.
 */
const StatusStepper = ({ status }: { status: PlanStatus }) => {
  const current = STEPS.findIndex((s) => s.status === status);
  return (
    <Steps aria-label="Review status">
      {STEPS.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li
            key={step.status}
            className={state}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="dot" aria-hidden="true">
              {state === "done" ? "✓" : i + 1}
            </span>
            {step.label}
            {state === "done" && (
              <span className="visually-hidden">, done</span>
            )}
          </li>
        );
      })}
    </Steps>
  );
};

const Steps = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: ${FontFamily.display};
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${Colors.midGray};
  }

  li + li::before {
    content: "";
    width: 28px;
    height: 2px;
    margin-right: 6px;
    background: rgba(242, 238, 232, 0.18);
  }

  .dot {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid currentColor;
    font-family: ${FontFamily.primary};
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0;
  }

  li.done {
    color: ${Colors.flag.ok};
  }

  li.current {
    color: ${Colors.lightGray};
  }

  li.current .dot {
    background: ${Colors.brand.accent};
    border-color: ${Colors.brand.accent};
    color: ${Colors.ink};
  }
`;

export default StatusStepper;
